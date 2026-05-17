"""
Parser çıktısının yapısal doğrulaması.

parse_lab_pdf zaten anormallikleri işaretler; bu modül opsiyonel ekstra
kontroller ve tip güvenliği sağlar. Şu an Node tarafı parser çıktısını
doğrudan tüketiyor, bu modül future-proof olarak burada duruyor.
"""
from __future__ import annotations

from typing import Any


REQUIRED_TOP_KEYS = {
    'test_date',
    'test_time',
    'facility',
    'patient',
    'parameters',
    'abnormal_count',
    'extractor_version',
}


class ValidationError(Exception):
    pass


def validate(parsed: dict[str, Any]) -> dict[str, Any]:
    """Çıktı şemasını kontrol et. Hatalıysa fırlat, doğruysa olduğu gibi döner."""
    missing = REQUIRED_TOP_KEYS - set(parsed.keys())
    if missing:
        raise ValidationError(f'Eksik üst seviye alanlar: {missing}')

    if not isinstance(parsed['parameters'], dict):
        raise ValidationError('parameters bir sözlük olmalı')

    for key, param in parsed['parameters'].items():
        if not isinstance(param, dict):
            raise ValidationError(f'parameter {key} dict değil')
        for field in ('value', 'unit', 'ref_min', 'ref_max', 'is_abnormal', 'category', 'raw_label'):
            if field not in param:
                raise ValidationError(f'parameter {key} eksik alan: {field}')

    return parsed
