"""
CLI entry: Node child_process bunu çağırır.

Kullanım:
    python -m backend.lab_parser.cli <pdf_path>

ya da backend/ dizinindeyken:
    python -m lab_parser.cli <pdf_path>

stdout'a parse sonucu JSON yazar. Hata olursa stderr'a mesaj, exit code != 0.
"""
from __future__ import annotations

import json
import sys
import traceback
from pathlib import Path

from .parser import parse_lab_pdf
from .validator import validate, ValidationError


def main(argv: list[str]) -> int:
    if len(argv) < 2:
        print('Kullanım: python -m lab_parser.cli <pdf_path>', file=sys.stderr)
        return 2

    pdf_path = Path(argv[1])
    if not pdf_path.exists():
        print(f'PDF bulunamadı: {pdf_path}', file=sys.stderr)
        return 3

    try:
        parsed = parse_lab_pdf(pdf_path)
        parsed = validate(parsed)
    except ValidationError as e:
        print(f'Validation hatası: {e}', file=sys.stderr)
        return 4
    except Exception as e:
        print(f'Parse hatası: {e}', file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        return 5

    sys.stdout.write(json.dumps(parsed, ensure_ascii=False))
    sys.stdout.write('\n')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
