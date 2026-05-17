import { LabParameter } from '../../types';

/**
 * Profilde gösterilecek öne çıkan parametrelerin UI metadatası.
 * Backend tarafındaki LAB_HIGHLIGHT_KEYS ile aynı set.
 */
export const HIGHLIGHT_META: Record<string, { label: string; defaultUnit: string }> = {
  glike_hemoglobin: { label: 'HbA1c',         defaultUnit: '%' },
  glukoz:           { label: 'Açlık Glukoz',  defaultUnit: 'mg/dL' },
  insulin:          { label: 'İnsülin',       defaultUnit: 'mU/L' },
  kreatinin:        { label: 'Kreatinin',     defaultUnit: 'mg/dL' },
  ldl_kolesterol:   { label: 'LDL',           defaultUnit: 'mg/dL' },
};

export const HIGHLIGHT_ORDER = [
  'glike_hemoglobin',
  'glukoz',
  'insulin',
  'kreatinin',
  'ldl_kolesterol',
];

export const CATEGORY_ORDER: string[] = [
  'diabetes_primary',
  'kidney',
  'lipid',
  'liver',
  'thyroid',
  'anemia',
  'metabolic',
  'hemogram',
  'unknown',
];

export const CATEGORY_NAMES: Record<string, string> = {
  diabetes_primary: 'Diyabet',
  kidney:           'Böbrek Fonksiyonu',
  lipid:            'Lipid Profili',
  liver:            'Karaciğer',
  thyroid:          'Tiroid',
  anemia:           'Anemi Paneli',
  metabolic:        'Metabolik',
  hemogram:         'Hemogram',
  unknown:          'Diğer',
};

export function formatValue(value: number): string {
  // Tamsayıları 1 noktasız, küsuratlıları en fazla 2 hane göster.
  if (Number.isInteger(value)) return String(value);
  const rounded = Math.round(value * 100) / 100;
  return String(rounded).replace('.', ',');
}

export function formatReferenceRange(p: Pick<LabParameter, 'refMin' | 'refMax' | 'unit'>): string {
  if (p.refMin == null && p.refMax == null) return 'Referans yok';
  const min = p.refMin != null ? formatValue(p.refMin) : '?';
  const max = p.refMax != null ? formatValue(p.refMax) : '?';
  const unit = p.unit ? ' ' + p.unit : '';
  return `${min} - ${max}${unit}`;
}

/**
 * 'YYYY-MM-DD' veya 'YYYY-MM-DD HH:MM:SS' formatındaki bir string'i
 * 'DD Aylık YYYY' formatına çevirir. Türkçe ay adları.
 */
const TR_MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

export function formatTrDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  // 'YYYY-MM-DD' veya 'YYYY-MM-DD HH:MM:SS' ya da 'YYYY-MM-DDTHH:MM:SS'
  const parts = iso.slice(0, 10).split('-');
  if (parts.length !== 3) return iso;
  const [y, m, d] = parts;
  const mi = parseInt(m, 10) - 1;
  if (Number.isNaN(mi) || mi < 0 || mi > 11) return iso;
  return `${parseInt(d, 10)} ${TR_MONTHS[mi]} ${y}`;
}

/**
 * Param'ın anormal-yönünü döner (yüksek / düşük / normal).
 * UI'da farklı bir ikon göstermek için kullanılabilir.
 */
export function abnormalDirection(p: Pick<LabParameter, 'value' | 'refMin' | 'refMax'>):
  'low' | 'high' | 'normal' {
  if (p.refMin != null && p.value < p.refMin) return 'low';
  if (p.refMax != null && p.value > p.refMax) return 'high';
  return 'normal';
}
