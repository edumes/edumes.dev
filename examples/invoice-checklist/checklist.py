"""Check a supplier invoice (NF-e XML) against the ERP before it is posted.

Exceptions such as cancellation run first and end the flow. Then every check runs and
records PASSED, FAILED or SKIPPED (skipped when what it depends on already failed), so
the person handling the invoice gets a readable reason, not just a status.
"""

from __future__ import annotations

import re
import xml.etree.ElementTree as ET
from dataclasses import dataclass, field
from decimal import Decimal
from typing import Callable, Protocol

PASSED, FAILED, SKIPPED = "PASSED", "FAILED", "SKIPPED"


class Erp(Protocol):
    """What the checklist needs from the ERP. The check uses an in-memory fake."""

    def key_already_posted(self, key: str) -> bool: ...
    def supplier_exists(self, cnpj: str) -> bool: ...
    def order(self, number: str) -> dict | None: ...  # {"supplier", "approved", "balance"}
    def represents(self, representative: str, supplier: str) -> bool: ...
    def is_discarded_supplier(self, cnpj: str) -> bool: ...


@dataclass
class Item:
    name: str
    result: str
    reason: str = ""


@dataclass
class Outcome:
    status: str  # CANCELLED, DISCARDED, INCONSISTENT or READY
    reason: str = ""
    items: list[Item] = field(default_factory=list)


def local(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def classify(root: ET.Element) -> str:
    return {"nfeProc": "NFE", "NFe": "NFE", "cteProc": "CTE", "CTe": "CTE", "CompNfse": "NFSE", "Nfse": "NFSE"}.get(
        local(root.tag), "UNKNOWN"
    )


def find(root: ET.Element, name: str) -> ET.Element | None:
    return next((e for e in root.iter() if local(e.tag) == name), None)


def text(root: ET.Element, name: str) -> str | None:
    e = find(root, name)
    return e.text.strip() if e is not None and e.text else None


def parse(xml: str) -> dict:
    root = ET.fromstring(xml)
    inf = find(root, "infNFe")
    key = re.sub(r"\D", "", inf.get("Id", "")) if inf is not None else ""
    emit = find(root, "emit")
    return {
        "type": classify(root),
        "key": key,
        "issuer": text(emit, "CNPJ") if emit is not None else None,
        "order": text(root, "xPed"),
        "total": Decimal(text(root, "vNF") or "0"),
    }


def run(xml: str, erp: Erp, cancelled: bool = False) -> Outcome:
    doc = parse(xml)
    if cancelled:
        return Outcome("CANCELLED", "Nota cancelada na origem.")
    if doc["issuer"] and erp.is_discarded_supplier(doc["issuer"]):
        return Outcome("DISCARDED", "Fornecedor fora do fluxo de lançamento.")

    items: list[Item] = []
    order = erp.order(doc["order"]) if doc["order"] else None

    def check(name: str, needs: list[str], test: Callable[[], bool], reason: str) -> None:
        if any(i.result != PASSED for i in items if i.name in needs):
            items.append(Item(name, SKIPPED, "depende de um item que falhou"))
        else:
            ok = test()
            items.append(Item(name, PASSED if ok else FAILED, "" if ok else reason))

    check("Tipo de documento identificado", [], lambda: doc["type"] != "UNKNOWN", "Tipo de documento desconhecido.")
    check("Chave de acesso presente", [], lambda: len(doc["key"]) == 44, "Chave de acesso ausente ou inválida.")
    check("Chave ainda não lançada", ["Chave de acesso presente"], lambda: not erp.key_already_posted(doc["key"]), "Nota já lançada.")
    check("Fornecedor existe no ERP", [], lambda: bool(doc["issuer"]) and erp.supplier_exists(doc["issuer"]), "Fornecedor não cadastrado.")
    check("Pedido identificado no XML", [], lambda: bool(doc["order"]), "Nota sem número de pedido.")
    check("Pedido existe no ERP", ["Pedido identificado no XML"], lambda: order is not None, "Pedido não encontrado.")
    check("Pedido aprovado", ["Pedido existe no ERP"], lambda: order["approved"], "Pedido ainda não aprovado.")
    check("Saldo suficiente", ["Pedido existe no ERP"], lambda: order["balance"] >= doc["total"], "Saldo do pedido menor que o valor da nota.")
    # The supplier is validated by who issued the invoice, not by who was informed as creditor.
    check(
        "Fornecedor confere com o pedido",
        ["Pedido existe no ERP"],
        lambda: order["supplier"] == doc["issuer"] or erp.represents(doc["issuer"], order["supplier"]),
        "Emitente da nota não é o fornecedor do pedido nem seu representante.",
    )

    failed = [i for i in items if i.result == FAILED]
    if failed:
        return Outcome("INCONSISTENT", " ".join(i.reason for i in failed), items)
    return Outcome("READY", "", items)
