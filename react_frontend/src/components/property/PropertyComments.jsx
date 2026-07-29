import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FiMessageCircle, FiLoader, FiEdit2, FiTrash2, FiCornerDownRight } from "react-icons/fi";

import StatusPill from "../account/StatusPill";
import PropertyPagination from "./PropertyPagination";
import {
  AUTHOR_BADGE,
  fetchPropertyComments,
  fetchCommentReplies,
  createCommentAsync,
  updateCommentAsync,
  deleteCommentAsync,
  selectPropertyComments,
  selectCommentsPagination,
  selectCommentFetchStatus,
  selectRepliesByCommentId,
  selectCommentMutationStatus,
  selectIsCreatingComment,
} from "../../redux/comment/commentSlice";

const BADGE_CONFIG = {
  [AUTHOR_BADGE.VERIFIED_GUEST]: { label: "Verified Guest", tone: "emerald" },
  [AUTHOR_BADGE.HOST]: { label: "Host", tone: "violet" },
  [AUTHOR_BADGE.MEMBER]: { label: "Member", tone: "neutral" },
};

// Instagram/Facebook-style relative time — "2h", "3d", "just now" — instead of
// a full date, to match the casual register of a comment thread (reviews keep
// full dates since those read more like a formal record).
const timeAgo = (dateStr) => {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;
  return `${Math.floor(months / 12)}y`;
};

const initialsOf = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "?";

const Avatar = ({ name }) => (
  <div className="w-8 h-8 rounded-full bg-neutral-900 text-white text-[11px] font-semibold flex items-center justify-center shrink-0">
    {initialsOf(name)}
  </div>
);

