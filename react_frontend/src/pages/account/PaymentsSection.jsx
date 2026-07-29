import { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiCreditCard, FiX, FiLoader, FiExternalLink } from "react-icons/fi";

import SectionCard from "../../components/account/SectionCard";
import PlaceholderCard from "../../components/account/PlaceholderCard";
import StatusPill from "../../components/account/StatusPill";
import PropertyPagination from "../../components/property/PropertyPagination";
import PaymentCheckoutModal from "../../components/booking/PaymentCheckoutModal";
import { formatCurrency } from "../../dataFile/currency";
import useRefetchOnFocus from "../../dataFile/useRefetchOnFocus";

import {
  fetchMyBookings,
  fetchHostBookings,
  selectMyBookings,
  selectHostBookings,
  selectBookingFetchStatus,
} from "../../redux/booking/bookingSlice";

import {
  fetchAllPayments,
  fetchPaymentByBooking,
  clearCurrentPayment,
  selectAllPayments,
  selectCurrentPayment,
  selectPaymentPagination,
  selectIsFetchingAllPayments,
  selectIsFetchingCurrentPayment,
} from "../../redux/payment/paymentSlice";

const PAYMENT_STATUS_TONE = {
  CREATED: "blue",
  PAID: "emerald",
  FAILED: "red",
  REFUNDED: "amber",
};

