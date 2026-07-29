import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiStar, FiLoader, FiMessageSquare, FiEdit2, FiTrash2 } from "react-icons/fi";

import {
  fetchPropertyReviews,
  fetchReviewReplies,
  createReview,
  updateReview,
  deleteReview,
  selectPropertyReviews,
  selectPropertyReviewsPagination,
  selectReviewFetchStatus,
  selectRepliesByReviewId,
  selectReviewMutationStatus,
  selectReviewMutationError,
} from "../../redux/review/reviewSlice";
import { fetchMyBookings, selectMyBookings } from "../../redux/booking/bookingSlice";
import PropertyPagination from "./PropertyPagination";

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const StarRating = ({ value, onChange, readOnly = false, size = 16 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        disabled={readOnly}
        onClick={() => onChange?.(n)}
        className={readOnly ? "cursor-default" : "cursor-pointer"}
        aria-label={`${n} star${n > 1 ? "s" : ""}`}
      >
        <FiStar
          size={size}
          className={n <= value ? "fill-black text-black" : "text-neutral-300"}
        />
      </button>
    ))}
  </div>
);

// Inline reply shown beneath a review, sourced from the keyed replies map
// (state.review.replies[reviewId]) rather than the flat reviews array.
const HostReplies = ({ reviewId }) => {
  const dispatch = useDispatch();
  const replies = useSelector(selectRepliesByReviewId(reviewId));

  useEffect(() => {
    dispatch(fetchReviewReplies(reviewId));
  }, [dispatch, reviewId]);

  if (!replies || replies.length === 0) return null;

  return (
    <div className="mt-3 pl-4 border-l-2 border-neutral-200 space-y-2">
      {replies.map((reply) => (
        <div key={reply.id} className="text-[12px]">
          <p className="font-semibold text-neutral-800 flex items-center gap-1.5">
            <FiMessageSquare size={12} className="text-neutral-400" />
            {reply.hostName} <span className="text-neutral-400 font-normal">· Host reply</span>
          </p>
          <p className="text-neutral-600 mt-0.5">{reply.message}</p>
        </div>
      ))}
    </div>
  );
};

const PropertyReviews = ({ propertyId }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const reviews = useSelector(selectPropertyReviews);
  const pagination = useSelector(selectPropertyReviewsPagination);
  const fetchStatus = useSelector(selectReviewFetchStatus);
  const mutationStatus = useSelector(selectReviewMutationStatus);
  const mutationError = useSelector(selectReviewMutationError);
  const myBookings = useSelector(selectMyBookings);

  const [page, setPage] = useState(0);
  const [formRating, setFormRating] = useState(0);
  const [formComment, setFormComment] = useState("");
  const [editingReviewId, setEditingReviewId] = useState(null);

  useEffect(() => {
    if (propertyId) {
      dispatch(fetchPropertyReviews({ propertyId, params: { page, size: 5, sort: "createdAt,desc" } }));
    }
  }, [dispatch, propertyId, page]);

  useEffect(() => {
    if (user?.role === "ROLE_USER") {
      dispatch(fetchMyBookings({ page: 0, size: 50 }));
    }
  }, [dispatch, user?.role]);

  const myReview = useMemo(
    () => reviews.find((r) => r.guestId === user?.id),
    [reviews, user?.id],
  );

  // Matches the backend rule: reviewable once confirmed and paid, not only
  // after the full stay (and the nightly COMPLETED job) has passed.
  const hasEligibleBooking = useMemo(
    () =>
      myBookings.some(
        (b) =>
          String(b.propertyId) === String(propertyId) &&
          (b.status === "CONFIRMED" || b.status === "COMPLETED"),
      ),
    [myBookings, propertyId],
  );

  const canReview = user?.role === "ROLE_USER" && hasEligibleBooking && !myReview;

  const isLoading = fetchStatus.propertyReviews === "loading";
  const isSubmitting = mutationStatus.createReview === "loading" || mutationStatus.updateReview === "loading";

  const startEdit = (review) => {
    setEditingReviewId(review.id);
    setFormRating(review.rating);
    setFormComment(review.comment);
  };

  const resetForm = () => {
    setEditingReviewId(null);
    setFormRating(0);
    setFormComment("");
  };

  const handleSubmit = async () => {
    if (formRating < 1) return;

    if (editingReviewId) {
      const result = await dispatch(
        updateReview({ id: editingReviewId, data: { rating: formRating, comment: formComment } }),
      );
      if (updateReview.fulfilled.match(result)) resetForm();
    } else {
      const result = await dispatch(createReview({ propertyId: Number(propertyId), rating: formRating, comment: formComment }));
      if (createReview.fulfilled.match(result)) resetForm();
    }
  };

  const handleDelete = async (id) => {
    await dispatch(deleteReview(id));
    if (editingReviewId === id) resetForm();
  };

  return (
    <div className="space-y-4">
      {/* Review submission / edit form — only for guests who completed a stay */}
      {(canReview || editingReviewId) && (
        <div className="p-4 rounded border border-neutral-200 bg-neutral-50 space-y-3">
          <h3 className="text-[13px] font-semibold text-neutral-900">
            {editingReviewId ? "Edit your review" : "Share your experience"}
          </h3>
          <StarRating value={formRating} onChange={setFormRating} size={20} />
          <textarea
            rows={3}
            value={formComment}
            onChange={(e) => setFormComment(e.target.value)}
            placeholder="What stood out about your stay?"
            className="w-full rounded border border-neutral-200 bg-white px-3 py-2 text-[13px] outline-none focus:border-neutral-900 transition-colors"
          />
          {mutationError?.createReview || mutationError?.updateReview ? (
            <p className="text-[11px] text-red-500 font-medium">
              {mutationError.createReview || mutationError.updateReview}
            </p>
          ) : null}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || formRating < 1}
              className="px-4 py-2 rounded-sm bg-neutral-900 text-white text-[11px] font-bold uppercase tracking-wider hover:bg-black disabled:opacity-40 transition-colors cursor-pointer"
            >
              {isSubmitting ? "Saving…" : editingReviewId ? "Save Changes" : "Post Review"}
            </button>
            {editingReviewId && (
              <button onClick={resetForm} className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 cursor-pointer">
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 text-[12px] text-neutral-500 font-medium py-8">
          <FiLoader size={14} className="animate-spin" />
          Loading reviews…
        </div>
      ) : reviews.length === 0 ? (
        <div className="p-5 rounded border border-neutral-200 bg-neutral-50 text-center">
          <p className="text-[11px] text-neutral-500 uppercase tracking-wider">
            Guest reviews will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="p-4 rounded border border-neutral-200 bg-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[13px] font-semibold text-neutral-900">{review.guestName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating value={review.rating} readOnly size={13} />
                    <span className="text-[11px] text-neutral-400">{formatDate(review.createdAt)}</span>
                  </div>
                </div>
                {review.guestId === user?.id && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => startEdit(review)} className="text-neutral-400 hover:text-neutral-900 cursor-pointer" aria-label="Edit review">
                      <FiEdit2 size={13} />
                    </button>
                    <button onClick={() => handleDelete(review.id)} className="text-neutral-400 hover:text-red-600 cursor-pointer" aria-label="Delete review">
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
              {review.comment && (
                <p className="text-[13px] text-neutral-600 mt-2 leading-relaxed">{review.comment}</p>
              )}
              <HostReplies reviewId={review.id} />
            </div>
          ))}

          {pagination.totalPages > 1 && (
            <div className="flex justify-center pt-2">
              <PropertyPagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PropertyReviews;
