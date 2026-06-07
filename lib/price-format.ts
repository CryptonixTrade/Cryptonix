export function getPricePrecision(value: unknown) {
  const price = Math.abs(Number(value || 0));

  if (!Number.isFinite(price) || price === 0) return 2;
  if (price < 0.001) return 8;
  if (price < 1) return 6;
  if (price < 100) return 4;
  if (price < 1000) return 3;

  return 2;
}

export function getPriceMinMove(value: unknown) {
  return 1 / 10 ** getPricePrecision(value);
}

export function formatPrice(value: unknown, options?: { grouped?: boolean }) {
  const price = Number(value || 0);

  if (!Number.isFinite(price) || price === 0) return "--";

  const decimals = getPricePrecision(price);

  if (options?.grouped) {
    return price.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  return price.toFixed(decimals);
}
