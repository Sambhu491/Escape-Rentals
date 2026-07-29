import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import useRefetchOnFocus from "../../dataFile/useRefetchOnFocus";
import { FiBell, 
  FiCalendar, 
  FiCreditCard, 
  FiStar, 
  FiMessageSquare, 
  FiFlag, 
  FiFileText, 
  FiMessageCircle, 
  FiUserX, 
  FiLoader,
  FiMail  } from "react-icons/fi";

import SectionCard from "../../components/account/SectionCard";
import PlaceholderCard from "../../components/account/PlaceholderCard";
import PropertyPagination from "../../components/property/PropertyPagination";
import {
  NOTIFICATION_TYPE,
  fetchMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  selectNotifications,
  selectNotificationsPagination,
  selectNotificationFetchStatus,
    deleteNotification,
  deleteAllNotifications,
} from "../../redux/notification/notificationSlice";


// Removing a notification is intentionally not built yet (deferred by design —
// this is the minimal "list + mark as read" scaffold; see notificationSlice.js).
const TYPE_ICON = {
  [NOTIFICATION_TYPE.BOOKING]: FiCalendar,
  [NOTIFICATION_TYPE.PAYMENT]: FiCreditCard,
  [NOTIFICATION_TYPE.REVIEW]: FiStar,
  [NOTIFICATION_TYPE.REVIEW_REPLY]: FiMessageSquare,
  [NOTIFICATION_TYPE.REVIEW_CONCERN]: FiFlag,
  [NOTIFICATION_TYPE.REPORT]: FiFileText,
  [NOTIFICATION_TYPE.USER_REPORT]: FiUserX,
  [NOTIFICATION_TYPE.COMMENT_REPLY]: FiMessageCircle,
    [NOTIFICATION_TYPE.CONTACT]: FiMail,
};

const timeAgo = (dateStr) => {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const NotificationsSection = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const notifications = useSelector(selectNotifications);
  const pagination = useSelector(selectNotificationsPagination);
  const fetchStatus = useSelector(selectNotificationFetchStatus);
  const [page, setPage] = useState(0);

  const refetch = useCallback(() => {
    dispatch(fetchMyNotifications({ page, size: 20, sort: "createdAt,desc" }));
  }, [dispatch, page]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useRefetchOnFocus(refetch);

  // Opening this page is what clears the navbar's unread red-dot — matches
  // how Instagram/Facebook/Airbnb clear the badge on viewing the feed rather
  // than requiring every single notification to be tapped individually.
  useEffect(() => {
    dispatch(markAllNotificationsRead());
  }, [dispatch]);

  // Deep-links a notification to where it can actually be acted on, instead
  // of leaving every notification a dead end.
  //
  // REVIEW_CONCERN is safe for both recipients: an admin gets the single
  // concern resolved by id (GET /api/review-concerns/{id}, works regardless of
  // pagination), a host just lands on their own Reviews page.
  //
  // USER_REPORT's relatedEntityId means two different things depending on who
  // it's for — the reportedUser's id for the admin "new report" notification
  // (GET /api/admin/users/{id}), but the report's own id for the reporter's
  // "your report was updated" notification, which has nowhere to deep-link to
  // yet. Only navigate when the viewer is actually an admin, so a reporter's
  // click doesn't get silently bounced back to their dashboard by RequireRole.
  const handleClick = (notification) => {
    if (!notification.read) {
      dispatch(markNotificationRead(notification.id));
    }

    switch (notification.type) {
      case NOTIFICATION_TYPE.REVIEW_CONCERN:
        navigate("/account/reviews", { state: { concernId: notification.relatedEntityId } });
        break;
      case NOTIFICATION_TYPE.USER_REPORT:
        if (user?.role === "ROLE_ADMIN") {
          navigate(`/account/admin/users/${notification.relatedEntityId}`);
        }
        break;
     case NOTIFICATION_TYPE.CONTACT:
      break;

      default:
        break;
    }
  };

  const handleDelete = (id) => {
  dispatch(deleteNotification(id));
};


const handleDeleteAll = () => {
  dispatch(deleteAllNotifications());
};


  return (
    <div className="space-y-6">
    <div className="flex items-center justify-between">
  <h1 className="text-2xl font-bold text-gray-900">
    Notifications
  </h1>

  {notifications.length > 0 && (
    <button
      onClick={handleDeleteAll}
      className="text-xs font-semibold text-red-600 hover:text-red-800"
    >
      Clear all
    </button>
  )}
</div>


      <SectionCard>
        {fetchStatus === "loading" ? (
          <div className="flex items-center justify-center gap-2 text-[12px] text-neutral-500 font-medium py-12">
            <FiLoader size={14} className="animate-spin" />
            Loading notifications…
          </div>
        ) : notifications.length === 0 ? (
          <PlaceholderCard
            title="Notifications"
           description="Updates about your bookings, payments, reviews, reports, and contact messages will show up here."
            icon={FiBell}
          />
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => {
              const Icon = TYPE_ICON[n.type] || FiBell;
              return (
      <div
  key={n.id}
  onClick={() => handleClick(n)}
  className={`w-full flex items-start gap-3 text-left p-3.5 rounded-xl border transition-colors cursor-pointer ${
    n.read
      ? "border-neutral-100 bg-white hover:bg-neutral-50"
      : "border-neutral-200 bg-neutral-50 hover:bg-neutral-100"
  }`}
>

                  <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center shrink-0">
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-semibold text-neutral-900">{n.title}</p>
                      {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />}
                    </div>
                    <p className="text-[12px] text-neutral-600 mt-0.5">{n.message}</p>
                    
                   <div className="flex justify-between items-center mt-2">
  <p className="text-[11px] text-neutral-400">
    {timeAgo(n.createdAt)}
  </p>

  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      handleDelete(n.id);
    }}
    className="text-[11px] text-red-500 hover:text-red-700"
  >
    Delete
  </button>
</div>


                  </div>
                </div>
              );
            })}

            {pagination.totalPages > 1 && (
              <div className="flex justify-center pt-3">
                <PropertyPagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
              </div>
            )}
          </div>
        )}
      </SectionCard>
    </div>
  );
};

export default NotificationsSection;
