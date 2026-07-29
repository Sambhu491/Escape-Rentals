import React from 'react';
import useRoleDashboard from '../../dataFile/useRoleDashboard';
import SectionCard from '../../components/account/SectionCard';
import DashboardGrid from '../../components/account/DashboardGrid';
import QuickActions from '../../components/account/QuickActions';
import BreakdownBar from '../../components/account/dashboard/BreakdownBar';
import RatingMeter from '../../components/account/dashboard/RatingMeter';
import { formatCurrency } from '../../dataFile/currency';
import { FiCalendar, FiHome, FiDollarSign, FiPercent, FiTrendingUp } from 'react-icons/fi';

// A hero figure leads each dashboard with the one number that matters most —
// per the dataviz skill, "the single number a dashboard leads with" gets its
// own standalone treatment rather than competing inside a grid of equals.
const HeroFigure = ({ label, value, sub }) => (
  <div className="space-y-1">
    <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-400">{label}</p>
    <p className="text-[34px] sm:text-[40px] font-semibold tracking-tight text-neutral-900 leading-none">
      {value}
    </p>
    {sub && <p className="text-[12px] text-neutral-400">{sub}</p>}
  </div>
);

const clamp0 = (n) => Math.max(0, n || 0);

// Every ratio below is arithmetic on fields the dashboard endpoints already
// return (no new backend fields) — divide-by-zero guarded since a brand-new
// account/property has every count at 0.
const safeDiv = (numerator, denominator) =>
  denominator > 0 ? numerator / denominator : null;

const asCurrency = (n) => (n == null ? '—' : formatCurrency(n));
const asPercent = (n) => (n == null ? '—' : `${Math.round(n * 100)}%`);

