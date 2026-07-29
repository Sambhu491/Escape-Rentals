import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiArrowLeft, FiLoader, FiAlertTriangle, FiShieldOff, FiUser } from "react-icons/fi";

import SectionCard from "../../components/account/SectionCard";
import PlaceholderCard from "../../components/account/PlaceholderCard";
import StatusPill from "../../components/account/StatusPill";
import PropertyPagination from "../../components/property/PropertyPagination";
import {
  fetchUserById,
  disableUser,
  enableUser,
  deleteUser,
  selectSelectedUser,
  selectAdminUserFetchStatus,
  selectAdminUserMutationStatus,
  clearSelectedUser,
  DISABLE_DURATION,
} from "../../redux/admin/adminUserSlice";
import {
  fetchReportsForUser,
  updateUserReportStatus,
  selectReportsForUser,
  selectReportsForUserPagination,
  selectUserReportFetchStatus,
  USER_REPORT_STATUS,
} from "../../redux/userReport/userReportSlice";

const ROLE_LABELS = { ROLE_USER: "User", ROLE_HOST: "Host", ROLE_ADMIN: "Admin" };

const REPORT_STATUS_TONE = {
  PENDING: "amber",
  UNDER_REVIEW: "blue",
  RESOLVED: "emerald",
  REJECTED: "red",
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

// Mirrors AdminReportsSection's ReportRow — same inline status-editor pattern,
// just pointed at the userReport domain instead of the property report one.
const UserReportRow = ({ report }) => {
  const dispatch = useDispatch();
  const [note, setNote] = useState(report.adminNote || "");
  const [status, setStatus] = useState(report.status);

  const dirty = note !== (report.adminNote || "") || status !== report.status;

  return (
    <div className="p-4 rounded-xl border border-neutral-200 bg-white space-y-2.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold text-neutral-900">
            {report.type.replaceAll("_", " ")}
          </p>
          <p className="text-[11px] text-neutral-400">
            Reported by {report.reporterName} · {formatDate(report.createdAt)}
          </p>
        </div>
        <StatusPill label={report.status.replaceAll("_", " ")} tone={REPORT_STATUS_TONE[report.status] || "neutral"} />
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

const AdminUserDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector(selectSelectedUser);
  const fetchStatus = useSelector(selectAdminUserFetchStatus);
  const mutationStatus = useSelector(selectAdminUserMutationStatus);

  const reports = useSelector(selectReportsForUser);
  const reportsPagination = useSelector(selectReportsForUserPagination);
  const reportsFetchStatus = useSelector(selectUserReportFetchStatus);

  const [page, setPage] = useState(0);
  const [disabling, setDisabling] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    dispatch(fetchUserById(id));
    return () => dispatch(clearSelectedUser());
  }, [dispatch, id]);

  useEffect(() => {
    dispatch(fetchReportsForUser({ userId: id, params: { page, size: 10, sort: "createdAt,desc" } }));
  }, [dispatch, id, page]);

  const handleDisable = (duration) => {
    dispatch(disableUser({ id, data: { duration } }));
    setDisabling(false);
  };

  const handleDelete = async () => {
    const result = await dispatch(deleteUser(id));
    if (deleteUser.fulfilled.match(result)) {
      navigate("/account/admin/users");
    }
  };

  if (fetchStatus.single === "loading" && !user) {
    return (
      <div className="flex items-center justify-center gap-2 text-[12px] text-neutral-500 font-medium py-16">
        <FiLoader size={14} className="animate-spin" />
        Loading user…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-5">
        <Link to="/account/admin/users" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-neutral-600 hover:text-neutral-900">
          <FiArrowLeft size={14} /> Back to users
        </Link>
        <PlaceholderCard title="User not found" description="This account may have been removed." icon={FiUser} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Link to="/account/admin/users" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-neutral-600 hover:text-neutral-900 transition-colors">
        <FiArrowLeft size={14} /> Back to users
      </Link>

      <SectionCard>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-neutral-900 text-white text-lg font-bold flex items-center justify-center shrink-0">
              {user.firstName?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-[18px] font-semibold text-neutral-900">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-[12px] text-neutral-500">{user.email}</p>
              <p className="text-[12px] text-neutral-500">{user.phone}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 text-neutral-700">
                  {ROLE_LABELS[user.role] || user.role}
                </span>
                <StatusPill label={user.enabled === false ? "Disabled" : "Active"} tone={user.enabled === false ? "red" : "emerald"} />
              </div>
              {user.enabled === false && user.disabledUntil && (
                <p className="text-[11px] text-neutral-400 mt-1">
                  Disabled until {formatDate(user.disabledUntil)}
                </p>
              )}
              {user.enabled === false && !user.disabledUntil && (
                <p className="text-[11px] text-neutral-400 mt-1">Disabled permanently</p>
              )}
              <p className="text-[11px] text-neutral-400 mt-1">Member since {formatDate(user.createdAt)}</p>
            </div>
          </div>

          <div className="flex flex-col items-stretch sm:items-end gap-2">
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-red-600 font-semibold flex items-center gap-1">
                  <FiAlertTriangle size={12} /> Delete this account?
                </span>
                <button onClick={handleDelete} className="px-2.5 py-1 rounded bg-red-600 text-white text-[11px] font-semibold cursor-pointer">
                  Yes
                </button>
                <button onClick={() => setConfirmDelete(false)} className="px-2.5 py-1 rounded border border-neutral-200 text-[11px] font-semibold cursor-pointer">
                  No
                </button>
              </div>
            ) : disabling ? (
              <div className="flex flex-wrap justify-end gap-1.5">
                {Object.values(DISABLE_DURATION).map((d) => (
                  <button
                    key={d}
                    onClick={() => handleDisable(d)}
                    className="px-2.5 py-1 rounded border border-neutral-200 text-[10px] font-semibold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                  >
                    {d}
                  </button>
                ))}
                <button onClick={() => setDisabling(false)} className="px-2.5 py-1 text-[10px] font-semibold text-neutral-400 cursor-pointer">
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {user.enabled === false ? (
                  <button
                    onClick={() => dispatch(enableUser(id))}
                    disabled={mutationStatus.enable === "loading"}
                    className="px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    Enable Account
                  </button>
                ) : (
                  <button
                    onClick={() => setDisabling(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-200 bg-amber-50 text-[11px] font-semibold text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer"
                  >
                    <FiShieldOff size={13} />
                    Disable Account
                  </button>
                )}
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-[11px] font-semibold text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Reports against this user"
        subtitle="Fraud, abuse, and other concerns filed by guests or hosts"
        actionLabel={reportsPagination.totalElements ? `${reportsPagination.totalElements} Total` : null}
      >
        {reportsFetchStatus.forUser === "loading" ? (
          <div className="flex items-center justify-center gap-2 text-[12px] text-neutral-500 font-medium py-10">
            <FiLoader size={14} className="animate-spin" />
            Loading reports…
          </div>
        ) : reports.length === 0 ? (
          <PlaceholderCard title="No reports" description="No one has reported this account." icon={FiShieldOff} />
        ) : (
          <div className="space-y-3">
            {reports.map((r) => (
              <UserReportRow key={r.id} report={r} />
            ))}
            {reportsPagination.totalPages > 1 && (
              <div className="flex justify-center pt-2">
                <PropertyPagination currentPage={reportsPagination.page} totalPages={reportsPagination.totalPages} onPageChange={setPage} />
              </div>
            )}
          </div>
        )}
      </SectionCard>
    </div>
  );
};

export default AdminUserDetailPage;