// A single comment row — used for both top-level comments and replies.
// `onReply` is omitted for replies (one level of nesting only).
const CommentRow = ({ comment, currentUserId, isAdmin, isPropertyHost, onReply, onSaved, onDeleted }) => {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(comment.content);

  const badge = BADGE_CONFIG[comment.authorBadge] || BADGE_CONFIG[AUTHOR_BADGE.MEMBER];
  const isOwner = comment.authorId === currentUserId;
  // A host removing someone else's comment is a moderation action (soft
  // delete on the backend); the author or an admin removing it is final.
  const canDelete = isOwner || isAdmin || isPropertyHost;

  const saveEdit = async () => {
    if (!draft.trim()) return;
    const result = await dispatch(
      updateCommentAsync({ id: comment.id, data: { content: draft.trim() }, parentCommentId: comment.parentCommentId }),
    );
    if (updateCommentAsync.fulfilled.match(result)) {
      setIsEditing(false);
      onSaved?.();
    }
  };

  const remove = async () => {
    const result = await dispatch(
      deleteCommentAsync({ id: comment.id, parentCommentId: comment.parentCommentId }),
    );
    if (deleteCommentAsync.fulfilled.match(result)) {
      onDeleted?.();
    }
  };

  return (
    <div className="flex gap-2.5">
      <Avatar name={comment.authorName} />
      <div className="flex-1 min-w-0">
        <div className="rounded-2xl bg-neutral-100 px-3.5 py-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[12.5px] font-semibold text-neutral-900">{comment.authorName}</span>
            <StatusPill label={badge.label} tone={badge.tone} size="xs" />
          </div>

          {isEditing ? (
            <div className="mt-1.5 space-y-1.5">
              <textarea
                rows={2}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 text-[13px] outline-none focus:border-neutral-900"
              />
              <div className="flex gap-2">
                <button onClick={saveEdit} className="text-[11px] font-bold text-neutral-900 cursor-pointer">
                  Save
                </button>
                <button onClick={() => setIsEditing(false)} className="text-[11px] font-semibold text-neutral-500 cursor-pointer">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-[13px] text-neutral-700 mt-0.5 whitespace-pre-wrap break-words">{comment.content}</p>
          )}
        </div>

        {!isEditing && (
          <div className="flex items-center gap-3 mt-1 pl-1">
            <span className="text-[11px] text-neutral-400">{timeAgo(comment.createdAt)}</span>
            {onReply && (
              <button onClick={onReply} className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 cursor-pointer">
                Reply
              </button>
            )}
            {isOwner && (
              <button onClick={() => setIsEditing(true)} className="text-neutral-400 hover:text-neutral-900 cursor-pointer" aria-label="Edit comment">
                <FiEdit2 size={11} />
              </button>
            )}
            {canDelete && (
              <button onClick={remove} className="text-neutral-400 hover:text-red-600 cursor-pointer" aria-label="Delete comment">
                <FiTrash2 size={11} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const CommentThread = ({ comment, currentUserId, isAdmin, isPropertyHost, propertyId }) => {
  const dispatch = useDispatch();
  const replies = useSelector(selectRepliesByCommentId(comment.id));
  const [showReplies, setShowReplies] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyDraft, setReplyDraft] = useState("");

  const toggleReplies = () => {
    if (!showReplies && replies.length === 0 && comment.replyCount > 0) {
      dispatch(fetchCommentReplies(comment.id));
    }
    setShowReplies((prev) => !prev);
  };

  const submitReply = async () => {
    if (!replyDraft.trim()) return;
    const result = await dispatch(
      createCommentAsync({ propertyId: Number(propertyId), content: replyDraft.trim(), parentCommentId: comment.id }),
    );
    if (createCommentAsync.fulfilled.match(result)) {
      setReplyDraft("");
      setIsReplying(false);
      setShowReplies(true);
    }
  };

  return (
    <div className="space-y-2">
      <CommentRow
        comment={comment}
        currentUserId={currentUserId}
        isAdmin={isAdmin}
        isPropertyHost={isPropertyHost}
        onReply={() => setIsReplying((v) => !v)}
      />

      {isReplying && (
        <div className="ml-11 flex gap-2 items-start">
          <FiCornerDownRight size={14} className="text-neutral-300 mt-2 shrink-0" />
          <div className="flex-1 space-y-1.5">
            <textarea
              rows={2}
              value={replyDraft}
              onChange={(e) => setReplyDraft(e.target.value)}
              placeholder="Write a reply…"
              className="w-full rounded-lg border border-neutral-300 px-2.5 py-1.5 text-[13px] outline-none focus:border-neutral-900"
            />
            <div className="flex gap-2">
              <button onClick={submitReply} disabled={!replyDraft.trim()} className="text-[11px] font-bold text-neutral-900 disabled:opacity-40 cursor-pointer">
                Reply
              </button>
              <button onClick={() => setIsReplying(false)} className="text-[11px] font-semibold text-neutral-500 cursor-pointer">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {comment.replyCount > 0 && (
        <button
          onClick={toggleReplies}
          className="ml-11 text-[11.5px] font-semibold text-neutral-500 hover:text-neutral-900 cursor-pointer"
        >
          {showReplies ? "Hide replies" : `View ${comment.replyCount} repl${comment.replyCount > 1 ? "ies" : "y"}`}
        </button>
      )}

      {showReplies && (
        <div className="ml-11 pl-3 border-l-2 border-neutral-200 space-y-3">
          {replies.map((reply) => (
            <CommentRow
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              isPropertyHost={isPropertyHost}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const PropertyComments = ({ propertyId, isPropertyHost = false }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const comments = useSelector(selectPropertyComments);
  const pagination = useSelector(selectCommentsPagination);
  const fetchStatus = useSelector(selectCommentFetchStatus);
  const isPosting = useSelector(selectIsCreatingComment);
  const mutationStatus = useSelector(selectCommentMutationStatus);

  const [page, setPage] = useState(0);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (propertyId) {
      dispatch(fetchPropertyComments({ propertyId, params: { page, size: 10, sort: "createdAt,desc" } }));
    }
  }, [dispatch, propertyId, page]);

  const isLoading = fetchStatus.comments === "loading";

  const handlePost = async () => {
    if (!draft.trim()) return;
    const result = await dispatch(createCommentAsync({ propertyId: Number(propertyId), content: draft.trim() }));
    if (createCommentAsync.fulfilled.match(result)) {
      setDraft("");
    }
  };

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center gap-2">
        <FiMessageCircle size={16} />
        <h2 className="text-base font-semibold">Comments</h2>
        {pagination.totalElements > 0 && (
          <span className="text-[11px] text-neutral-400">({pagination.totalElements})</span>
        )}
      </div>

      {user ? (
        <div className="flex gap-2.5">
          <Avatar name={`${user.firstName} ${user.lastName}`} />
          <div className="flex-1 space-y-1.5">
            <textarea
              rows={2}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask a question or share a thought about this place…"
              className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-[13px] outline-none focus:border-neutral-900 transition-colors"
            />
            <button
              onClick={handlePost}
              disabled={!draft.trim() || isPosting}
              className="px-4 py-1.5 rounded-sm bg-neutral-900 text-white text-[11px] font-bold uppercase tracking-wider hover:bg-black disabled:opacity-40 transition-colors cursor-pointer"
            >
              {isPosting ? "Posting…" : "Post Comment"}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-[12px] text-neutral-500 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3">
          <Link to="/login" className="font-semibold text-neutral-900 hover:underline">
            Log in
          </Link>{" "}
          to join the conversation.
        </p>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 text-[12px] text-neutral-500 font-medium py-8">
          <FiLoader size={14} className="animate-spin" />
          Loading comments…
        </div>
      ) : comments.length === 0 ? (
        <p className="text-[11px] text-neutral-400 uppercase tracking-wider text-center py-4">
          No comments yet — be the first to say something
        </p>
      ) : (
        <div className="space-y-5">
          {comments.map((comment) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              currentUserId={user?.id}
              isAdmin={user?.role === "ROLE_ADMIN"}
              isPropertyHost={isPropertyHost}
              propertyId={propertyId}
            />
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

export default PropertyComments;
