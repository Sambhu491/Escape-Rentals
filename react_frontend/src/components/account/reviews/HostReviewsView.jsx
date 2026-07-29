import { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiStar, FiLoader, FiMessageSquare, FiFlag } from "react-icons/fi";

import SectionCard from "../SectionCard";
import PlaceholderCard from "../PlaceholderCard";
import { getReviews } from "../../../api/reviewApi";
import {
  createReviewReply,
  createReviewConcern,
  fetchReviewReplies,
  selectRepliesByReviewId,
} from "../../../redux/review/reviewSlice";
import { fetchMyProperties, selectMyProperties } from "../../../redux/property/propertySlice";

// Same rationale as UserReviewsView: aggregating reviews across several of the
// host's properties needs one call per property, so we go straight to the api
// layer for the listing instead of reviewSlice's single-property `reviews` state.

const StarRow = ({ value }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <FiStar key={n} size={13} className={n <= value ? "fill-black text-black" : "text-neutral-300"} />
    ))}
  </div>
);

const ReviewReplyThread = ({ reviewId }) => {
  const dispatch = useDispatch();
  const replies = useSelector(selectRepliesByReviewId(reviewId));

  useEffect(() => {
    dispatch(fetchReviewReplies(reviewId));
  }, [dispatch, reviewId]);

  if (!replies || replies.length === 0) return null;

  return (
    <div className="mt-2 pl-3 border-l-2 border-neutral-200 space-y-1.5">
      {replies.map((r) => (
        <p key={r.id} className="text-[12px] text-neutral-600">
          <span className="font-semibold text-neutral-800">You replied:</span> {r.message}
        </p>
      ))}
    </div>
  );
};

const HostReviewsView = () => {
  const dispatch = useDispatch();
  const myProperties = useSelector(selectMyProperties);

  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [replyDraftId, setReplyDraftId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [flagDraftId, setFlagDraftId] = useState(null);
  const [flagReason, setFlagReason] = useState("");

  useEffect(() => {
    dispatch(fetchMyProperties());
  }, [dispatch]);

  const loadReviews = useCallback(async () => {
    if (myProperties.length === 0) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const results = await Promise.all(
        myProperties.map((p) => getReviews({ propertyId: p.id, size: 50 }).catch(() => null)),
      );
      const all = [];
      results.forEach((res, idx) => {
        if (!res?.content) return;
        res.content.forEach((review) => all.push({ ...review, propertyTitle: myProperties[idx].title }));
      });
      all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setReviews(all);
    } finally {
      setLoading(false);
    }
  }, [myProperties]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const submitReply = async (reviewId) => {
    if (!replyText.trim()) return;
    const result = await dispatch(createReviewReply({ reviewId, message: replyText.trim() }));
    if (createReviewReply.fulfilled.match(result)) {
      setReplyDraftId(null);
      setReplyText("");
    }
  };

  const submitFlag = async (reviewId) => {
    if (!flagReason.trim()) return;
    const result = await dispatch(createReviewConcern({ reviewId, reason: flagReason.trim() }));
    if (createReviewConcern.fulfilled.match(result)) {
      setFlagDraftId(null);
      setFlagReason("");
    }
  };

  if (loading) {
    return (
      <SectionCard title="Property Reviews" subtitle="Guest feedback across your listings">
        <div className="flex items-center justify-center gap-2 text-[12px] text-neutral-500 font-medium py-12">
          <FiLoader size={14} className="animate-spin" />
          Loading reviews…
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Property Reviews" subtitle="Guest feedback across your listings">
      {reviews.length === 0 ? (
        <PlaceholderCard title="No reviews yet" description="Guest reviews for your properties will appear here." icon={FiStar} />
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="p-4 rounded-xl border border-neutral-200 bg-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[13px] font-semibold text-neutral-900">{review.propertyTitle}</p>
                  <p className="text-[11px] text-neutral-400 font-medium">{review.guestName}</p>
                  <div className="mt-1">
                    <StarRow value={review.rating} />
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFlagDraftId(flagDraftId === review.id ? null : review.id);
                    setFlagReason("");
                  }}
                  className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-400 hover:text-red-600 cursor-pointer"
                >
                  <FiFlag size={12} />
                  Flag
                </button>
              </div>

              {review.comment && <p className="text-[13px] text-neutral-600 mt-2">{review.comment}</p>}

              <ReviewReplyThread reviewId={review.id} />

              {flagDraftId === review.id && (
                <div className="mt-3 space-y-2 p-3 rounded-lg bg-red-50 border border-red-200">
                  <textarea
                    rows={2}
                    value={flagReason}
                    onChange={(e) => setFlagReason(e.target.value)}
                    placeholder="Why should an admin look into this review?"
                    className="w-full rounded border border-red-200 px-3 py-2 text-[12px] outline-none focus:border-red-400 bg-white"
                  />
                  <button
                    onClick={() => submitFlag(review.id)}
                    disabled={!flagReason.trim()}
                    className="px-3 py-1.5 rounded-sm bg-red-600 text-white text-[11px] font-bold uppercase tracking-wider disabled:opacity-40 cursor-pointer"
                  >
                    Submit Flag
                  </button>
                </div>
              )}

              {replyDraftId === review.id ? (
                <div className="mt-3 space-y-2">
                  <textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply…"
                    className="w-full rounded border border-neutral-200 px-3 py-2 text-[12px] outline-none focus:border-neutral-900"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => submitReply(review.id)}
                      disabled={!replyText.trim()}
                      className="px-3 py-1.5 rounded-sm bg-neutral-900 text-white text-[11px] font-bold uppercase tracking-wider disabled:opacity-40 cursor-pointer"
                    >
                      Reply
                    </button>
                    <button onClick={() => setReplyDraftId(null)} className="text-[11px] font-semibold text-neutral-500 cursor-pointer">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setReplyDraftId(review.id);
                    setReplyText("");
                  }}
                  className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 cursor-pointer"
                >
                  <FiMessageSquare size={12} />
                  Reply
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
};

export default HostReviewsView;
