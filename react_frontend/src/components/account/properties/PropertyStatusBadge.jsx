import React from 'react';

const badgeConfigs = {
  AVAILABLE: {
    label: 'Available',
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  },
  UNAVAILABLE: {
    label: 'Unavailable',
    classes: 'bg-red-50 text-red-700 border-red-200/80',
  },
  UNDER_MAINTENANCE: {
    label: 'Maintenance',
    classes: 'bg-amber-50 text-amber-700 border-amber-200/80',
  },
};

const PropertyStatusBadge = ({ status, deleted = false, size = 'sm' }) => {
  if (deleted) {
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white uppercase tracking-wider shadow-2xs select-none">
        Deleted
      </span>
    );
  }

  const config = badgeConfigs[status] || {
    label: status ? status.replaceAll('_', ' ') : 'Unknown',
    classes: 'bg-neutral-100 text-neutral-600 border-neutral-200',
  };

  const sizeClasses = size === 'xs' ? 'text-[9px] px-2 py-0.5' : 'text-[10px] px-2.5 py-0.5';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold border uppercase tracking-wider transition-colors select-none ${sizeClasses} ${config.classes}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {config.label}
    </span>
  );
};

export default PropertyStatusBadge;
