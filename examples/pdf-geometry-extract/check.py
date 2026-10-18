# /// script
# requires-python = ">=3.10"
# dependencies = ["pdfplumber>=0.11", "fpdf2>=2.7"]
# ///
"""Self-check: builds made-up tax forms and asserts what the extractor does with them.

Run: uv run check.py
"""

import re
import tempfile
from decimal import Decimal
from pathlib import Path

import pdfplumber
from fpdf import FPDF

from extract import MONEY, Unreadable, read_amount, to_decimal


def make_form(path: Path, total: str, totals_row: str, payment: str | None) -> None:
    """A fictional form: two boxes side by side, a breakdown table and an optional payment block."""
    pdf = FPDF(format="A4", unit="pt")
    pdf.add_page()
    pdf.set_font("Helvetica", size=10)
    pdf.text(40, 50, "GUIA DE RECOLHIMENTO FICTICIA")
    pdf.text(40, 66, "Empresa Exemplo Ltda")
    # Two boxes side by side: plain text extraction reads both labels first, then both values.
    pdf.rect(40, 90, 200, 50)
    pdf.text(48, 106, "Valor original")
    pdf.text(48, 126, "1.100,00")
    pdf.rect(240, 90, 200, 50)
    pdf.text(248, 106, "Valor total do documento")
    pdf.text(248, 126, total)
    # Breakdown table with a totals row.
    pdf.text(40, 180, "Codigo")
    pdf.text(120, 180, "Denominacao")
    pdf.text(360, 180, "Principal")
    pdf.text(40, 198, "1099")
    pdf.text(120, 198, "Contribuicao exemplo")
    pdf.text(360, 198, "1.100,00")
    pdf.text(40, 216, "2100")
    pdf.text(120, 216, "Encargos exemplo")
    pdf.text(360, 216, "134,56")
    pdf.text(40, 238, "Totais")
    pdf.text(360, 238, totals_row)
    if payment is not None:
        pdf.text(40, 290, "Valor do pagamento:")
        pdf.text(160, 290, payment)
    pdf.output(str(path))


def naive_amount(path: Path) -> Decimal:
    """What reading the plain text gives you: the first amount after the label."""
    with pdfplumber.open(path) as pdf:
        text = pdf.pages[0].extract_text()
    after = text.split("Valor total do documento", 1)[1]
    return to_decimal(next(t for t in re.split(r"\s+", after) if MONEY.match(t)))


with tempfile.TemporaryDirectory() as tmp:
    ok = Path(tmp, "ok.pdf")
    make_form(ok, total="1.234,56", totals_row="1.234,56", payment="1.234,56")
    assert naive_amount(ok) == Decimal("1100.00"), "the text-order approach should pick the neighbour box"
    assert read_amount(str(ok)) == Decimal("1234.56")
    print("ok: geometry reads 1.234,56 where text order reads 1.100,00")

    no_payment = Path(tmp, "no-payment.pdf")
    make_form(no_payment, total="1.234,56", totals_row="1.234,56", payment=None)
    assert read_amount(str(no_payment)) == Decimal("1234.56")
    print("ok: two agreeing readings are enough when the payment block is absent")

    mismatch = Path(tmp, "mismatch.pdf")
    make_form(mismatch, total="1.234,56", totals_row="1.234,56", payment="1.243,56")
    try:
        read_amount(str(mismatch))
        raise AssertionError("disagreeing readings must not produce an amount")
    except Unreadable as e:
        print(f"ok: refused a form whose readings disagree ({e})")

print("all checks passed")
