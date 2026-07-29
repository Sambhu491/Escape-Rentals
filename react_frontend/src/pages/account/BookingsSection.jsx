import { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiCalendar, FiChevronLeft, FiChevronRight } from "react-icons/fi";

import SectionCard from "../../components/account/SectionCard";
import BookingCard from "../../components/booking/BookingCard";
import PaymentCheckoutModal from "../../components/booking/PaymentCheckoutModal";
import {
  fetchProperties,
  selectAllProperties,
} from "../../redux/property/propertySlice";
import useRefetchOnFocus from "../../dataFile/useRefetchOnFocus";

import {
  fetchMyBookings,
  fetchHostBookings,
  fetchBookings,
  cancelBooking,
  approveBooking,
  rejectBooking,
  hostCancelBooking,
  adminConfirmPayment,
  adminRejectPayment,
  selectMyBookings,
  selectHostBookings,
  selectAllBookings,
  selectBookingFetchStatus,
  selectBookingMutationStatus,
  selectBookingError,
  selectMyBookingsPagination,
  selectHostBookingsPagination,
  selectBookingPagination,
} from "../../redux/booking/bookingSlice";

// ─── Filter Tab Definitions ──────────────────────────────────────
const FILTER_TABS = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: "Pending", statuses: ["PENDING", "BOOKING_PAYMENT_PENDING"] },
  { key: "CONFIRMED", label: "Confirmed", statuses: ["CONFIRMED"] },
  { key: "COMPLETED", label: "Completed", statuses: ["COMPLETED"] },
  { key: "CANCELLED", label: "Cancelled", statuses: ["GUEST_CANCELLED", "HOST_CANCELLED", "EXPIRED"] },
];

const PAGE_SIZE = 10;

