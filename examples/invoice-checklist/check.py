"""Self-check with made-up invoices and an in-memory ERP. Run: python3 check.py"""

from decimal import Decimal

from checklist import FAILED, PASSED, SKIPPED, run

SUPPLIER = "11222333000181"  # fictional
OTHER = "99888777000166"  # fictional
KEY = "35" + "0" * 40 + "12"  # fictional 44-digit access key


def nfe(order: str | None = "PC-1001", issuer: str = SUPPLIER, total: str = "1500.00", key: str = KEY) -> str:
    ped = f"<xPed>{order}</xPed>" if order else ""
    return f"""<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe"><NFe><infNFe Id="NFe{key}">
      <emit><CNPJ>{issuer}</CNPJ><xNome>Fornecedor Exemplo</xNome></emit>
      <det nItem="1"><prod><xProd>Cimento exemplo</xProd>{ped}</prod></det>
      <total><ICMSTot><vNF>{total}</vNF></ICMSTot></total>
    </infNFe></NFe></nfeProc>"""


class FakeErp:
    posted = {"35" + "9" * 42}
    suppliers = {SUPPLIER, OTHER}
    orders = {"PC-1001": {"supplier": SUPPLIER, "approved": True, "balance": Decimal("2000.00")}}
    representatives = {(OTHER, SUPPLIER)}
    discarded: set[str] = set()

    def key_already_posted(self, key): return key in self.posted
    def supplier_exists(self, cnpj): return cnpj in self.suppliers
    def order(self, number): return self.orders.get(number)
    def represents(self, rep, supplier): return (rep, supplier) in self.representatives
    def is_discarded_supplier(self, cnpj): return cnpj in self.discarded


erp = FakeErp()
results = lambda o: {i.name: i.result for i in o.items}

ok = run(nfe(), erp)
assert ok.status == "READY" and all(r == PASSED for r in results(ok).values()), ok
print("ok: a clean invoice passes every item")

low = run(nfe(total="2500.00"), erp)
assert low.status == "INCONSISTENT" and results(low)["Saldo suficiente"] == FAILED
assert "Saldo do pedido" in low.reason
print(f"ok: not enough balance -> {low.status}: {low.reason}")

no_order = run(nfe(order=None), erp)
r = results(no_order)
assert r["Pedido identificado no XML"] == FAILED
assert r["Pedido existe no ERP"] == r["Pedido aprovado"] == r["Saldo suficiente"] == SKIPPED
print("ok: without an order number, the items that depend on it are SKIPPED, not FAILED")

via_rep = run(nfe(issuer=OTHER), erp)
assert via_rep.status == "READY", via_rep
print("ok: an invoice issued by the supplier's registered representative is accepted")

cancelled = run(nfe(), erp, cancelled=True)
assert cancelled.status == "CANCELLED" and cancelled.items == []
print("ok: cancellation ends the flow before any check runs")

dup = run(nfe(key="35" + "9" * 42), erp)
assert results(dup)["Chave ainda não lançada"] == FAILED
print("ok: an access key that was already posted is caught")

print("all checks passed")
