/** "€2,400 – 3,200" · min-only → "from €2,400" handled by caller copy. */
export function formatSalaryRange(
  locale: string,
  min: number | null,
  max: number | null,
  currency: string | null,
): string | null {
  if (!min || !currency) return null;
  const withCurrency = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });
  if (!max || max === min) return withCurrency.format(min);
  const plain = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
  return `${withCurrency.format(min)} – ${plain.format(max)}`;
}
