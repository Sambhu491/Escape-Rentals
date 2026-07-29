const SectionCard = ({
  title,
  subtitle,
  action,
  actionLabel,
  children,
  className = "",
}) => {
  return (
    <section
      className={`
        rounded-md
        bg-gradient-to-b from-white to-neutral-50/60
        border border-neutral-400
        shadow-sm
        overflow-hidden
        ${className}
      `}
    >
      {(title || subtitle || action) && (
        <header className="flex items-center justify-between px-5 pt-5 pb-2">
          <div className="space-y-0.5">
            {title && (
              <h3
                className="
                  text-[15px]
                  font-semibold
                  tracking-tight
                  text-neutral-900
                "
              >
                {title}
              </h3>
            )}

            {subtitle && (
              <p
                className="
                  text-[12px]
                  font-medium
                  text-neutral-400
                  tracking-wide
                "
              >
                {subtitle}
              </p>
            )}
          </div>

          {action && actionLabel && (
            <button
              onClick={action}
              className="
                text-[12px]
                font-medium
                text-neutral-400
                hover:text-neutral-900
                transition-colors
                duration-150
              "
            >
              {actionLabel}
            </button>
          )}
        </header>
      )}

      <div className="px-4 pb-5 pt-3">{children}</div>
    </section>
  );
};

export default SectionCard;
