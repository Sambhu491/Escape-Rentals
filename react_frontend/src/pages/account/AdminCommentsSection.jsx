import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiMessageCircle, FiLoader, FiTrash2, FiRotateCcw, FiAlertTriangle } from "react-icons/fi";

import SectionCard from "../../components/account/SectionCard";
import PlaceholderCard from "../../components/account/PlaceholderCard";
import StatusPill from "../../components/account/StatusPill";
import PropertyPagination from "../../components/property/PropertyPagination";
import useRefetchOnFocus from "../../dataFile/useRefetchOnFocus";
import {
  AUTHOR_BADGE,
  fetchAllCommentsForAdmin,
  restoreCommentAsync,
  deleteCommentAsync,
  selectAdminComments,
  selectAdminCommentsPagination,
  selectCommentFetchStatus,
} from "../../redux/comment/commentSlice";

const BADGE_CONFIG = {
  [AUTHOR_BADGE.VERIFIED_GUEST]: { label: "Verified Guest", tone: "emerald" },
  [AUTHOR_BADGE.HOST]: { label: "Host", tone: "violet" },
  [AUTHOR_BADGE.MEMBER]: { label: "Member", tone: "neutral" },
};

const formatDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const AdminCommentsSection = () => {
  const dispatch = useDispatch();
  const comments = useSelector(selectAdminComments);
  const pagination = useSelector(selectAdminCommentsPagination);
  const fetchStatus = useSelector(selectCommentFetchStatus);

  const [page, setPage] = useState(0);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const refetch = useCallback(() => {
    dispatch(fetchAllCommentsForAdmin({ page, size: 15, sort: "createdAt,desc" }));
  }, [dispatch, page]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useRefetchOnFocus(refetch);

  const isLoading = fetchStatus.adminComments === "loading";

  const handleDelete = (comment) => {
    dispatch(deleteCommentAsync({ id: comment.id, parentCommentId: comment.parentCommentId }));
    setConfirmDeleteId(null);
  };

  return (
    <div className="space-y-5">
      <h1 className="text-[20px] font-semibold tracking-tight text-neutral-900">Comments</h1>

      <SectionCard
        title="All Comments"
        subtitle="Every comment platform-wide, including ones a host has removed"
        actionLabel={pagination.totalElements ? `${pagination.totalElements} Total` : null}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 text-[12px] text-neutral-500 font-medium py-12">
            <FiLoader size={14} className="animate-spin" />
            Loading comments…
          </div>
        ) : comments.length === 0 ? (
          <PlaceholderCard title="No comments yet" description="Comments posted on properties will appear here." icon={FiMessageCircle} />
        ) : (
          <div className="space-y-3">
            {comments.map((c) => {
              const badge = BADGE_CONFIG[c.authorBadge] || BADGE_CONFIG[AUTHOR_BADGE.MEMBER];
              return (
              <div key={c.id} className="p-4 rounded-xl border border-neutral-200 bg-white space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13px] font-semibold text-neutral-900">{c.authorName}</span>
                      <StatusPill label={badge.label} tone={badge.tone} size="xs" />
                      {c.parentCommentId && (
                        <span className="text-[10px] uppercase tracking-wider text-neutral-400">Reply</span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      {c.propertyTitle} · {formatDate(c.createdAt)}
                    </p>
                  </div>
                  {c.deleted && <StatusPill label="Removed by host" tone="red" />}
                </div>

                <p className="text-[13px] text-neutral-600">{c.content}</p>

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-black/[0.04]">
                  {c.deleted ? (
                    <button
                      onClick={() => dispatch(restoreCommentAsync(c.id))}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                    >
                      <FiRotateCcw size={12} />
                      Restore
                    </button>
                  ) : confirmDeleteId === c.id ? (
                    <>
                      <span className="text-[11px] text-red-600 font-semibold flex items-center gap-1">
                        <FiAlertTriangle size={12} /> Delete permanently?
                      </span>
                      <button onClick={() => handleDelete(c)} className="px-2.5 py-1 rounded bg-red-600 text-white text-[11px] font-semibold cursor-pointer">
                        Yes
                      </button>
                      <button onClick={() => setConfirmDeleteId(null)} className="px-2.5 py-1 rounded border border-neutral-200 text-[11px] font-semibold cursor-pointer">
                        No
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(c.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-[11px] font-semibold text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                    >
                      <FiTrash2 size={12} />
                      Delete
                    </button>
                  )}
                </div>
              </div>
              );
            })}

            {pagination.totalPages > 1 && (
              <div className="flex justify-center pt-2">
                <PropertyPagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
              </div>
            )}
          </div>
        )}
      </SectionCard>
    </div>
  );
};

export default AdminCommentsSection;
