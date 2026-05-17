"""
Parametre taksonomisi.

Turkish e-Nabız etiketlerini stabil snake_case key + UI kategorisine eşler.
Map'te olmayan parametreler 'unknown' kategorisinde, etiketten türetilmiş
slug ile kaydedilir (kayıp olmaz, sadece tanınmaz).
"""
from __future__ import annotations

import re
import unicodedata

EXTRACTOR_VERSION = '1.0.0'

# (key, category)
PARAMETER_MAP: dict[str, tuple[str, str]] = {
    # Diyabet paneli
    'glike hemoglobin (hb a1c)(y)':  ('glike_hemoglobin', 'diabetes_primary'),
    'glike hemoglobin (hb a1c)':     ('glike_hemoglobin', 'diabetes_primary'),
    'glike hemoglobin':              ('glike_hemoglobin', 'diabetes_primary'),
    'hba1c':                         ('glike_hemoglobin', 'diabetes_primary'),
    'glukoz':                        ('glukoz',           'diabetes_primary'),
    'insulin':                       ('insulin',          'diabetes_primary'),

    # Böbrek
    'kreatinin':                     ('kreatinin', 'kidney'),
    'ure (bun)':                     ('ure_bun',   'kidney'),
    'ure':                           ('ure_bun',   'kidney'),
    'bun':                           ('ure_bun',   'kidney'),
    'egfr':                          ('egfr',      'kidney'),

    # Lipid
    'kolesterol':                    ('kolesterol',     'lipid'),
    'hdl-kolesterol':                ('hdl_kolesterol', 'lipid'),
    'hdl kolesterol':                ('hdl_kolesterol', 'lipid'),
    'ldl-kolesterol':                ('ldl_kolesterol', 'lipid'),
    'ldl kolesterol':                ('ldl_kolesterol', 'lipid'),
    'trigliserid':                   ('trigliserid',    'lipid'),

    # Karaciğer
    'alt':                           ('alt', 'liver'),
    'ast':                           ('ast', 'liver'),

    # Tiroid
    'tsh':                           ('tsh', 'thyroid'),

    # Anemi
    'ferritin':                      ('ferritin', 'anemia'),
    'folat':                         ('folat',    'anemia'),
    'hgb':                           ('hgb',      'anemia'),

    # Hemogram
    'baso':                          ('baso',     'hemogram'),
    'baso%':                         ('baso_pct', 'hemogram'),
    'eos':                           ('eos',      'hemogram'),
    'eos%':                          ('eos_pct',  'hemogram'),
    'hct':                           ('hct',      'hemogram'),
    'lym':                           ('lym',      'hemogram'),
    'lym%':                          ('lym_pct',  'hemogram'),
    'mch':                           ('mch',      'hemogram'),
    'mchc':                          ('mchc',     'hemogram'),
    'mcv':                           ('mcv',      'hemogram'),
    'mono':                          ('mono',     'hemogram'),
    'mono%':                         ('mono_pct', 'hemogram'),
    'mpv':                           ('mpv',      'hemogram'),
    'neu':                           ('neu',      'hemogram'),
    'neu%':                          ('neu_pct',  'hemogram'),
    'pct':                           ('pct_hemogram', 'hemogram'),
    'pdw':                           ('pdw',      'hemogram'),
    'plt':                           ('plt',      'hemogram'),
    'rbc':                           ('rbc',      'hemogram'),
    'rdw':                           ('rdw',      'hemogram'),
    'rdw-sd':                        ('rdw_sd',   'hemogram'),
    'wbc':                           ('wbc',      'hemogram'),
}

# Profil özet kartında öne çıkarılacak parametreler (HonyAI için kritik).
HIGHLIGHT_KEYS: list[str] = [
    'glike_hemoglobin',
    'glukoz',
    'insulin',
    'kreatinin',
    'ldl_kolesterol',
]

CATEGORY_ORDER: list[str] = [
    'diabetes_primary',
    'kidney',
    'lipid',
    'liver',
    'thyroid',
    'anemia',
    'metabolic',
    'hemogram',
    'unknown',
]


def _strip_diacritics(s: str) -> str:
    nfkd = unicodedata.normalize('NFKD', s)
    return ''.join(c for c in nfkd if not unicodedata.combining(c))


def normalize_label(label: str) -> str:
    """Tek yönlü normalleştirme: küçük harf + aksan yok + tek boşluk + trim.

    'İnsülin' → 'insulin', 'Üre (BUN)' → 'ure (bun)'.
    """
    s = label.strip()
    s = s.replace('İ', 'i').replace('ı', 'i')
    s = _strip_diacritics(s)
    s = s.lower()
    s = re.sub(r'\s+', ' ', s)
    return s


def label_to_slug(label: str) -> str:
    """Bilinmeyen parametreler için ad türetir: 'C-Reaktif Protein' → 'c_reaktif_protein'."""
    norm = normalize_label(label)
    slug = re.sub(r'[^\w%]+', '_', norm).strip('_')
    slug = re.sub(r'_+', '_', slug)
    return slug or 'unknown'


def lookup(label: str) -> tuple[str, str] | None:
    """Etiketten (key, category) döndürür; tanınmazsa None."""
    norm = normalize_label(label)
    if norm in PARAMETER_MAP:
        return PARAMETER_MAP[norm]
    # Parantezli sufiksi kırp: 'glike hemoglobin (hb a1c)(y)' → 'glike hemoglobin'
    base = re.sub(r'\s*\(.+?\)', '', norm).strip()
    if base and base in PARAMETER_MAP:
        return PARAMETER_MAP[base]
    return None


def classify(label: str) -> tuple[str, str]:
    """Her zaman (key, category) döndürür. Bilinmeyenler için slug + 'unknown'."""
    found = lookup(label)
    if found:
        return found
    return label_to_slug(label), 'unknown'
