"""pdfplumber wrapper: PDF → strip edilmiş satır listesi."""
from __future__ import annotations

from pathlib import Path

import pdfplumber


def extract_lines(pdf_path: Path) -> list[str]:
    """Tüm sayfalardan text çıkar, boş satırları at, strip et."""
    lines: list[str] = []
    with pdfplumber.open(str(pdf_path)) as pdf:
        for page in pdf.pages:
            text = page.extract_text() or ''
            for raw in text.split('\n'):
                line = raw.strip()
                if line:
                    lines.append(line)
    return lines
