import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FiFileText, FiLoader, FiUserX } from "react-icons/fi";

import SectionCard from "../../components/account/SectionCard";
import PlaceholderCard from "../../components/account/PlaceholderCard";
import StatusPill from "../../components/account/StatusPill";
import PropertyPagination from "../../components/property/PropertyPagination";
import useRefetchOnFocus from "../../dataFile/useRefetchOnFocus";
import {
  fetchReports,
  updateReportStatus,
  selectAllReports,
  selectReportPagination,
  selectReportFetchStatus,
  REPORT_STATUS,
} from "../../redux/report/reportSlice";
import {
  fetchUserReports,
  updateUserReportStatus,
  selectAllUserReports,
  selectUserReportPagination,
  selectUserReportFetchStatus,
  USER_REPORT_STATUS,
} from "../../redux/userReport/userReportSlice";

const STATUS_TONE = {
  PENDING: "amber",
  UNDER_REVIEW: "blue",
  RESOLVED: "emerald",
  REJECTED: "red",
};

const formatDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const ReportRow = ({ report }) => {
  const dispatch = useDispatch();
  const [note, setNote] = useState(report.adminNote || "");
  const [status, setStatus] = useState(report.status);

  const dirty = note !== (report.adminNote || "") || status !== report.status;

  return (
    <div className="p-4 rounded-xl border border-neutral-200 bg-white space-y-2.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold text-neutral-900">{report.propertyTitle}</p>
          <p className="text-[11px] text-neutral-400">
            {report.type.replaceAll("_", " ")} · reported by {report.reporterName} · {formatDate(report.createdAt)}
          </p>
        </div>
        <StatusPill label={report.status.replaceAll("_", " ")} tone={STATUS_TONE[report.status] || "neutral"} />
      </div>

      <p className="text-[13px] text-neutral-600">{report.description}</p>

      <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr_auto] gap-2 items-start pt-2 border-t border-black/[0.05]">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-neutral-200 text-[12px] font-medium text-neutral-700 cursor-pointer focus:outline-none focus:border-neutral-900"
        >
          {Object.values(REPORT_STATUS).map((s) => (
            <option key={s} value={s}>
              {s.replaceAll("_", " ")}
            </option>
          ))}
        </select>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Admin note (optional)"
          className="px-3 py-1.5 rounded-lg border border-neutral-200 text-[12px] outline-none focus:border-neutral-900"
        />
        <button
          disabled={!dirty}
          onClick={() => dispatch(updateReportStatus({ id: report.id, data: { status, adminNote: note || undefined } }))}
          className="px-4 py-1.5 rounded-sm bg-neutral-900 text-white text-[11px] font-bold uppercase tracking-wider disabled:opacity-30 cursor-pointer"
        >
          Save
        </button>
      </div>
    </div>
  );
};

