"""
e-Nabız tahlil PDF parser.

Ana fonksiyon: parse_lab_pdf(path) → dict.

Stratejisi:
1. pdfplumber ile sayfaları text'e çevir.
2. İlk satırlarda hasta header'larını ara (Ad/Soyad, Cinsiyet, Tarih, Doğum Tarihi, Sağlık Tesisi).
3. Geri kalan satırlarda:
   - 'dd.mm.yyyy HH:MM' kalıbını gör → mevcut test tarihi/saati olarak ayarla.
   - 'Param 12,3 unit ref_min - ref_max' kalıbını parse et (param/değer/birim/ref).
   - Kendi başına bir ref satırı ise (Ferritin'in 2. satırı gibi) önceki parametreye iliştir.
"""
from __future__ import annotations

import re
from pathlib import Path
from typing import Any

from .config import EXTRACTOR_VERSION, classify
from .pdf_extractor import extract_lines

NUM = r'-?\d+(?:[.,]\d+)?'
REF_TAIL_RE = re.compile(rf'({NUM})\s*-\s*({NUM})\s*$')
LONE_REF_RE  = re.compile(rf'^\s*({NUM})\s*-\s*({NUM})\s*$')
NUMBER_RE = re.compile(rf'^{NUM}$')
SECTION_DATE_RE = re.compile(r'(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}:\d{2})')
DDMMYYYY_RE = re.compile(r'(\d{2})\.(\d{2})\.(\d{4})')

# Header line patterns (page 1 üst kısmı)
NAME_GENDER_RE = re.compile(
    r'(?:Adı?\/?\s*Soyadı?|Ad\s*\/\s*Soyad)\s*:\s*(.+?)\s+Cinsiyet\s*:\s*(\S+)',
    re.IGNORECASE,
)
DATE_BIRTH_RE = re.compile(
    r'Tarih\s*:\s*(\d{2}\.\d{2}\.\d{4})(?:\s+Doğum\s+Tarihi\s*:\s*(\d{2}\.\d{2}\.\d{4}))?',
    re.IGNORECASE,
)
FACILITY_RE = re.compile(r'Sağlık\s+Tesisi\s*:\s*(.+)', re.IGNORECASE)


def _to_iso(ddmmyyyy: str) -> str | None:
    m = DDMMYYYY_RE.match(ddmmyyyy)
    if not m:
        return None
    day, month, year = m.groups()
    return f'{year}-{month}-{day}'


def _parse_number(s: str) -> float:
    return float(s.replace(',', '.'))


def _extract_header(lines: list[str]) -> dict[str, Any]:
    """İlk 25 satırda hasta/tesis bilgilerini bul."""
    info: dict[str, Any] = {
        'patient': {'name': None, 'gender': None, 'birth_date': None},
        'report_date': None,
        'facility': None,
    }
    horizon = min(len(lines), 25)
    for line in lines[:horizon]:
        if info['patient']['name'] is None:
            m = NAME_GENDER_RE.search(line)
            if m:
                info['patient']['name'] = m.group(1).strip()
                info['patient']['gender'] = m.group(2).strip()
                continue
        if info['report_date'] is None:
            m = DATE_BIRTH_RE.search(line)
            if m:
                info['report_date'] = _to_iso(m.group(1))
                if m.group(2):
                    info['patient']['birth_date'] = _to_iso(m.group(2))
                continue
        if info['facility'] is None:
            m = FACILITY_RE.search(line)
            if m:
                info['facility'] = m.group(1).strip()
                continue
    return info


def _looks_like_unit(token: str) -> bool:
    """Sayı değil ve en az 1 karakteri olan 'birim' adayı (mg/dL, %, fl, K/mm3, vb.)."""
    if not token:
        return False
    if NUMBER_RE.match(token):
        return False
    # En az 1 alfabetik/% karakter içersin
    if not re.search(r'[A-Za-zµ%]', token):
        return False
    return True


def _parse_data_row(line: str) -> dict[str, Any] | None:
    """'PLT 211 Kmm/3 100 - 400' gibi satırı parse et. Eşleşmezse None."""
    # Sayı içermiyorsa kesin değil
    if not re.search(r'\d', line):
        return None

    ref_min = ref_max = None
    work = line

    # 1) Son tarafta 'min - max' var mı?
    m = REF_TAIL_RE.search(work)
    if m:
        ref_min = _parse_number(m.group(1))
        ref_max = _parse_number(m.group(2))
        work = work[:m.start()].rstrip()

    tokens = work.split()
    if len(tokens) < 2:
        return None

    # Son token sayıysa: birim yok. Aksi halde son = birim, sondan 2. = değer.
    if NUMBER_RE.match(tokens[-1]):
        try:
            value = _parse_number(tokens[-1])
        except ValueError:
            return None
        unit = None
        label_tokens = tokens[:-1]
    else:
        if len(tokens) < 2 or not NUMBER_RE.match(tokens[-2]):
            return None
        if not _looks_like_unit(tokens[-1]):
            return None
        try:
            value = _parse_number(tokens[-2])
        except ValueError:
            return None
        unit = tokens[-1]
        label_tokens = tokens[:-2]

    label = ' '.join(label_tokens).strip()
    if not label:
        return None

    # Header/section satırlarını eleyelim
    if label.lower().startswith('tam kan'):
        return None
    if NUMBER_RE.match(label):
        return None

    return {
        'label': label,
        'value': value,
        'unit': unit,
        'ref_min': ref_min,
        'ref_max': ref_max,
    }


