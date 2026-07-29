import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiX, FiCalendar, FiUsers, FiMinus, FiPlus } from "react-icons/fi";

import {
  createBooking,
  selectBookingMutationStatus,
  selectBookingMutationError,
  clearBookingErrors,
} from "../../redux/booking/bookingSlice";

import { formatCurrency } from "../../dataFile/currency";

const BookingModal = ({ open, onClose, property }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const mutationStatus = useSelector(selectBookingMutationStatus);
  const mutationError = useSelector(selectBookingMutationError);

  const today = new Date().toISOString().split("T")[0];

  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [localError, setLocalError] = useState(null);
  
  // New UI Anchor: Prevents the layout from collapsing during re-validation cycles
  const [displayError, setDisplayError] = useState(null);

  const [shouldRender, setShouldRender] = useState(open);
  const [isClosing, setIsClosing] = useState(false);

  // Sync animation states
  useEffect(() => {
    if (open) {
      setShouldRender(true);
      setIsClosing(false);
    } else if (shouldRender) {
      setIsClosing(true);
      const timer = setTimeout(() => setShouldRender(false), 250);
      return () => clearTimeout(timer);
    }
  }, [open, shouldRender]);

  const isSubmitting = mutationStatus.create === "loading";

  // Capture errors safely without clearing them during intermediate 'pending' states
  useEffect(() => {
    if (localError) {
      setDisplayError(localError);
    } else if (mutationError.create) {
      setDisplayError(mutationError.create);
    }
  }, [localError, mutationError.create]);

  // Cleanly wipe errors ONLY when the user modifies form fields
  useEffect(() => {
    setDisplayError(null);
    setLocalError(null);
    if (mutationError.create) {
      dispatch(clearBookingErrors());
    }
  }, [checkInDate, checkOutDate, guestCount, dispatch]);

  // Reset form completely on modal open
  useEffect(() => {
    if (open) {
      setCheckInDate("");
      setCheckOutDate("");
      setGuestCount(1);
      setLocalError(null);
      setDisplayError(null);
      dispatch(clearBookingErrors());
    }
  }, [open, dispatch]);

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Escape key handler
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    if (open) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  // Calculate stays
  const nights =
    checkInDate && checkOutDate
      ? Math.ceil(
          (new Date(checkOutDate) - new Date(checkInDate)) /
            (1000 * 60 * 60 * 24),
        )
      : 0;

  const totalPrice =
    nights > 0 && property?.pricePerNight
      ? nights * Number(property.pricePerNight)
      : 0;

  const validate = useCallback(() => {
    if (!checkInDate || !checkOutDate) {
      setLocalError("Please select both check-in and check-out dates.");
      return false;
    }
    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      setLocalError("Check-out must be after check-in.");
      return false;
    }
    setLocalError(null);
    return true;
  }, [checkInDate, checkOutDate]);

  const handleSubmit = useCallback(() => {
    if (!validate()) return;

    dispatch(
      createBooking({
        propertyId: property.id,
        checkInDate,
        checkOutDate,
        guestCount,
      }),
    ).then((result) => {
      if (createBooking.fulfilled.match(result)) {
        onClose();
        navigate("/account/bookings");
      }
    });
  }, [dispatch, validate, property, checkInDate, checkOutDate, guestCount, onClose, navigate]);

  if (!shouldRender) return null;

  const inputClasses = `
    w-full border border-black/[0.3] rounded-xl px-4 py-3
    text-[13px] text-neutral-900 bg-white outline-none
    focus:border-neutral-300 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.03)]
    transition-all duration-150 ease-out
  `;

  const labelClasses = "block text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-400 mb-2";

  return (
    <>
      <style>{`
        @keyframes bookingSlideUp   { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes bookingSlideDown { from { transform: translateY(0); }    to { transform: translateY(100%); } }
        @keyframes bookingFadeIn     { from { opacity: 0; }                  to { opacity: 1; } }
        @keyframes bookingFadeOut    { from { opacity: 1; }                  to { opacity: 0; } }
        @keyframes bookingScaleIn    { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
        @keyframes bookingScaleOut   { from { opacity: 1; transform: scale(1); }    to { opacity: 0; transform: scale(0.97); } }

        .anim-backdrop      { animation: bookingFadeIn 0.2s ease-out forwards; }
        .anim-backdrop-out  { animation: bookingFadeOut 0.15s ease-in forwards; }
        .anim-panel         { animation: bookingScaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .anim-panel-out     { animation: bookingScaleOut 0.15s ease-in forwards; }

        @media (max-width: 767px) {
          .anim-panel     { animation: bookingSlideUp 0.3s ease-out forwards; }
          .anim-panel-out { animation: bookingSlideDown 0.25s ease-in forwards; }
        }
      `}</style>

      {/* Outer Wrapper */}
      <div
        className={`fixed inset-0 z-[100] flex items-end md:items-center justify-center ${
          isClosing ? "anim-backdrop-out" : "anim-backdrop"
        }`}
      >
        {/* Backdrop Target */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

        {/* Panel Container */}
        <div
          className={`
            relative w-full md:max-w-[480px] bg-white shadow-2xl
            rounded-t-2xl md:rounded-2xl
            h-auto max-h-[85vh] md:max-h-[68vh]
            flex flex-col overflow-hidden
            ${isClosing ? "anim-panel-out" : "anim-panel"}
          `}
        >
          {/* Mobile drag handle */}
          <div className="md:hidden flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-10 h-1 rounded-full bg-neutral-200" />
          </div>

          {/* Header */}
          <header 
          className="flex items-center 
          justify-between px-6 py-4 
          bg-linear-to-b from-white to-gray-100
          border-b border-black/[0.3] shrink-0">
            <div>
              <h2 className="text-[15px] font-semibold text-neutral-900 tracking-tight">
                Reserve this space
              </h2>
              <p className="text-[11px] text-neutral-400 font-medium mt-0.5 truncate max-w-[280px]">
                {property?.title}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 -mr-2 
              text-neutral-800 cursor-pointer
              hover:text-neutral-700 
              transition-colors duration-150"
              aria-label="Close"
            >
              <FiX size={18} />
            </button>
          </header>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {/* Dates Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>
                  <FiCalendar size={12} className="inline mr-1.5 -mt-0.5" />
                  Check-in
                </label>
                <input
                  type="date"
                  min={today}
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>
                  <FiCalendar size={12} className="inline mr-1.5 -mt-0.5" />
                  Check-out
                </label>
                <input
                  type="date"
                  min={checkInDate || today}
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className={inputClasses}
                />
              </div>
            </div>

            {/* Guest Stepper */}
            <div>
              <label className={labelClasses}>
                <FiUsers size={12} className="inline mr-1.5 -mt-0.5" />
                Guests
              </label>
              <div className="flex items-center justify-between 
              border border-black/[0.3] rounded-sm px-4 py-2">
                <button
                  type="button"
                  onClick={() => setGuestCount((c) => Math.max(1, c - 1))}
                  disabled={guestCount <= 1}
                  className="w-8 h-8 rounded-full border 
                  border-black/[0.4] flex items-center 
                  justify-center text-zinc-800 
                  hover:border-neutral-400 
                  disabled:opacity-30 
                  disabled:cursor-not-allowed 
                  transition-all duration-150 cursor-pointer"
                >
                  <FiMinus size={14} />
                </button>
                <span className="text-[14px] font-semibold text-neutral-900">{guestCount}</span>
                <button
                  type="button"
                  onClick={() => setGuestCount((c) => Math.min(property?.maxGuests || 10, c + 1))}
                  disabled={guestCount >= (property?.maxGuests || 10)}
                  className="w-8 h-8 rounded-full 
                  border border-black/[0.4] 
                  flex items-center justify-center 
                  text-neutral-800 hover:border-neutral-400  
                  disabled:opacity-30 cursor-pointer
                  disabled:cursor-not-allowed 
                  transition-all duration-150"
                >
                  <FiPlus size={14} />
                </button>
              </div>
              <p className="text-[10px] text-neutral-400 mt-1.5 font-medium">
                Max {property?.maxGuests || "—"} guests · includes you
              </p>
            </div>

            {/* Prices */}
            {nights > 0 && (
              <div className="rounded-xl bg-black/[0.05] 
              border border-black/[0.3] p-4 space-y-2">
                <div className="flex justify-between 
                text-[12px] text-neutral-600">
                  <span>
                    {formatCurrency(property?.pricePerNight)} × {nights} night
                    {nights > 1 ? "s" : ""}
                  </span>
                  <span className="font-medium text-neutral-700">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
                <div className="border-t border-black/[0.3] pt-2.5 flex justify-between">
                  <span className="text-[13px] font-semibold text-neutral-900">Total</span>
                  <span className="text-[13px] font-semibold text-neutral-900">{formatCurrency(totalPrice)}</span>
                </div>
              </div>
            )}

            {/* Error Container - Renders displayError to guarantee visual stability */}
            {displayError && (
              <div className="transition-opacity duration-150 ease-out opacity-100">
                <p className="text-[12px] font-medium 
                text-red-500 bg-red-500/[0.05] 
                border border-red-500/[0.1] rounded-xl px-4 py-3">
                  {displayError}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="shrink-0 px-6 py-4 border-t 
          border-black/[0.05] bg-white">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !checkInDate || !checkOutDate}
              className="
                w-full py-3.5 rounded-sm
                bg-neutral-900 text-white
                text-[11px] font-bold uppercase tracking-[0.15em]
                hover:bg-black
                disabled:opacity-30 disabled:cursor-not-allowed
                transition-all duration-150 ease-out
                active:scale-[0.98] cursor-pointer
              "
            >
              {isSubmitting ? "Confirming…" : "Confirm Booking"}
            </button>
          </footer>
        </div>
      </div>
    </>
  );
};

export default BookingModal;