export default function Stars({ rating, count }: { rating: number; count?: number }) {
  const rounded = Math.round(rating);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span className="stars" aria-hidden="true">
        {"★".repeat(rounded)}
        {"☆".repeat(5 - rounded)}
      </span>
      <span className="stars-count">
        {rating.toFixed(1)}
        {count === undefined ? "" : ` (${count})`}
      </span>
      <span className="sr-only">
        Rated {rating} out of 5{count === undefined ? "" : ` from ${count} reviews`}
      </span>
    </span>
  );
}
