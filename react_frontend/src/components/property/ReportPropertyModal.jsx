import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createReport,
  clearReportErrors,
  REPORT_TYPE,
  selectIsCreatingReport,
  selectReportMutationError,
} from "../../redux/report/reportSlice";

const REPORT_TYPE_LABELS = {
  [REPORT_TYPE.WRONG_INFORMATION]: "Wrong information",
  [REPORT_TYPE.WRONG_IMAGES]: "Wrong images",
  [REPORT_TYPE.WRONG_ADDRESS]: "Wrong address",
  [REPORT_TYPE.MISLEADING_PRICING]: "Misleading pricing",
  [REPORT_TYPE.INAPPROPRIATE_CONTENT]: "Inappropriate content",
  [REPORT_TYPE.SAFETY_CONCERN]: "Safety concern",
  [REPORT_TYPE.FRAUD]: "Fraud",
  [REPORT_TYPE.OTHER]: "Other",
};

export default function ReportPropertyModal({ propertyId, open, onClose }) {
  const dispatch = useDispatch();
  const isSubmitting = useSelector(selectIsCreatingReport);
  const mutationError = useSelector(selectReportMutationError);

  const [type, setType] = useState(REPORT_TYPE.OTHER);
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (open) {
      dispatch(clearReportErrors());
      setType(REPORT_TYPE.OTHER);
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
      createReport({ propertyId: Number(propertyId), type, description: description.trim() }),
    );

    if (createReport.fulfilled.match(result)) {
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
          <h2 className="text-base font-semibold">Report this listing</h2>
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
                Thanks — our team has been notified and will review this listing.
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
                {Object.values(REPORT_TYPE).map((t) => (
                  <option key={t} value={t}>
                    {REPORT_TYPE_LABELS[t]}
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
                placeholder="Tell us what you noticed…"
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
