const STATUS_CONFIG = {
  BOOKING_PAYMENT_PENDING: {
    label: "Payment Pending",
  },
  PENDING: {
    label: "Pending",
  },
  CONFIRMED: {
    label: "Confirmed",
  },
  COMPLETED: {
    label: "Completed",
  },
  GUEST_CANCELLED: {
    label: "Cancelled",
  },
  HOST_CANCELLED: {
    label: "Host Cancelled",
  },
  EXPIRED: {
    label: "Expired",
  },
};

const BookingStatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.EXPIRED;

  return (
    <span
      className={`
        inline-flex items-center rounded-sm
        border px-2 py-0.5
        text-[10px] font-semibold uppercase tracking-wider
        select-none whitespace-nowrap 
        text-white bg-zinc-800 border-zinc-700/[0.12]
      `}
    >
      {config.label}
    </span>
  );
};

export default BookingStatusBadge;