// ─── Skeleton Card ───────────────────────────────────────────────
const BookingSkeleton = () => (
  <div className="flex flex-col sm:flex-row rounded-xl border border-black/[0.05] overflow-hidden animate-pulse">
    <div className="w-full sm:w-36 h-44 sm:h-auto bg-black/[0.04] shrink-0" />
    <div className="flex-1 p-5 space-y-3">
      <div className="flex justify-between">
        <div className="space-y-1.5">
          <div className="h-4 w-40 bg-black/[0.04] rounded" />
          <div className="h-3 w-20 bg-black/[0.03] rounded" />
        </div>
        <div className="h-5 w-16 bg-black/[0.04] rounded" />
      </div>
      <div className="flex gap-4">
        <div className="h-3 w-32 bg-black/[0.03] rounded" />
        <div className="h-3 w-16 bg-black/[0.03] rounded" />
      </div>
      <div className="flex justify-end gap-2 pt-3 border-t border-black/[0.04]">
        <div className="h-7 w-20 bg-black/[0.03] rounded-lg" />
        <div className="h-7 w-20 bg-black/[0.03] rounded-lg" />
      </div>
    </div>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────
const BookingsSection = () => {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const role = user?.role;

  const myBookings = useSelector(selectMyBookings);
  const hostBookings = useSelector(selectHostBookings);
  const allBookings = useSelector(selectAllBookings);

  const fetchStatus = useSelector(selectBookingFetchStatus);
  const mutationStatus = useSelector(selectBookingMutationStatus);
  const error = useSelector(selectBookingError);

  const myPagination = useSelector(selectMyBookingsPagination);
  const hostPagination = useSelector(selectHostBookingsPagination);
  const adminPagination = useSelector(selectBookingPagination);

  const [activeTab, setActiveTab] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(0);
  const [payingBooking, setPayingBooking] = useState(null);

  const properties = useSelector(selectAllProperties);

  // Build lookup mapping for faster lookups
  const propertyImageMap = useMemo(() => {
    const map = {};
    properties.forEach((p) => {
      if (p.images?.length > 0) {
        map[p.id] = p.images[0].imageUrl || p.images[0];
      }
    });
    return map;
  }, [properties]);

  // Resolve role-based data arrays safely
  const bookings = useMemo(() => {
    if (role === "ROLE_USER") return myBookings || [];
    if (role === "ROLE_HOST") return hostBookings || [];
    return allBookings || [];
  }, [role, myBookings, hostBookings, allBookings]);

  const pagination = useMemo(() => {
    if (role === "ROLE_USER") return myPagination;
    if (role === "ROLE_HOST") return hostPagination;
    return adminPagination;
  }, [role, myPagination, hostPagination, adminPagination]);

  const isLoading = useMemo(() => {
    if (role === "ROLE_USER") return fetchStatus.mine === "loading";
    if (role === "ROLE_HOST") return fetchStatus.host === "loading";
    return fetchStatus.all === "loading";
  }, [role, fetchStatus]);

  const isFailed = useMemo(() => {
    if (role === "ROLE_USER") return fetchStatus.mine === "failed";
    if (role === "ROLE_HOST") return fetchStatus.host === "failed";
    return fetchStatus.all === "failed";
  }, [role, fetchStatus]);

  // Data Fetching logic
  const refetchBookings = useCallback(() => {
    const params = { page: currentPage, size: PAGE_SIZE, sort: "createdAt,desc" };
    if (role === "ROLE_USER") dispatch(fetchMyBookings(params));
    else if (role === "ROLE_HOST") dispatch(fetchHostBookings(params));
    else if (role === "ROLE_ADMIN") dispatch(fetchBookings(params));
  }, [dispatch, role, currentPage]);

  useEffect(() => {
    refetchBookings();
    dispatch(fetchProperties({ page: 0, size: 100 }));
  }, [dispatch, refetchBookings]);

  useRefetchOnFocus(refetchBookings);

  useEffect(() => {
  setCurrentPage(0);
}, [activeTab]);

  // Client-side filtering logic
  const filteredBookings = useMemo(() => {
    if (activeTab === "ALL") return bookings;
    const tab = FILTER_TABS.find((t) => t.key === activeTab);
    if (!tab?.statuses) return bookings;
    return bookings.filter((b) => tab.statuses.includes(b.status));
  }, [bookings, activeTab]);

  // Mutators
  const handleCancel = useCallback((id) => dispatch(cancelBooking(id)), [dispatch]);
  const handleReject = useCallback((id) => dispatch(rejectBooking({ id })), [dispatch]);
  const handleApprove = useCallback((id) => dispatch(approveBooking({ id })), [dispatch]);
  const handleHostCancel = useCallback((id) => dispatch(hostCancelBooking({ id })), [dispatch]);
  const handleAdminConfirmPayment = useCallback((id) => dispatch(adminConfirmPayment({ id })), [dispatch]);
  const handleAdminRejectPayment = useCallback((id) => dispatch(adminRejectPayment({ id })), [dispatch]);

  const handlePaymentSuccess = useCallback(() => {
    refetchBookings();
  }, [refetchBookings]);



  // Fix 5: Instantaneous scroll position update (removes jarring smooth scroll animations)
const handlePageChange = useCallback(
  (page) => {
    if (page < 0 || page >= (pagination?.totalPages || 1)) return;

    setCurrentPage(page);
    window.scrollTo({ top: 0 });
  },
  [pagination?.totalPages]
);
  // Title configuration mapping
  const sectionTitle =
    role === "ROLE_HOST"
      ? "Incoming Bookings"
      : role === "ROLE_ADMIN"
        ? "All Bookings"
        : "My Bookings";

  const sectionSubtitle =
    role === "ROLE_HOST"
      ? "Manage reservation requests for your properties"
      : role === "ROLE_ADMIN"
        ? "Platform-wide booking activity"
        : "Your upcoming and past trip reservations";

  // Fix 1: Show initial skeleton configuration strictly when no records exist yet
  const showInitialLoading = isLoading && bookings.length === 0;

  if (showInitialLoading) {
    return (
      <div className="space-y-5">
        <h1 className="text-[20px] font-semibold tracking-tight text-neutral-900">
          {sectionTitle}
        </h1>
        <SectionCard title={sectionTitle} subtitle={sectionSubtitle}>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <BookingSkeleton key={i} />
            ))}
          </div>
        </SectionCard>
      </div>
    );
  }

    const hasPagination =
  filteredBookings.length > 0 &&
  pagination?.totalPages > 1;

  return (
    <div className="space-y-5">
      <h1 className="text-[20px] font-semibold tracking-tight text-neutral-900">
        {sectionTitle}
      </h1>

      <SectionCard title={sectionTitle} subtitle={sectionSubtitle}>
        {/* Navigation Tabs Container */}
        <div className="flex items-center gap-1 
        overflow-x-auto scrollbar-none 
        mb-3 -mx-1 px-1">
          {FILTER_TABS.map((tab) => {
            const count =
              tab.key === "ALL"
                ? bookings.length
                : bookings.filter((b) => tab.statuses?.includes(b.status)).length;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  shrink-0 px-3.5 py-1.5 rounded-full
                  text-[11px] font-semibold
                  transition-all duration-150 ease-out
                  active:scale-[0.97]
                  ${
                    activeTab === tab.key
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-400 hover:text-neutral-700 hover:bg-black/[0.03]"
                  }
                `}
              >
                {tab.label}
                {count > 0 && (
                  <span className={`ml-1.5 ${activeTab === tab.key ? "text-white/60" : "text-neutral-300"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

              {/* Pagination Controls Section */}
        {!isFailed && hasPagination && (
          <div className="flex items-center 
          justify-center gap-2 m-2  ">
            {/* Fix 4: Added disabled condition on background pagination events */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0 || isLoading}
              className="
                p-2 rounded-lg border border-black/[0.06]
                text-neutral-500 hover:text-neutral-900 hover:bg-black/[0.02]
                disabled:opacity-30 disabled:cursor-not-allowed
                transition-all duration-150 ease-out
              "
              aria-label="Previous page"
            >
              <FiChevronLeft size={15} />
            </button>

            {[...Array(pagination.totalPages)].map((_, i) => (
              <button
                key={i}
                disabled={isLoading}
                onClick={() => handlePageChange(i)}
                className={`
                  w-8 h-8 rounded-lg text-[12px] font-semibold
                  transition-all duration-150 ease-out
                  disabled:opacity-40 disabled:cursor-not-allowed
                  ${
                    i === currentPage
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-500 hover:bg-black/[0.03]"
                  }
                `}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= pagination.totalPages - 1 || isLoading}
              className="
                p-2 rounded-lg border border-black/[0.06]
                text-neutral-500 hover:text-neutral-900 hover:bg-black/[0.02]
                disabled:opacity-30 disabled:cursor-not-allowed
                transition-all duration-150 ease-out
              "
              aria-label="Next page"
            >
              <FiChevronRight size={15} />
            </button>
          </div>
        )}

        {/* Fix 2 & 3: Relative layout container with precise min-height constraint */}
       <div className={`relative ${filteredBookings.length ? "min-h-[520px]" : "min-h-[300px]"}`}>
          {/* Fix 2: Contextual overlay spinner during pagination events */}
          {isLoading && (
            <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[1px] rounded-xl flex items-center justify-center transition-all duration-200">
              <div className="w-6 h-6 rounded-full border-2 border-neutral-200 border-t-neutral-900 animate-spin" />
            </div>
          )}

          {isFailed ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-red-500/[0.06] flex items-center justify-center mb-4">
                <FiCalendar size={22} className="text-red-400" />
              </div>
              <h3 className="text-[15px] font-semibold text-neutral-900 mb-1">
                Failed to load bookings
              </h3>
              <p className="text-[12px] text-neutral-400 max-w-xs mb-5">
                {error || "Something went wrong while fetching your bookings."}
              </p>
              <button
                onClick={refetchBookings}
                className="
                  px-5 py-2.5 rounded-xl bg-neutral-900 text-white
                  text-[11px] font-bold uppercase tracking-[0.15em]
                  hover:bg-black transition-all duration-150 ease-out
                  active:scale-[0.98]
                "
              >
                Try Again
              </button>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-black/[0.03] flex items-center justify-center mb-4">
                <FiCalendar size={22} className="text-neutral-300" />
              </div>
              <h3 className="text-[15px] font-semibold text-neutral-900 mb-1">
                {activeTab === "ALL" ? "No bookings yet" : `No ${activeTab.toLowerCase()} bookings`}
              </h3>
              <p className="text-[12px] text-neutral-400 max-w-xs">
                {activeTab === "ALL"
                  ? "When you make a reservation, it will appear here."
                  : "Try selecting a different filter tab."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  role={role}
                  propertyImage={propertyImageMap[booking.propertyId] || null}
                  onCancel={handleCancel}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onPayNow={setPayingBooking}
                  onHostCancel={handleHostCancel}
                  onAdminConfirmPayment={handleAdminConfirmPayment}
                  onAdminRejectPayment={handleAdminRejectPayment}
                  isCancelling={mutationStatus.cancel === "loading"}
                  isApproving={mutationStatus.approve === "loading"}
                  isRejecting={mutationStatus.reject === "loading"}
                  isHostCancelling={mutationStatus.hostCancel === "loading"}
                  isAdminConfirmingPayment={mutationStatus.adminConfirmPayment === "loading"}
                  isAdminRejectingPayment={mutationStatus.adminRejectPayment === "loading"}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination Controls Section */}
   {!isFailed && hasPagination && (
          <div className="flex items-center justify-center gap-2 pt-5 mt-3 border-t border-black/[0.04]">
            {/* Fix 4: Added disabled condition on background pagination events */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0 || isLoading}
              className="
                p-2 rounded-lg border border-black/[0.06]
                text-neutral-500 hover:text-neutral-900 hover:bg-black/[0.02]
                disabled:opacity-30 disabled:cursor-not-allowed
                transition-all duration-150 ease-out
              "
              aria-label="Previous page"
            >
              <FiChevronLeft size={15} />
            </button>

            {[...Array(pagination.totalPages)].map((_, i) => (
              <button
                key={i}
                disabled={isLoading}
                onClick={() => handlePageChange(i)}
                className={`
                  w-8 h-8 rounded-lg text-[12px] font-semibold
                  transition-all duration-150 ease-out
                  disabled:opacity-40 disabled:cursor-not-allowed
                  ${
                    i === currentPage
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-500 hover:bg-black/[0.03]"
                  }
                `}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= pagination.totalPages - 1 || isLoading}
              className="
                p-2 rounded-lg border border-black/[0.06]
                text-neutral-500 hover:text-neutral-900 hover:bg-black/[0.02]
                disabled:opacity-30 disabled:cursor-not-allowed
                transition-all duration-150 ease-out
              "
              aria-label="Next page"
            >
              <FiChevronRight size={15} />
            </button>
          </div>
        )}
      </SectionCard>

      <PaymentCheckoutModal
        open={Boolean(payingBooking)}
        booking={payingBooking}
        onClose={() => setPayingBooking(null)}
        onPaid={handlePaymentSuccess}
      />
    </div>
  );
};

export default BookingsSection;