const DashboardSection = () => {
  const { data, isLoading, role } = useRoleDashboard();



  // ─── Loading ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-7 w-32 bg-black/[0.04] rounded-lg animate-pulse" />
        <div className="rounded-2xl bg-white border border-black/[0.05] p-5 space-y-4">
          <div className="h-10 w-40 bg-black/[0.04] rounded animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-start gap-3.5 p-4 animate-pulse">
                <div className="w-9 h-9 rounded-[10px] bg-black/[0.04]" />
                <div className="space-y-2 pt-1">
                  <div className="h-5 w-14 bg-black/[0.04] rounded" />
                  <div className="h-3 w-20 bg-black/[0.03] rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── USER ───────────────────────────────────────────────────
  const renderUser = () => {
    const other = clamp0(
      (data?.totalBookings ?? 0) -
        (data?.upcomingBookings ?? 0) -
        (data?.completedBookings ?? 0) -
        (data?.cancelledBookings ?? 0),
    );

    return (
      <SectionCard title="Overview" subtitle="Your booking summary">
        <div className="space-y-6">

<p className="text-zinc-600 text-sm md:text-md bg-green-100"> 
  Total and Avg spent is based on completed stay. 
  Not by payment made. More detailed Overview 
  <span className="mx-2 underline"> Coming Soon </span> 
  </p>

          <HeroFigure
            label="Total spent"
            value={formatCurrency(data?.totalSpent)}
            sub={`Across ${data?.totalBookings ?? 0} booking${data?.totalBookings === 1 ? '' : 's'}`}
          />

          <BreakdownBar
            title="Where your bookings stand"
            segments={[
              { label: 'Upcoming', value: clamp0(data?.upcomingBookings) },
              { label: 'Completed', value: clamp0(data?.completedBookings) },
              { label: 'Cancelled', value: clamp0(data?.cancelledBookings) },
              { label: 'Pending / other', value: other },
            ]}
          />

          <DashboardGrid
            stats={[
              {
                title: 'Avg. Spend / Booking',
                value: asCurrency(safeDiv(data?.totalSpent, data?.totalBookings)),
                icon: FiDollarSign,
                color: 'purple',
              },
            ]}
            columns="grid-cols-1 sm:grid-cols-2"
          />
        </div>
      </SectionCard>
    );
  };

  // ─── HOST ───────────────────────────────────────────────────
  const renderHost = () => (
    <SectionCard title="Overview" subtitle="Your hosting performance">
      <div className="space-y-6">
        <p className="text-zinc-600 text-sm md:text-md bg-green-100"> 
  Total and Avg Reveue is based on completed stay. 
  Not by payment made. More detailed Overview 
  <span className="mx-2 underline"> Coming Soon </span> 
  </p>

        <HeroFigure
          label="Total revenue"
          value={formatCurrency(data?.totalRevenue)}
          sub={`From ${data?.completedBookings ?? 0} completed stay${data?.completedBookings === 1 ? '' : 's'}`}
        />

        <RatingMeter label="Guest satisfaction" value={data?.averageRating} />

        <BreakdownBar
          title="Booking pipeline"
          segments={[
            { label: 'Active', value: clamp0(data?.activeBookings) },
            { label: 'Completed', value: clamp0(data?.completedBookings) },
          ]}
        />

        <DashboardGrid
          stats={[
            { title: 'Total Properties', value: data?.totalProperties, icon: FiHome, color: 'blue' },
            { title: 'Active Bookings', value: data?.activeBookings, icon: FiCalendar, color: 'emerald' },
            {
              title: 'Revenue / Completed Stay',
              value: asCurrency(safeDiv(data?.totalRevenue, data?.completedBookings)),
              icon: FiDollarSign,
              color: 'purple',
            },
          ]}
          columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        />
      </div>
    </SectionCard>
  );

  // ─── ADMIN ──────────────────────────────────────────────────
  const renderAdmin = () => {
    const guests = clamp0(
      (data?.totalUsers ?? 0) - (data?.totalHosts ?? 0) - (data?.totalAdmins ?? 0),
    );
    const propertiesOther = clamp0(
      (data?.totalProperties ?? 0) - (data?.activeProperties ?? 0) - (data?.unavailableProperties ?? 0),
    );
    const reportsResolved = clamp0((data?.totalReports ?? 0) - (data?.pendingReports ?? 0));

    const totalPaymentOutcomes =
      clamp0(data?.paymentsReceived) + clamp0(data?.failedPayments) + clamp0(data?.refundedPayments);
    const bookingConversion = safeDiv(
      clamp0(data?.confirmedBookings) + clamp0(data?.completedBookings),
      data?.totalBookings,
    );
    const paymentSuccessRate = safeDiv(clamp0(data?.paymentsReceived), totalPaymentOutcomes);
    const revenuePerBooking = safeDiv(data?.totalRevenue, data?.completedBookings);
    const reportResolutionRate = safeDiv(reportsResolved, data?.totalReports);

    return (
      <>
        <SectionCard title="Overview" subtitle="Platform revenue at a glance">
          
          <p className="text-zinc-600 text-sm md:text-md bg-green-100"> 
  Total and Avg Revenue is based on completed stay. 
  Not by payment made. More detailed Overview 
  <span className="mx-2 underline"> Coming Soon </span> 
  </p>
          
          <HeroFigure
            label="Total revenue"
            value={formatCurrency(data?.totalRevenue)}
            sub={`From ${data?.completedBookings ?? 0} completed booking${data?.completedBookings === 1 ? '' : 's'}`}
          />
          
        </SectionCard>

        <SectionCard title="Performance" subtitle="Ratios computed from the numbers below — the story behind the totals">
          <DashboardGrid
            stats={[
              { title: 'Booking Conversion', value: asPercent(bookingConversion), icon: FiPercent, color: 'emerald' },
              { title: 'Payment Success Rate', value: asPercent(paymentSuccessRate), icon: FiPercent, color: 'blue' },
              { title: 'Revenue / Booking', value: asCurrency(revenuePerBooking), icon: FiTrendingUp, color: 'purple' },
              { title: 'Reports Resolved', value: asPercent(reportResolutionRate), icon: FiPercent, color: 'amber' },
            ]}
            columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          />
        </SectionCard>

        <SectionCard title="Accounts" subtitle="Who's on the platform">
          <BreakdownBar
            segments={[
              { label: 'Guests', value: guests },
              { label: 'Hosts', value: clamp0(data?.totalHosts) },
              { label: 'Admins', value: clamp0(data?.totalAdmins) },
            ]}
          />
        </SectionCard>

        <SectionCard title="Properties" subtitle="Listing portfolio status">
          <BreakdownBar
            segments={[
              { label: 'Active', value: clamp0(data?.activeProperties) },
              { label: 'Unavailable', value: clamp0(data?.unavailableProperties) },
              { label: 'Other', value: propertiesOther },
            ]}
          />
        </SectionCard>

        <SectionCard title="Bookings" subtitle="Where every booking stands, start to finish">
          <BreakdownBar
            segments={[
              { label: 'Pending', value: clamp0(data?.pendingBookings) },
              { label: 'Payment pending', value: clamp0(data?.bookingPaymentPending) },
              { label: 'Confirmed', value: clamp0(data?.confirmedBookings) },
              { label: 'Completed', value: clamp0(data?.completedBookings) },
              { label: 'Cancelled', value: clamp0(data?.cancelledBookings) },
              { label: 'Expired', value: clamp0(data?.expiredBookings) },
            ]}
          />
        </SectionCard>

        <SectionCard title="Payments" subtitle="Known payment outcomes">
          <BreakdownBar
            segments={[
              { label: 'Received', value: clamp0(data?.paymentsReceived) },
              { label: 'Failed', value: clamp0(data?.failedPayments) },
              { label: 'Refunded', value: clamp0(data?.refundedPayments) },
            ]}
          />
        </SectionCard>

        <SectionCard title="Reviews" subtitle="Guest feedback across every property">
          <div className="space-y-4">
            <RatingMeter label="Platform average rating" value={data?.averageRating} />
            <p className="text-[11px] text-neutral-400">
              Based on {data?.totalReviews ?? 0} review{data?.totalReviews === 1 ? '' : 's'}
            </p>
          </div>
        </SectionCard>

        <SectionCard title="Reports" subtitle="Moderation queue">
          <BreakdownBar
            segments={[
              { label: 'Pending', value: clamp0(data?.pendingReports) },
              { label: 'Resolved', value: reportsResolved },
            ]}
          />
        </SectionCard>
      </>
    );
  };

  // ─── Render ─────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      <h1 className="text-[20px] font-semibold tracking-tight text-neutral-900">
        Dashboard
      </h1>

      <SectionCard title="Quick Actions" subtitle="Frequently used shortcuts">
        <QuickActions role={role} />
      </SectionCard>

      {role === 'ROLE_USER' && renderUser()}
      {role === 'ROLE_HOST' && renderHost()}
      {role === 'ROLE_ADMIN' && renderAdmin()}
    </div>
  );
};

export default DashboardSection;
