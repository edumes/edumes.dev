"""Read amounts from a PDF by printed label and position on the page, not by text order.

Side-by-side boxes come out of plain text extraction interleaved in unpredictable order,
so "the first number after the label" is often the wrong number. Here each value is found
geometrically: locate the label's bounding box, then take the amount directly below it or
on the same line to its right.

The amount that matters is read from up to three independent places. Every reading that
was found must agree, otherwise the document is treated as unreadable: stopping for a
human is better than acting on the wrong number.
"""

from __future__ import annotations

import re
from decimal import Decimal

import pdfplumber

MONEY = re.compile(r"^\d{1,3}(?:\.\d{3})*,\d{2}$")  # Brazilian format: 1.234,56


class Unreadable(Exception):
    """The readings disagree or the main one is missing."""


def to_decimal(text: str) -> Decimal:
    return Decimal(text.replace(".", "").replace(",", "."))


def find_label(words: list[dict], label: str) -> tuple[float, float, float, float] | None:
    """Bounding box (x0, top, x1, bottom) of a multi-word label printed on one line."""
    parts = label.split()
    for i, first in enumerate(words):
        seq = words[i : i + len(parts)]
        if [w["text"] for w in seq] == parts and all(abs(w["top"] - first["top"]) < 2 for w in seq):
            return seq[0]["x0"], first["top"], seq[-1]["x1"], max(w["bottom"] for w in seq)
    return None


def money_below(words: list[dict], label: str, max_gap: float = 30) -> Decimal | None:
    """The amount printed under the label, inside the label's column."""
    box = find_label(words, label)
    if not box:
        return None
    x0, _, x1, bottom = box
    hits = [
        w
        for w in words
        if MONEY.match(w["text"]) and 0 <= w["top"] - bottom <= max_gap and w["x1"] > x0 and w["x0"] < x1 + 20
    ]
    return to_decimal(min(hits, key=lambda w: w["top"])["text"]) if hits else None


def money_right_of(words: list[dict], label: str) -> Decimal | None:
    """The first amount on the same line, to the right of the label."""
    box = find_label(words, label)
    if not box:
        return None
    _, top, x1, _ = box
    hits = [w for w in words if MONEY.match(w["text"]) and abs(w["top"] - top) < 3 and w["x0"] > x1]
    return to_decimal(min(hits, key=lambda w: w["x0"])["text"]) if hits else None


def read_amount(path: str) -> Decimal:
    """The document total, read three ways. Raises Unreadable unless the readings agree."""
    with pdfplumber.open(path) as pdf:
        words = pdf.pages[0].extract_words()
    readings = {
        "total box": money_below(words, "Valor total do documento"),
        "totals row": money_right_of(words, "Totais"),
        "payment block": money_right_of(words, "Valor do pagamento:"),  # optional on some forms
    }
    found = {k: v for k, v in readings.items() if v is not None}
    if readings["total box"] is None or len(found) < 2:
        raise Unreadable(f"not enough readings: {readings}")
    if len(set(found.values())) != 1:
        raise Unreadable(f"readings disagree: {found}")
    return readings["total box"]
