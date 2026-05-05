/** Standaard post-itgeel; gelijk aan backend-default. */
export const DEFAULT_POST_IT_COLOR = '#FFF59D';

export interface PostItColorOption {
  label: string;
  value: string;
}

export const POST_IT_COLOR_OPTIONS: PostItColorOption[] = [
  { label: 'Geel', value: '#FFF59D' },
  { label: 'Zalm', value: '#FFCCBC' },
  { label: 'Groen', value: '#C8E6C9' },
  { label: 'Blauw', value: '#BBDEFB' },
  { label: 'Lila', value: '#E1BEE7' },
  { label: 'Oranje', value: '#FFE0B2' },
];

/**
 * UI + API: altijd een geldige #RRGGBB-string (zoals de backend @Pattern),
 * canoniek gelijk aan een mat-option waar mogelijk (hoofdletters / varianten).
 */
export function normalizePostItColorHex(raw: string | null | undefined): string {
  const t = raw?.trim();
  if (!t) {
    return DEFAULT_POST_IT_COLOR;
  }
  const match = POST_IT_COLOR_OPTIONS.find(
    (o) => o.value.toUpperCase() === t.toUpperCase(),
  );
  if (match) {
    return match.value;
  }
  return /^#[0-9A-Fa-f]{6}$/.test(t) ? t.toUpperCase() : DEFAULT_POST_IT_COLOR;
}

/** Voor mat-select wanneer API-waarde qua casing verschilt van optie-waarden. */
export function samePostItColorHex(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  return normalizePostItColorHex(a) === normalizePostItColorHex(b);
}
