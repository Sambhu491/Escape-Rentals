// Meter form (dataviz skill: "a single ratio against a limit") for the
// averageRating fields — the fill and unfilled track are the same blue ramp
// (accent on a lighter step of itself), not two unrelated colors.
const RatingMeter = ({ label, value }) => {
  const rating = Number(value) || 0;
  const pct = Math.max(0, Math.min(1, rating / 5)) * 100;

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <p className="text-[12px] font-medium text-neutral-400">{label}</p>
        <p className="text-[13px] font-semibold text-neutral-900">{rating.toFixed(1)} / 5</p>
      </div>
      <div className="h-2 w-full rounded-full" style={{ backgroundColor: "#cde2fb" }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: "#2a78d6" }}
        />
      </div>
    </div>
  );
};

export default RatingMeter;
