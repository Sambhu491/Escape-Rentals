import { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiStar, FiEdit2, FiTrash2, FiLoader } from "react-icons/fi";

import SectionCard from "../SectionCard";
import PlaceholderCard from "../PlaceholderCard";
import { getPropertyReviews } from "../../../api/reviewApi";
import { updateReview, deleteReview, createReview } from "../../../redux/review/reviewSlice";
import { fetchMyBookings, selectMyBookings } from "../../../redux/booking/bookingSlice";

// The backend has no "list all reviews I've written" endpoint for a plain USER
// (GET /api/reviews is ADMIN/HOST-only) — so this view aggregates reviews by
// calling the public per-property endpoint directly for each property the
// guest has completed a stay at, instead of routing through reviewSlice's
// single shared `propertyReviews` field (which would get overwritten on each
// call and can't hold more than one property's results at a time).

const StarRow = ({ value, onChange, readOnly = false }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        disabled={readOnly}
        onClick={() => onChange?.(n)}
        className={readOnly ? "cursor-default" : "cursor-pointer"}
      >
        <FiStar size={15} className={n <= value ? "fill-black text-black" : "text-neutral-300"} />
      </button>
    ))}
  </div>
);

const UserReviewsView = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const myBookings = useSelector(selectMyBookings);

  const [loading, setLoading] = useState(true);
  const [myReviews, setMyReviews] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [draftRating, setDraftRating] = useState(0);
  const [draftComment, setDraftComment] = useState("");
  const [newReviewPropertyId, setNewReviewPropertyId] = useState(null);

  useEffect(() => {
    dispatch(fetchMyBookings({ page: 0, size: 100 }));
  }, [dispatch]);

  // Matches the backend rule: reviewable once confirmed and paid, not only
  // after the full stay (and the nightly COMPLETED job) has passed.
  const eligibleProperties = useMemo(() => {
    const map = new Map();
    myBookings
      .filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED")
      .forEach((b) => map.set(b.propertyId, b.propertyTitle));
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [myBookings]);

  const loadMyReviews = useCallback(async () => {
    if (eligibleProperties.length === 0) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const results = await Promise.all(
        eligibleProperties.map((p) => getPropertyReviews(p.id, { size: 50 }).catch(() => null)),
      );
      const mine = [];
      results.forEach((res, idx) => {
        if (!res?.content) return;
        res.content.forEach((review) => {
          if (review.guestId === user?.id) {
            mine.push({ ...review, propertyTitle: eligibleProperties[idx].title });
          }
        });
      });
      setMyReviews(mine);
    } finally {
      setLoading(false);
    }
  }, [eligibleProperties, user?.id]);

  useEffect(() => {
    loadMyReviews();
  }, [loadMyReviews]);

  const reviewedPropertyIds = new Set(myReviews.map((r) => r.propertyId));
  const reviewableProperties = eligibleProperties.filter((p) => !reviewedPropertyIds.has(p.id));

  const startEdit = (review) => {
    setEditingId(review.id);
    setDraftRating(review.rating);
    setDraftComment(review.comment || "");
  };

  const saveEdit = async () => {
    const result = await dispatch(updateReview({ id: editingId, data: { rating: draftRating, comment: draftComment } }));
    if (updateReview.fulfilled.match(result)) {
      setEditingId(null);
      loadMyReviews();
    }
  };

  const remove = async (id) => {
    const result = await dispatch(deleteReview(id));
    if (deleteReview.fulfilled.match(result)) {
      setMyReviews((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const submitNewReview = async (propertyId) => {
    if (draftRating < 1) return;
    const result = await dispatch(createReview({ propertyId, rating: draftRating, comment: draftComment }));
    if (createReview.fulfilled.match(result)) {
      setNewReviewPropertyId(null);
      setDraftRating(0);
      setDraftComment("");
      loadMyReviews();
    }
  };

  if (loading) {
    return (
      <SectionCard title="My Reviews" subtitle="Reviews you've written for completed stays">
        <div className="flex items-center justify-center gap-2 text-[12px] text-neutral-500 font-medium py-12">
          <FiLoader size={14} className="animate-spin" />
          Loading your reviews…
        </div>
      </SectionCard>
    );
  }

  return (
    <div className="space-y-5">
      <SectionCard title="My Reviews" subtitle="Reviews you've written for completed stays">
        {myReviews.length === 0 ? (
          <PlaceholderCard
            title="No reviews yet"
            description="Once you complete a stay, you'll be able to leave a review for that property here."
            icon={FiStar}
          />
        ) : (
          <div className="space-y-3">
            {myReviews.map((review) => (
              <div key={review.id} className="p-4 rounded-xl border border-neutral-200 bg-white">
                {editingId === review.id ? (
                  <div className="space-y-2.5">
                    <StarRow value={draftRating} onChange={setDraftRating} />
                    <textarea
                      rows={3}
                      value={draftComment}
                      onChange={(e) => setDraftComment(e.target.value)}
                      className="w-full rounded border border-neutral-200 px-3 py-2 text-[13px] outline-none focus:border-neutral-900"
                    />
                    <div className="flex gap-2">
                      <button onClick={saveEdit} className="px-4 py-1.5 rounded-sm bg-neutral-900 text-white text-[11px] font-bold uppercase tracking-wider cursor-pointer">
                        Save
                      </button>
                      <button onClick={() => setEditingId(null)} className="text-[11px] font-semibold text-neutral-500 cursor-pointer">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[13px] font-semibold text-neutral-900">{review.propertyTitle}</p>
                        <StarRow value={review.rating} readOnly />
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => startEdit(review)} className="text-neutral-400 hover:text-neutral-900 cursor-pointer" aria-label="Edit">
                          <FiEdit2 size={13} />
                        </button>
                        <button onClick={() => remove(review.id)} className="text-neutral-400 hover:text-red-600 cursor-pointer" aria-label="Delete">
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    </div>
                    {review.comment && <p className="text-[13px] text-neutral-600 mt-2">{review.comment}</p>}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {reviewableProperties.length > 0 && (
        <SectionCard title="Awaiting your review" subtitle="Confirmed bookings you haven't reviewed yet">
          <div className="space-y-3">
            {reviewableProperties.map((p) => (
              <div key={p.id} className="p-4 rounded-xl border border-neutral-200 bg-white">
                <p className="text-[13px] font-semibold text-neutral-900 mb-2">{p.title}</p>
                {newReviewPropertyId === p.id ? (
                  <div className="space-y-2.5">
                    <StarRow value={draftRating} onChange={setDraftRating} />
                    <textarea
                      rows={3}
                      value={draftComment}
                      onChange={(e) => setDraftComment(e.target.value)}
                      placeholder="How was your stay?"
                      className="w-full rounded border border-neutral-200 px-3 py-2 text-[13px] outline-none focus:border-neutral-900"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => submitNewReview(p.id)} className="px-4 py-1.5 rounded-sm bg-neutral-900 text-white text-[11px] font-bold uppercase tracking-wider cursor-pointer">
                        Post Review
                      </button>
                      <button onClick={() => setNewReviewPropertyId(null)} className="text-[11px] font-semibold text-neutral-500 cursor-pointer">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setNewReviewPropertyId(p.id);
                      setDraftRating(0);
                      setDraftComment("");
                    }}
                    className="px-4 py-1.5 rounded-sm border border-neutral-300 text-[11px] font-semibold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                  >
                    Write a Review
                  </button>
                )}
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
};

export default UserReviewsView;
