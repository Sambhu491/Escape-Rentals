// Shared status badge for account-area entities that don't have their own
// dedicated badge component (Payments, Reports, Review Concerns). Mirrors the
// visual language of PropertyStatusBadge (rounded pill, dot, uppercase label)
// so new admin/payment/review surfaces stay consistent with the property views.

const TONES = {
  neutral: "bg-neutral-100 text-neutral-600 border-neutral-200",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
  amber: "bg-amber-50 text-amber-700 border-amber-200/80",
  red: "bg-red-50 text-red-700 border-red-200/80",
  violet: "bg-violet-50 text-violet-700 border-violet-200/80",
  blue: "bg-blue-50 text-blue-700 border-blue-200/80",
};

const StatusPill = ({ label, tone = "neutral", size = "sm" }) => {
  const sizeClasses = size === "xs" ? "text-[9px] px-2 py-0.5" : "text-[10px] px-2.5 py-0.5";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold border uppercase tracking-wider select-none ${sizeClasses} ${TONES[tone] || TONES.neutral}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
};

export default StatusPill;
