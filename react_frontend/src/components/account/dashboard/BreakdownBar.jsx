// Part-to-whole stacked bar for status/role breakdowns (booking status,
// payment status, property status, account roles). Segment color is assigned
// by fixed categorical slot order — the same category always gets the same
// color everywhere it appears on the dashboard — never re-cycled per chart.
// Palette + spacing follow the project's dataviz skill: 2px surface gaps
// between segments, rounded whole-bar ends, legend always present (never
// color-alone identity), values shown as direct labels in the legend.
const SLOT_COLORS = [
  "#2a78d6", // slot 1 — blue
  "#eb6834", // slot 2 — orange
  "#1baf7a", // slot 3 — aqua
  "#eda100", // slot 4 — yellow
  "#e87ba4", // slot 5 — magenta
  "#4a3aa7", // slot 6 — violet
];

const BreakdownBar = ({ title, subtitle, segments }) => {
  const data = segments.filter((s) => s.value > 0);
  const total = segments.reduce((sum, s) => sum + (s.value || 0), 0);

  return (
    <div className="space-y-3">
      {(title || subtitle) && (
        <div>
          {title && <p className="text-[13px] font-semibold text-neutral-900">{title}</p>}
          {subtitle && <p className="text-[11px] text-neutral-400">{subtitle}</p>}
        </div>
      )}

      {total === 0 ? (
        <div className="h-2 w-full rounded-full bg-neutral-100" />
      ) : (
        <div className="flex h-2 w-full overflow-hidden rounded-full">
          {data.map((s, i) => (
            <div
              key={s.label}
              title={`${s.label}: ${s.value} (${Math.round((s.value / total) * 100)}%)`}
              style={{
                width: `${(s.value / total) * 100}%`,
                backgroundColor: SLOT_COLORS[segments.indexOf(s) % SLOT_COLORS.length],
                marginRight: i === data.length - 1 ? 0 : 2,
              }}
              className="h-full first:rounded-l-full last:rounded-r-full"
            />
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {segments.map((s, idx) => (
          <div key={s.label} className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: SLOT_COLORS[idx % SLOT_COLORS.length] }}
            />
            <span className="text-[11px] text-neutral-500">
              {s.label} <span className="font-semibold text-neutral-900">{s.value}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BreakdownBar;
