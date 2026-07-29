import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPropertyAvailability,
  selectAvailability,
  selectPropertyFetchStatus,
} from "../../redux/property/propertySlice";

export default function AvailabilityModal({ propertyId, open, onClose }) {
  const dispatch = useDispatch();

  const availability = useSelector(selectAvailability);
  const fetchStatus = useSelector(selectPropertyFetchStatus);

  const loading = fetchStatus.availability === "loading";

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  // Close on Escape
  useEffect(() => {
    if (!open) return;

    const handleEsc = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => window.removeEventListener("keydown", handleEsc);
  }, [open]);

  const handleCheck = () => {
    if (!checkIn || !checkOut) return;

    dispatch(
      fetchPropertyAvailability({
        id: propertyId,
        from: checkIn,
        to: checkOut,
      }),
    );
  };

  const handleClose = () => {
    setCheckIn("");
    setCheckOut("");
    onClose();
  };

  if (!open) return null;

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded bg-white p-6 shadow-xl"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold">Check Availability</h2>

          <button
            onClick={handleClose}
            className="text-neutral-500 hover:text-black text-xl leading-none cursor-pointer"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">
              Check-in
            </label>

            <input
              type="date"
              value={checkIn}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full border border-neutral-300 rounded px-3 py-2 text-sm outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">
              Check-out
            </label>

            <input
              type="date"
              value={checkOut}
              min={checkIn || new Date().toISOString().split("T")[0]}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full border border-neutral-300 rounded px-3 py-2 text-sm outline-none focus:border-black"
            />
          </div>

          <button
            disabled={!checkIn || !checkOut || loading}
            onClick={handleCheck}
            className={`w-full py-2.5 rounded text-sm font-semibold transition
              ${
                !checkIn || !checkOut || loading
                  ? "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                  : "bg-black text-white hover:bg-neutral-800 cursor-pointer"
              }`}
          >
            {loading ? "Checking..." : "Check Availability"}
          </button>

          {fetchStatus.availability === "succeeded" && (
            <div className="pt-2 border-t">
              {availability.length === 0 ? (
                <div className="rounded bg-green-50 border border-green-200 p-3">
                  <p className="text-sm font-medium text-green-700">
                    ✓ Available for the selected dates
                  </p>
                </div>
              ) : (
                <div className="rounded bg-red-50 border border-red-200 p-3 space-y-2">
                  <p className="text-sm font-medium text-red-700">
                    Property is unavailable.
                  </p>

                  <div className="space-y-1">
                    {availability.map((booking, index) => (
                      <div key={index} className="text-xs text-neutral-700">
                        {booking.checkInDate} → {booking.checkOutDate}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
