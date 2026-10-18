# invoice-checklist

Estudo de caso: [Um checklist automático entre a nota fiscal e o ERP](https://edumes.dev/casos/checklist-notas-fiscais/) · Case study: [An automatic checklist between the invoice and the ERP](https://edumes.dev/en/cases/invoice-checklist/)

**PT** · Confere uma nota fiscal de fornecedor (XML de NF-e) contra o ERP antes do lançamento. Exceções como cancelamento rodam primeiro e encerram o fluxo. Depois, cada item do checklist grava `PASSED`, `FAILED` ou `SKIPPED`. Um item é pulado quando depende de outro que já falhou, para não acusar o mesmo problema várias vezes. A nota sai com um status e um motivo legível para quem vai tratá-la. O fornecedor é validado pelo emitente da nota, não pelo credor informado.

**EN** · Checks a supplier invoice (NF-e XML) against the ERP before it is posted. Exceptions such as cancellation run first and end the flow. Then each checklist item records `PASSED`, `FAILED` or `SKIPPED`. An item is skipped when it depends on one that already failed, so the same problem isn't reported several times. The invoice leaves with a status and a readable reason for whoever handles it. The supplier is validated by who issued the invoice, not by the creditor that was informed.

XMLs, CNPJs e ERP são fictícios. Só biblioteca padrão. / XML, CNPJs and ERP are made up. Standard library only.

```bash
python3 check.py
```

- [checklist.py](checklist.py): `run(xml, erp, cancelled=False)` returns an `Outcome` with status, reason and items.
- [check.py](check.py): an in-memory ERP and six scenarios (clean, low balance, no order, representative, cancelled, duplicate key).