def _is_section_marker(line: str) -> tuple[str, str] | None:
    """'24.03.2026 09:36 [...]' → (iso_date, time) veya None."""
    m = SECTION_DATE_RE.search(line)
    if not m:
        return None
    day, month, year, time = m.groups()
    return f'{year}-{month}-{day}', time


def parse_lab_pdf(path: str | Path) -> dict[str, Any]:
    """PDF dosyasını parse eder, structured dict döner.

    Dönüş şeması:
    {
      "test_date": "2026-03-24",
      "test_time": "09:36",
      "facility": "...",
      "patient": { "name": ..., "gender": ..., "birth_date": ... },
      "parameters": {
        "ldl_kolesterol": {
          "raw_label": "LDL-Kolesterol", "value": 145.0, "unit": "mg/dl",
          "ref_min": 0.0, "ref_max": 130.0,
          "is_abnormal": true, "category": "lipid"
        }, ...
      },
      "abnormal_count": 3,
      "extractor_version": "1.0.0"
    }
    """
    pdf_path = Path(path)
    if not pdf_path.exists():
        raise FileNotFoundError(f'PDF bulunamadı: {pdf_path}')

    lines = extract_lines(pdf_path)
    header = _extract_header(lines)

    parameters: dict[str, dict[str, Any]] = {}
    last_param_key: str | None = None
    current_test_date: str | None = header.get('report_date')
    current_test_time: str | None = None

    # Header'daki tarih satırlarını parametrelere dahil etmemek için
    # ilk birkaç hasta-header satırını es geç (basit yaklaşım: 'Sağlık Tesisi'ne kadar)
    start_idx = 0
    for i, line in enumerate(lines[:30]):
        if FACILITY_RE.search(line):
            start_idx = i + 1
            break

    for line in lines[start_idx:]:
        # Tablo başlığını atla
        if re.match(r'^Tarih\s+Tahlil\s+Sonu', line):
            continue
        # Sayfa altbilgileri (Sayfa x / y, enabiz.gov.tr vb.)
        if re.match(r'^(Sayfa|enabiz|0\s*850)', line, re.IGNORECASE):
            continue

        # Section başlığı? (tarih + saat içeren satır)
        section = _is_section_marker(line)
        if section:
            current_test_date, current_test_time = section
            last_param_key = None
            continue

        # Yalnızca ref aralığı içeren satır → önceki parametreye iliştir
        m = LONE_REF_RE.match(line)
        if m and last_param_key and parameters[last_param_key]['ref_min'] is None:
            parameters[last_param_key]['ref_min'] = _parse_number(m.group(1))
            parameters[last_param_key]['ref_max'] = _parse_number(m.group(2))
            continue

        row = _parse_data_row(line)
        if not row:
            continue

        key, category = classify(row['label'])
        # Aynı parametre tekrar görünürse, ref'i daha iyi olanı tut ya da ilkini koru.
        if key in parameters:
            existing = parameters[key]
            # ref bilgisi yoksa yeni satır onu doldurabilir
            if existing['ref_min'] is None and row['ref_min'] is not None:
                existing['ref_min'] = row['ref_min']
                existing['ref_max'] = row['ref_max']
            last_param_key = key
            continue

        parameters[key] = {
            'raw_label': row['label'],
            'value': row['value'],
            'unit': row['unit'],
            'ref_min': row['ref_min'],
            'ref_max': row['ref_max'],
            'category': category,
            'is_abnormal': False,
        }
        last_param_key = key

    # Anormallik flagleri
    abnormal_count = 0
    for p in parameters.values():
        rmin, rmax, val = p['ref_min'], p['ref_max'], p['value']
        if rmin is not None and val < rmin:
            p['is_abnormal'] = True
        elif rmax is not None and val > rmax:
            p['is_abnormal'] = True
        if p['is_abnormal']:
            abnormal_count += 1

    return {
        'test_date': current_test_date,
        'test_time': current_test_time,
        'facility': header.get('facility'),
        'patient': header['patient'],
        'parameters': parameters,
        'abnormal_count': abnormal_count,
        'extractor_version': EXTRACTOR_VERSION,
    }
