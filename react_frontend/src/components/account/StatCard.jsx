const colorMap = {
  blue: {
    icon: "text-blue-500",
    bg: "bg-blue-500/[0.08]",
  },

  emerald: {
    icon: "text-emerald-500",
    bg: "bg-emerald-500/[0.08]",
  },

  green: {
    icon: "text-green-500",
    bg: "bg-green-500/[0.08]",
  },

  red: {
    icon: "text-red-400",
    bg: "bg-red-400/[0.08]",
  },

  purple: {
    icon: "text-purple-500",
    bg: "bg-purple-500/[0.08]",
  },

  amber: {
    icon: "text-amber-500",
    bg: "bg-amber-500/[0.08]",
  },

  orange: {
    icon: "text-orange-500",
    bg: "bg-orange-500/[0.08]",
  },

  rose: {
    icon: "text-rose-400",
    bg: "bg-rose-400/[0.08]",
  },
};

const StatCard = ({ title, value, icon: Icon, color = "blue" }) => {
  const c = colorMap[color] || colorMap.blue;

  return (
    <div
      className="
        flex items-center gap-3.5
        rounded-md
        p-4
        transition-colors
        duration-150
        hover:bg-neutral-50
      "
    >
      <div
        className={`
          flex
          items-center
          justify-center
          w-9
          h-9
          rounded-lg
          ${c.bg}
          shrink-0
        `}
      >
        <Icon size={17} strokeWidth={2} className={c.icon} />
      </div>

      <div className="min-w-0">
        <p
          className="
            text-[21px]
            font-semibold
            tracking-tight
            leading-none
            text-neutral-900
          "
        >
          {value ?? "—"}
        </p>

        <p
          className="
            text-[12px]
            font-medium
            text-neutral-400
            mt-1
            truncate
          "
        >
          {title}
        </p>
      </div>
    </div>
  );
};

export default StatCard;
