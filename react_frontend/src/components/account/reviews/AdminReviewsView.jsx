import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, Link } from "react-router-dom";
import { FiStar, FiLoader, FiTrash2 } from "react-icons/fi";

import SectionCard from "../SectionCard";
import PlaceholderCard from "../PlaceholderCard";
import StatusPill from "../StatusPill";
import PropertyPagination from "../../property/PropertyPagination";
import useRefetchOnFocus from "../../../dataFile/useRefetchOnFocus";
import {
  fetchReviews,
  deleteReview,
  fetchReviewConcerns,
  updateReviewConcernStatus,
  selectAllReviews,
  selectReviewsPagination,
  selectAllConcerns,
  selectConcernsPagination,
  selectReviewFetchStatus,
  CONCERN_STATUS,
} from "../../../redux/review/reviewSlice";

const CONCERN_TONE = {
  PENDING: "amber",
  UNDER_REVIEW: "blue",
  RESOLVED: "emerald",
  REJECTED: "red",
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const StarRow = ({ value }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <FiStar
        key={n}
        size={12}
        className={n <= value ? "fill-black text-black" : "text-neutral-300"}
      />
    ))}
  </div>
);

const ReviewsTab = () => {
  const dispatch = useDispatch();
  const reviews = useSelector(selectAllReviews);
  const pagination = useSelector(selectReviewsPagination);
  const fetchStatus = useSelector(selectReviewFetchStatus);
  const [page, setPage] = useState(0);

  const refetch = useCallback(() => {
    dispatch(fetchReviews({ page, size: 10, sort: "createdAt,desc" }));
  }, [dispatch, page]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useRefetchOnFocus(refetch);

  if (fetchStatus.reviews === "loading") {
    return (
      <div className="flex items-center justify-center gap-2 text-[12px] text-neutral-500 font-medium py-12">
        <FiLoader size={14} className="animate-spin" />
        Loading reviews…
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <PlaceholderCard
        title="No reviews yet"
        description="Reviews submitted platform-wide will appear here."
        icon={FiStar}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-black/[0.08]">
        <table className="w-full text-left text-xs text-neutral-700">
          <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider font-semibold border-b border-black/[0.06]">
            <tr>
              <th className="px-4 py-3">Property</th>
              <th className="px-4 py-3">Guest</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Comment</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-black/[0.05] bg-white">
            {reviews.map((r) => (
              <tr key={r.id} className="hover:bg-neutral-50/80 transition-colors">
                <td className="px-4 py-3 font-semibold text-neutral-900">
                  <Link 
                    to={`/properties/${r.propertyId}`} 
                    className="text-neutral-900 hover:text-blue-600 hover:underline transition-colors"
                  >
                    {r.propertyTitle}
                  </Link>
                </td>
                <td className="px-4 py-3">{r.guestName}</td>
                <td className="px-4 py-3">
                  <StarRow value={r.rating} />
                </td>
                <td className="px-4 py-3 max-w-xs truncate">{r.comment}</td>
                <td className="px-4 py-3 text-neutral-500 text-[11px]">
                  {formatDate(r.createdAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => dispatch(deleteReview(r.id))}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-red-200 bg-red-50 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    <FiTrash2 size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <PropertyPagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
};

const ConcernCard = ({ c, onDeleteAndResolve, onRejectAppeal }) => {
  const isDecided = c.status === "RESOLVED" || c.status === "REJECTED";

  return (
    <div className="p-4 rounded-xl border border-neutral-200 bg-white space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold text-neutral-900">
            Flagged by {c.hostName}
          </p>
          <p className="text-[11px] text-neutral-400">
            {formatDate(c.createdAt)} · Review #{c.reviewId}
          </p>
        </div>

        <StatusPill
          label={c.status.replaceAll("_", " ")}
          tone={CONCERN_TONE[c.status] || "neutral"}
        />
      </div>

      <p className="text-[13px] text-neutral-600">
        <span className="font-semibold text-neutral-800">Reason: </span>
        {c.reason}
      </p>

      {c.reviewComment != null && (
        <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-neutral-700">
              {c.reviewGuestName} on{" "}
              <Link 
                to={`/properties/${c.propertyId}`} 
                className="text-neutral-900 font-bold hover:text-blue-600 hover:underline transition-colors"
              >
                {c.propertyTitle}
              </Link>
            </span>

            {c.reviewRating != null && <StarRow value={c.reviewRating} />}
          </div>

          <p className="text-[13px] text-neutral-600">{c.reviewComment}</p>
        </div>
      )}

      {!isDecided && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={() => onDeleteAndResolve(c)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white text-[11px] font-bold uppercase tracking-wider hover:bg-red-700 transition-colors cursor-pointer"
          >
            <FiTrash2 size={12} />
            Delete Review &amp; Resolve
          </button>

          <button
            onClick={() => onRejectAppeal(c.id)}
            className="px-3 py-1.5 rounded-lg border border-neutral-200 text-[11px] font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            Reject Appeal
          </button>
        </div>
      )}
    </div>
  );
};

const ConcernsTab = () => {
  const dispatch = useDispatch();
  const concerns = useSelector(selectAllConcerns);
  const pagination = useSelector(selectConcernsPagination);
  const fetchStatus = useSelector(selectReviewFetchStatus);
  const [page, setPage] = useState(0);

  const refetch = useCallback(() => {
    dispatch(fetchReviewConcerns({ page, size: 10, sort: "createdAt,desc" }));
  }, [dispatch, page]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useRefetchOnFocus(refetch);

  const rejectAppeal = (concernId) => {
    dispatch(updateReviewConcernStatus({ id: concernId, status: CONCERN_STATUS.REJECTED }));
  };

  const deleteAndResolve = async (concern) => {
    const result = await dispatch(deleteReview(concern.reviewId));
    if (deleteReview.fulfilled.match(result)) {
      dispatch(updateReviewConcernStatus({ id: concern.id, status: CONCERN_STATUS.RESOLVED }));
    }
  };

  if (fetchStatus.concerns === "loading") {
    return (
      <div className="flex items-center justify-center gap-2 text-[12px] text-neutral-500 font-medium py-12">
        <FiLoader size={14} className="animate-spin" />
        Loading concerns…
      </div>
    );
  }

  if (concerns.length === 0) {
    return (
      <PlaceholderCard
        title="No flagged reviews"
        description="When a host flags a review for moderation, it will show up here."
        icon={FiStar}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {concerns.map((c) => (
          <ConcernCard
            key={c.id}
            c={c}
            onDeleteAndResolve={deleteAndResolve}
            onRejectAppeal={rejectAppeal}
          />
        ))}
      </div>
      {pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <PropertyPagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
};

const AdminReviewsView = () => {
  const location = useLocation();
  const deepLinkConcernId = location.state?.concernId;
  const [tab, setTab] = useState(deepLinkConcernId ? "concerns" : "reviews");

  return (
    <SectionCard title="Reviews" subtitle="Platform-wide reviews and host-flagged concerns">
      <div className="flex items-center gap-1 pb-4 border-b border-black/[0.06] mb-4">
        {[
          { key: "reviews", label: "All Reviews" },
          { key: "concerns", label: "Concerns" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              tab === t.key
                ? "bg-neutral-900 text-white"
                : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "reviews" ? <ReviewsTab /> : <ConcernsTab />}
    </SectionCard>
  );
};

export default AdminReviewsView;