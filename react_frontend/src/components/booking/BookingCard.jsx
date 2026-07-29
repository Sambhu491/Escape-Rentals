import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiCalendar,
  FiUsers,
  FiMapPin,
  FiChevronRight,
  FiXCircle,
  FiCheckCircle,
  FiX,
  FiAlertTriangle,
  FiCreditCard,
  FiShield,
} from "react-icons/fi";
import BookingStatusBadge from "./BookingStatusBadge";
import ImageWithLoader from "../loading/ImageWithLoader/ImageWithLoader";
import ReportUserModal from "../user/ReportUserModal";
import { formatCurrency } from "../../dataFile/currency";
import noImage from "../../assets/noImage.jpg";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const BookingCard = ({
  booking,
  role,
  propertyImage,
  onCancel,
  onApprove,
  onReject,
  onPayNow,
  onHostCancel,
  onAdminConfirmPayment,
  onAdminRejectPayment,
  isCancelling,
  isApproving,
  isRejecting,
  isHostCancelling,
  isAdminConfirmingPayment,
  isAdminRejectingPayment,
}) => {
  const [confirmAction, setConfirmAction] = useState(null);
  const [localError, setLocalError] = useState(null);
  const [showReportGuestModal, setShowReportGuestModal] = useState(false);

  const isPending = booking.status === "PENDING";
  const isPaymentPending = booking.status === "BOOKING_PAYMENT_PENDING";
  const isConfirmed = booking.status === "CONFIRMED";
  const isHostOrAdmin = role === "ROLE_HOST" || role === "ROLE_ADMIN";

  // The guest-cancel endpoint (/cancel) also blocks cancellation once the
  // check-in date has passed — kept identical to the backend rule so the
  // button doesn't invite a click that's guaranteed to fail.
  const isCancellable =
    booking.status === "PENDING" ||
    booking.status === "CONFIRMED" ||
    booking.status === "BOOKING_PAYMENT_PENDING";

  const isHostCancellable = isPaymentPending || isConfirmed;

  const isMutating =
    isCancelling ||
    isApproving ||
    isRejecting ||
    isHostCancelling ||
    isAdminConfirmingPayment ||
    isAdminRejectingPayment;

  const imageSrc = propertyImage || noImage;

  // Runs a prop-provided dispatch handler and surfaces its rejection reason —
  // previously a failed cancel/approve/reject just logged to the console with
  // no on-screen feedback, so a rejected request looked like nothing happened.
  const runAction = async (handler, ...args) => {
    if (!handler) return;
    setLocalError(null);
    const result = await handler(...args);
    if (result?.meta?.requestStatus === "rejected") {
      setLocalError(result.payload || "Something went wrong. Please try again.");
    }
    return result;
  };

  const handleConfirmedAction = async () => {
    if (confirmAction === "cancel") await runAction(onCancel, booking.id);
    if (confirmAction === "reject") await runAction(onReject, booking.id);
    if (confirmAction === "hostCancel") await runAction(onHostCancel, booking.id);
    if (confirmAction === "adminRejectPayment") await runAction(onAdminRejectPayment, booking.id);
    setConfirmAction(null);
  };

  return (
    <div className="group flex flex-col sm:flex-row rounded-xl border border-neutral-200 bg-white overflow-hidden transition-all duration-150 ease-out hover:border-neutral-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]">

      {/* Property Image */}
      <div className="relative w-full sm:w-40 h-44 sm:h-auto shrink-0 overflow-hidden bg-neutral-100">
        <ImageWithLoader
          src={imageSrc}
          alt={booking.propertyTitle || "Property"}
          variant="shimmer"
          className="w-full h-full"
        />
        <div className="absolute top-2.5 left-2.5 z-20">
          <BookingStatusBadge status={booking.status} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 p-4 sm:p-5 flex flex-col">

        {/* Title + Price */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <h3 className="text-[14px] font-semibold text-neutral-900 tracking-tight break-word">
              {booking.propertyTitle || "Untitled Property"}
            </h3>
            <p className="text-[11px] text-neutral-500 font-medium mt-0.5">
              Booking #{booking.id}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[16px] font-bold text-neutral-900 tracking-tight">
              {formatCurrency(booking.totalPrice)}
            </p>
            <p className="text-[10px] text-neutral-500 font-medium">total</p>
          </div>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mb-4">
          <div className="flex items-center gap-1.5 text-[12px] text-neutral-600">
            <FiCalendar size={13} className="text-neutral-500 shrink-0" />
            <span className="berak-word font-medium">
              {formatDate(booking.checkInDate)} → {formatDate(booking.checkOutDate)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-neutral-600">
            <FiUsers size={13} className="text-neutral-500 shrink-0" />
            <span className="font-medium">
              {booking.guestCount} guest{booking.guestCount > 1 ? "s" : ""}
            </span>
          </div>
          {(role === "ROLE_HOST" || role === "ROLE_ADMIN") && booking.guestName && (
            <div className="flex items-center gap-1.5 text-[12px] text-neutral-600 col-span-2">
              <FiMapPin size={13} className="text-neutral-500 shrink-0" />
              <span className="break-word font-medium">
                {booking.guestName}
                {booking.guestEmail && (
                  <span className="text-neutral-400"> · {booking.guestEmail}</span>
                )}
              </span>
              {role === "ROLE_HOST" && booking.guestId && (
                <button
                  onClick={() => setShowReportGuestModal(true)}
                  className="ml-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                >
                  Report
                </button>
              )}
            </div>
          )}
        </div>

        {/* Inline Confirmation Widget */}
        {confirmAction && (
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
            <FiAlertTriangle size={15} className="text-amber-600 shrink-0" />
            <p className="flex-1 text-[12px] font-semibold text-neutral-800">
              {confirmAction === "cancel" && "Cancel this booking?"}
              {confirmAction === "reject" && "Reject this booking request?"}
              {confirmAction === "hostCancel" && "Cancel this reservation? Any payment already made will be refunded."}
              {confirmAction === "adminRejectPayment" && "Reject this payment? The booking will be cancelled."}
            </p>
            <button
              onClick={() => setConfirmAction(null)}
              disabled={isMutating}
              className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-all duration-150 disabled:opacity-40"
            >
              Keep
            </button>
            <button
              onClick={handleConfirmedAction}
              disabled={isMutating}
              className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-white bg-red-600 hover:bg-red-700 transition-all duration-150 disabled:opacity-40 active:scale-[0.97]"
            >
              {confirmAction === "cancel" && (isCancelling ? "Cancelling…" : "Yes, Cancel")}
              {confirmAction === "reject" && (isRejecting ? "Rejecting…" : "Yes, Reject")}
              {confirmAction === "hostCancel" && (isHostCancelling ? "Cancelling…" : "Yes, Cancel")}
              {confirmAction === "adminRejectPayment" && (isAdminRejectingPayment ? "Rejecting…" : "Yes, Reject")}
            </button>
          </div>
        )}

        {/* Error feedback from the last attempted action */}
        {localError && !confirmAction && (
          <p className="mb-3 text-[12px] font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {localError}
          </p>
        )}

        {/* Actions */}
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-3 border-t border-neutral-100">
          <Link
            to={`/properties/${booking.propertyId}`}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-600 hover:text-neutral-900 transition-colors duration-150 ease-out"
          >
            View Property
            <FiChevronRight size={13} />
          </Link>

          <div className="flex-1" />

          {role === "ROLE_USER" && booking.status === "BOOKING_PAYMENT_PENDING" && !confirmAction && (
            <button
              onClick={() => onPayNow?.(booking)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-neutral-900 text-[11px] font-semibold text-white hover:bg-black transition-all duration-150 ease-out active:scale-[0.97]"
            >
              <FiCreditCard size={13} />
              Pay Now
            </button>
          )}

          {role === "ROLE_USER" && isCancellable && !confirmAction && (
            <button
              onClick={() => setConfirmAction("cancel")}
              disabled={isMutating}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-red-200 text-[11px] font-semibold text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 ease-out active:scale-[0.97]"
            >
              <FiXCircle size={13} />
              Cancel
            </button>
          )}

          {/* Confirming/rejecting a PENDING request is identical for host and
              admin — an admin "confirming a booking" is the same action a
              host takes (PENDING -> awaiting payment), never a bypass. */}
          {isHostOrAdmin && isPending && !confirmAction && (
            <button
              onClick={() => runAction(onApprove, booking.id)}
              disabled={isMutating}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-emerald-200 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 ease-out active:scale-[0.97]"
            >
              <FiCheckCircle size={13} />
              {isApproving ? "Confirming…" : "Confirm Booking"}
            </button>
          )}

          {isHostOrAdmin && isPending && !confirmAction && (
            <button
              onClick={() => setConfirmAction("reject")}
              disabled={isMutating}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-red-200 text-[11px] font-semibold text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 ease-out active:scale-[0.97]"
            >
              <FiX size={13} />
              Reject Booking
            </button>
          )}

          {/* Admin-only: reconciling a payment taken outside Razorpay. Distinct
              from confirming the booking request above — this never skips
              the payment step, it only ever applies once one is already
              awaited (BOOKING_PAYMENT_PENDING). */}
          {role === "ROLE_ADMIN" && isPaymentPending && !confirmAction && (
            <button
              onClick={() => runAction(onAdminConfirmPayment, booking.id)}
              disabled={isMutating}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-emerald-200 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 ease-out active:scale-[0.97]"
            >
              <FiShield size={13} />
              {isAdminConfirmingPayment ? "Confirming…" : "Confirm Payment"}
            </button>
          )}

          {role === "ROLE_ADMIN" && isPaymentPending && !confirmAction && (
            <button
              onClick={() => setConfirmAction("adminRejectPayment")}
              disabled={isMutating}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-red-200 text-[11px] font-semibold text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 ease-out active:scale-[0.97]"
            >
              <FiX size={13} />
              Reject Payment
            </button>
          )}

          {/* Host/Admin cancel of an already payment-pending or confirmed
              reservation — refunds automatically if a payment was made. */}
          {isHostOrAdmin && isHostCancellable && !confirmAction && (
            <button
              onClick={() => setConfirmAction("hostCancel")}
              disabled={isMutating}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-red-200 text-[11px] font-semibold text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 ease-out active:scale-[0.97]"
            >
              <FiXCircle size={13} />
              Cancel Booking
            </button>
          )}
        </div>
      </div>

      <ReportUserModal
        userId={booking.guestId}
        userLabel="this guest"
        open={showReportGuestModal}
        onClose={() => setShowReportGuestModal(false)}
      />
    </div>
  );
};

export default BookingCard;