// Bookings that never left PENDING host-approval never generated a payment order yet.
const PAYMENT_RELEVANT_STATUSES = [
  "BOOKING_PAYMENT_PENDING",
  "CONFIRMED",
  "COMPLETED",
  "GUEST_CANCELLED",
  "HOST_CANCELLED",
  "EXPIRED",
];

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Receipt drawer — fetches the single PaymentResponse for a booking on demand,
// rather than requiring a bulk "my payments" endpoint the backend doesn't expose.
const ReceiptModal = ({ bookingId, onClose }) => {
  const dispatch = useDispatch();
  const payment = useSelector(selectCurrentPayment);
  const isLoading = useSelector(selectIsFetchingCurrentPayment);

  useEffect(() => {
    if (bookingId) dispatch(fetchPaymentByBooking(bookingId));
    return () => {
      dispatch(clearCurrentPayment());
    };
  }, [bookingId, dispatch]);

  if (!bookingId) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between px-6 py-4 border-b border-black/[0.08] bg-neutral-50/50">
          <h2 className="text-[15px] font-semibold text-neutral-900">Payment Receipt</h2>
          <button onClick={onClose} className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-black/[0.05] transition-colors cursor-pointer">
            <FiX size={18} />
          </button>
        </header>

        <div className="px-6 py-5">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 text-[12px] text-neutral-500 font-medium py-8">
              <FiLoader size={14} className="animate-spin" />
              Loading receipt…
            </div>
          ) : !payment ? (
            <p className="text-[12px] text-neutral-400 text-center py-8">
              No payment has been recorded for this booking yet.
            </p>
          ) : (
            <dl className="space-y-3 text-[12px]">
              {payment.propertyTitle && (
                <div className="flex justify-between gap-4">
                  <dt className="text-neutral-400 shrink-0">Property</dt>
                  <dd className="font-semibold text-neutral-900 text-right">{payment.propertyTitle}</dd>
                </div>
              )}
              {payment.guestName && (
                <div className="flex justify-between gap-4">
                  <dt className="text-neutral-400 shrink-0">Guest</dt>
                  <dd className="font-medium text-neutral-700 text-right">{payment.guestName}</dd>
                </div>
              )}
              {payment.hostName && (
                <div className="flex justify-between gap-4">
                  <dt className="text-neutral-400 shrink-0">Host</dt>
                  <dd className="font-medium text-neutral-700 text-right">{payment.hostName}</dd>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-black/[0.06]">
                <dt className="text-neutral-400">Status</dt>
                <dd>
                  <StatusPill label={payment.status} tone={PAYMENT_STATUS_TONE[payment.status] || "neutral"} />
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-400">Amount</dt>
                <dd className="font-semibold text-neutral-900">
                  {formatCurrency((payment.amount || 0) / 100)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-400">Currency</dt>
                <dd className="font-medium text-neutral-700">{payment.currency}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-400 shrink-0">Order ID</dt>
                <dd className="font-mono text-neutral-600 text-right break-all">{payment.razorpayOrderId}</dd>
              </div>
              {payment.razorpayPaymentId && (
                <div className="flex justify-between gap-4">
                  <dt className="text-neutral-400 shrink-0">Payment ID</dt>
                  <dd className="font-mono text-neutral-600 text-right break-all">{payment.razorpayPaymentId}</dd>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t border-black/[0.06]">
                <dt className="text-neutral-400">Date</dt>
                <dd className="font-medium text-neutral-700">{formatDate(payment.createdAt)}</dd>
              </div>
            </dl>
          )}
        </div>
      </div>
    </div>
  );
};

// ADMIN: platform-wide payment ledger via the dedicated admin endpoint.
const AdminPaymentsTable = () => {
  const dispatch = useDispatch();
  const payments = useSelector(selectAllPayments);
  const pagination = useSelector(selectPaymentPagination);
  const isLoading = useSelector(selectIsFetchingAllPayments);
  const [page, setPage] = useState(0);

  const refetch = useCallback(() => {
    dispatch(fetchAllPayments({ page, size: 10, sort: "createdAt,desc" }));
  }, [dispatch, page]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useRefetchOnFocus(refetch);

  return (
    <SectionCard title="All Payments" subtitle="Platform-wide transaction ledger">
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 text-[12px] text-neutral-500 font-medium py-12">
          <FiLoader size={14} className="animate-spin" />
          Loading payments…
        </div>
      ) : payments.length === 0 ? (
        <PlaceholderCard title="No payments yet" description="Transactions will appear here once guests start paying for bookings." icon={FiCreditCard} />
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-black/[0.08]">
            <table className="w-full text-left text-xs text-neutral-700">
              <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider font-semibold border-b border-black/[0.06]">
                <tr>
                  <th className="px-4 py-3">Property</th>
                  <th className="px-4 py-3">Guest</th>
                  <th className="px-4 py-3">Host</th>
                  <th className="px-4 py-3">Booking</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Booking Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.05] bg-white">
                {payments.map((p) => (
                  <tr key={p.paymentId} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="px-4 py-3 font-semibold text-neutral-900">{p.propertyTitle || "—"}</td>
                    <td className="px-4 py-3">{p.guestName || "—"}</td>
                    <td className="px-4 py-3">{p.hostName || "—"}</td>
                    <td className="px-4 py-3 text-neutral-500">#{p.bookingId}</td>
                    <td className="px-4 py-3 font-bold text-neutral-900">{formatCurrency((p.amount || 0) / 100)}</td>
                    <td className="px-4 py-3">
                      <StatusPill label={p.status} tone={PAYMENT_STATUS_TONE[p.status] || "neutral"} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 text-neutral-700">
                        {p.bookingStatus ? p.bookingStatus.replaceAll("_", " ") : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-500 text-[11px]">{formatDate(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex justify-center pt-2">
              <PropertyPagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
};

// USER / HOST: derived from their own bookings, since the backend only exposes
// a single-booking payment lookup (no bulk "my payments" endpoint).
const MyPaymentsList = ({ role }) => {
  const dispatch = useDispatch();
  const myBookings = useSelector(selectMyBookings);
  const hostBookings = useSelector(selectHostBookings);
  const fetchStatus = useSelector(selectBookingFetchStatus);

  const [receiptBookingId, setReceiptBookingId] = useState(null);
  const [payingBooking, setPayingBooking] = useState(null);

  const refetchBookings = useCallback(() => {
    if (role === "ROLE_HOST") dispatch(fetchHostBookings({ page: 0, size: 50, sort: "createdAt,desc" }));
    else dispatch(fetchMyBookings({ page: 0, size: 50, sort: "createdAt,desc" }));
  }, [dispatch, role]);

  useEffect(() => {
    refetchBookings();
  }, [refetchBookings]);

  useRefetchOnFocus(refetchBookings);

  const bookings = role === "ROLE_HOST" ? hostBookings : myBookings;
  const isLoading = role === "ROLE_HOST" ? fetchStatus.host === "loading" : fetchStatus.mine === "loading";

  const relevantBookings = useMemo(
    () => bookings.filter((b) => PAYMENT_RELEVANT_STATUSES.includes(b.status)),
    [bookings],
  );

  const handlePaymentSuccess = refetchBookings;

  return (
    <SectionCard
      title={role === "ROLE_HOST" ? "Payments Received" : "My Payments"}
      subtitle={role === "ROLE_HOST" ? "Payment status across your incoming bookings" : "Your booking payments and receipts"}
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 text-[12px] text-neutral-500 font-medium py-12">
          <FiLoader size={14} className="animate-spin" />
          Loading…
        </div>
      ) : relevantBookings.length === 0 ? (
        <PlaceholderCard
          title="No payments yet"
          description={role === "ROLE_HOST" ? "Payments for your bookings will show up here once guests check out." : "Once you book a stay, your payment status and receipts will appear here."}
          icon={FiCreditCard}
        />
      ) : (
        <div className="space-y-2.5">
          {relevantBookings.map((booking) => (
            <div
              key={booking.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-neutral-900 truncate">{booking.propertyTitle}</p>
                <p className="text-[11px] text-neutral-400 font-medium mt-0.5">Booking #{booking.id} · {formatDate(booking.createdAt)}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[13px] font-bold text-neutral-900">{formatCurrency(booking.totalPrice)}</span>
                <StatusPill
                  label={booking.status === "BOOKING_PAYMENT_PENDING" ? "Pending" : booking.status.replaceAll("_", " ")}
                  tone={
                    booking.status === "CONFIRMED" || booking.status === "COMPLETED"
                      ? "emerald"
                      : booking.status === "BOOKING_PAYMENT_PENDING"
                        ? "amber"
                        : "neutral"
                  }
                />

                {role !== "ROLE_HOST" && booking.status === "BOOKING_PAYMENT_PENDING" ? (
                  <button
                    onClick={() => setPayingBooking(booking)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-900 text-white text-[11px] font-semibold hover:bg-black transition-colors cursor-pointer"
                  >
                    Pay Now
                  </button>
                ) : (
                  <button
                    onClick={() => setReceiptBookingId(booking.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-black/[0.08] text-[11px] font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    <FiExternalLink size={12} />
                    Receipt
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {receiptBookingId && (
        <ReceiptModal bookingId={receiptBookingId} onClose={() => setReceiptBookingId(null)} />
      )}

      <PaymentCheckoutModal
        open={Boolean(payingBooking)}
        booking={payingBooking}
        onClose={() => setPayingBooking(null)}
        onPaid={handlePaymentSuccess}
      />
    </SectionCard>
  );
};

const PaymentsSection = () => {
  const { user } = useSelector((state) => state.auth);
  const role = user?.role;

  return (
    <div className="space-y-6">
      <h1 className="text-[20px] font-semibold tracking-tight text-neutral-900">Payments</h1>
      {role === "ROLE_ADMIN" ? <AdminPaymentsTable /> : <MyPaymentsList role={role} />}
    </div>
  );
};

export default PaymentsSection;
