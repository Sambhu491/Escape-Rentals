import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createUserReport,
  clearUserReportErrors,
  USER_REPORT_TYPE,
  selectIsCreatingUserReport,
  selectUserReportMutationError,
} from "../../redux/userReport/userReportSlice";

const USER_REPORT_TYPE_LABELS = {
  [USER_REPORT_TYPE.FRAUD]: "Fraud",
  [USER_REPORT_TYPE.HARASSMENT]: "Harassment",
  [USER_REPORT_TYPE.ABUSIVE_BEHAVIOR]: "Abusive behavior",
  [USER_REPORT_TYPE.MISLEADING_INFORMATION]: "Misleading information",
  [USER_REPORT_TYPE.PAYMENT_DISPUTE]: "Payment dispute",
  [USER_REPORT_TYPE.SAFETY_CONCERN]: "Safety concern",
  [USER_REPORT_TYPE.OTHER]: "Other",
};

// Generic — reused for a guest reporting a host (PropertyDetailPage) and a
// host reporting a guest (BookingCard), same as ReportPropertyModal's shape.
export default function ReportUserModal({ userId, userLabel, open, onClose }) {
  const dispatch = useDispatch();
  const isSubmitting = useSelector(selectIsCreatingUserReport);
  const mutationError = useSelector(selectUserReportMutationError);

  const [type, setType] = useState(USER_REPORT_TYPE.OTHER);
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (open) {
      dispatch(clearUserReportErrors());
      setType(USER_REPORT_TYPE.OTHER);
      setDescription("");
      setSubmitted(false);
    }
  }, [open, dispatch]);

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = async () => {
    if (!description.trim()) return;

    const result = await dispatch(
      createUserReport({ reportedUserId: Number(userId), type, description: description.trim() }),
    );

    if (createUserReport.fulfilled.match(result)) {
      setSubmitted(true);
    }
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
          <h2 className="text-base font-semibold">
            Report {userLabel || "this user"}
          </h2>
          <button
            onClick={handleClose}
            className="text-neutral-500 hover:text-black text-xl leading-none cursor-pointer"
          >
            ×
          </button>
        </div>

        {submitted ? (
          <div className="space-y-4">
            <div className="rounded bg-emerald-50 border border-emerald-200 p-3">
              <p className="text-sm font-medium text-emerald-700">
                Thanks — our team has been notified and will review this report.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="w-full py-2.5 rounded text-sm font-semibold bg-black text-white hover:bg-neutral-800 cursor-pointer"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                What's wrong?
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full border border-neutral-300 rounded px-3 py-2 text-sm outline-none focus:border-black cursor-pointer"
              >
                {Object.values(USER_REPORT_TYPE).map((t) => (
                  <option key={t} value={t}>
                    {USER_REPORT_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                Details
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us what happened…"
                className="w-full border border-neutral-300 rounded px-3 py-2 text-sm outline-none focus:border-black"
              />
            </div>

            {mutationError?.create && (
              <p className="text-xs text-red-500 font-medium">{mutationError.create}</p>
            )}

            <button
              disabled={!description.trim() || isSubmitting}
              onClick={handleSubmit}
              className={`w-full py-2.5 rounded text-sm font-semibold transition
                ${
                  !description.trim() || isSubmitting
                    ? "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                    : "bg-black text-white hover:bg-neutral-800 cursor-pointer"
                }`}
            >
              {isSubmitting ? "Submitting…" : "Submit Report"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