const ListingReportsTab = () => {
  const dispatch = useDispatch();
  const reports = useSelector(selectAllReports);
  const pagination = useSelector(selectReportPagination);
  const fetchStatus = useSelector(selectReportFetchStatus);

  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const refetch = useCallback(() => {
    const params = { page, size: 10, sort: "createdAt,desc" };
    if (statusFilter !== "ALL") params.status = statusFilter;
    dispatch(fetchReports(params));
  }, [dispatch, page, statusFilter]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useRefetchOnFocus(refetch);

  const isLoading = fetchStatus.all === "loading";
  const statusFilters = ["ALL", ...Object.values(REPORT_STATUS)];

  return (
    <>
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-4 border-b border-black/[0.06] mb-4">
        {statusFilters.map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatusFilter(s);
              setPage(0);
            }}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === s ? "bg-neutral-900 text-white" : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
            }`}
          >
            {s === "ALL" ? "All" : s.replaceAll("_", " ")}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 text-[12px] text-neutral-500 font-medium py-12">
          <FiLoader size={14} className="animate-spin" />
          Loading reports…
        </div>
      ) : reports.length === 0 ? (
        <PlaceholderCard title="No reports" description="Reported listings will appear here for review." icon={FiFileText} />
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <ReportRow key={r.id} report={r} />
          ))}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center pt-2">
              <PropertyPagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>
      )}
    </>
  );
};

const UserReportRow = ({ report }) => {
  const dispatch = useDispatch();
  const [note, setNote] = useState(report.adminNote || "");
  const [status, setStatus] = useState(report.status);

  const dirty = note !== (report.adminNote || "") || status !== report.status;

  return (
    <div className="p-4 rounded-xl border border-neutral-200 bg-white space-y-2.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link
            to={`/account/admin/users/${report.reportedUserId}`}
            className="text-[13px] font-semibold text-neutral-900 hover:underline"
          >
            {report.reportedUserName}
          </Link>
          <p className="text-[11px] text-neutral-400">
            {report.type.replaceAll("_", " ")} · reported by {report.reporterName} · {formatDate(report.createdAt)}
          </p>
        </div>
        <StatusPill label={report.status.replaceAll("_", " ")} tone={STATUS_TONE[report.status] || "neutral"} />
      </div>

      <p className="text-[13px] text-neutral-600">{report.description}</p>

      <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr_auto] gap-2 items-start pt-2 border-t border-black/[0.05]">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-neutral-200 text-[12px] font-medium text-neutral-700 cursor-pointer focus:outline-none focus:border-neutral-900"
        >
          {Object.values(USER_REPORT_STATUS).map((s) => (
            <option key={s} value={s}>
              {s.replaceAll("_", " ")}
            </option>
          ))}
        </select>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Admin note (optional)"
          className="px-3 py-1.5 rounded-lg border border-neutral-200 text-[12px] outline-none focus:border-neutral-900"
        />
        <button
          disabled={!dirty}
          onClick={() => dispatch(updateUserReportStatus({ id: report.id, data: { status, adminNote: note || undefined } }))}
          className="px-4 py-1.5 rounded-sm bg-neutral-900 text-white text-[11px] font-bold uppercase tracking-wider disabled:opacity-30 cursor-pointer"
        >
          Save
        </button>
      </div>
    </div>
  );
};

const UserReportsTab = () => {
  const dispatch = useDispatch();
  const reports = useSelector(selectAllUserReports);
  const pagination = useSelector(selectUserReportPagination);
  const fetchStatus = useSelector(selectUserReportFetchStatus);

  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const refetch = useCallback(() => {
    const params = { page, size: 10, sort: "createdAt,desc" };
    if (statusFilter !== "ALL") params.status = statusFilter;
    dispatch(fetchUserReports(params));
  }, [dispatch, page, statusFilter]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useRefetchOnFocus(refetch);

  const isLoading = fetchStatus.all === "loading";
  const statusFilters = ["ALL", ...Object.values(USER_REPORT_STATUS)];

  return (
    <>
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-4 border-b border-black/[0.06] mb-4">
        {statusFilters.map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatusFilter(s);
              setPage(0);
            }}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === s ? "bg-neutral-900 text-white" : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
            }`}
          >
            {s === "ALL" ? "All" : s.replaceAll("_", " ")}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 text-[12px] text-neutral-500 font-medium py-12">
          <FiLoader size={14} className="animate-spin" />
          Loading reports…
        </div>
      ) : reports.length === 0 ? (
        <PlaceholderCard title="No reports" description="Reports filed against guests or hosts will appear here." icon={FiUserX} />
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <UserReportRow key={r.id} report={r} />
          ))}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center pt-2">
              <PropertyPagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>
      )}
    </>
  );
};

const AdminReportsSection = () => {
  const [tab, setTab] = useState("listings");

  return (
    <div className="space-y-5">
      <h1 className="text-[20px] font-semibold tracking-tight text-neutral-900">Reports</h1>

      <SectionCard subtitle="Guest and host reports flagged for moderation">
        <div className="flex items-center gap-1 pb-4 border-b border-black/[0.06] mb-4">
          {[
            { key: "listings", label: "Listing Reports" },
            { key: "users", label: "User Reports" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                tab === t.key ? "bg-neutral-900 text-white" : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "listings" ? <ListingReportsTab /> : <UserReportsTab />}
      </SectionCard>
    </div>
  );
};

export default AdminReportsSection;
