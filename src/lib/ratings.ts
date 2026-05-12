type FormattableRating = {
  toString(): string;
};

export function formatRating(rating: FormattableRating | number | string) {
  const normalizedRating = Number(rating.toString());

  if (!Number.isFinite(normalizedRating)) {
    return rating.toString();
  }

  return new Intl.NumberFormat("es", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(normalizedRating);
}

export function ratingInputValue(rating: FormattableRating | number | string) {
  const value = rating.toString();

  return value.includes(".") ? value.replace(/0+$/, "").replace(/\.$/, "") : value;
}
