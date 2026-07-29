import { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FiUsers, FiSearch, FiX, FiLoader, FiAlertTriangle } from "react-icons/fi";

import SectionCard from "../../components/account/SectionCard";
import PlaceholderCard from "../../components/account/PlaceholderCard";
import StatusPill from "../../components/account/StatusPill";
import PropertyPagination from "../../components/property/PropertyPagination";
import useRefetchOnFocus from "../../dataFile/useRefetchOnFocus";
import {
  fetchAllUsers,
  disableUser,
  enableUser,
  deleteUser,
  selectAllUsers,
  selectUserPagination,
  selectAdminUserFetchStatus,
  selectAdminUserMutationStatus,
  DISABLE_DURATION,
} from "../../redux/admin/adminUserSlice";

const ROLE_LABELS = {
  ROLE_USER: "User",
  ROLE_HOST: "Host",
  ROLE_ADMIN: "Admin",
};

const AdminUsersSection = () => {
  const dispatch = useDispatch();
  const users = useSelector(selectAllUsers);
  const pagination = useSelector(selectUserPagination);
  const fetchStatus = useSelector(selectAdminUserFetchStatus);
  const mutationStatus = useSelector(selectAdminUserMutationStatus);

  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [disablingUserId, setDisablingUserId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const refetch = useCallback(() => {
    dispatch(fetchAllUsers({ page, size: 10, sort: "id,desc" }));
  }, [dispatch, page]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useRefetchOnFocus(refetch);

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    const q = searchTerm.toLowerCase().trim();
    return users.filter(
      (u) =>
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q),
    );
  }, [users, searchTerm]);

  const handleDisable = (id, duration) => {
    dispatch(disableUser({ id, data: { duration } }));
    setDisablingUserId(null);
  };

  const handleDelete = (id) => {
    dispatch(deleteUser(id));
    setConfirmDeleteId(null);
  };

  const isLoading = fetchStatus.all === "loading";

  return (
    <div className="space-y-5">
      <h1 className="text-[20px] font-semibold tracking-tight text-neutral-900">Manage Users</h1>

      <SectionCard
        title="All Users"
        subtitle="Platform accounts, roles, and access control"
        actionLabel={pagination.totalElements ? `${pagination.totalElements} Total` : null}
      >
        <div className="relative max-w-md pb-4 border-b border-black/[0.06] mb-4">
          <FiSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, or phone…"
            className="w-full pl-9 pr-9 py-2 rounded-xl border border-black/[0.08] bg-white text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer">
              <FiX size={14} />
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 text-[12px] text-neutral-500 font-medium py-12">
            <FiLoader size={14} className="animate-spin" />
            Loading users…
          </div>
        ) : filteredUsers.length === 0 ? (
          <PlaceholderCard title="No users found" description="No accounts matched your search." icon={FiUsers} />
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-xl border border-black/[0.08]">
              <table className="w-full text-left text-xs text-neutral-700">
                <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider font-semibold border-b border-black/[0.06]">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.05] bg-white">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-neutral-50/80 transition-colors align-top">
                      <td className="px-4 py-3 font-semibold text-neutral-900">
                        <Link to={`/account/admin/users/${u.id}`} className="hover:underline">
                          {u.firstName} {u.lastName}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{u.email}</td>
                      <td className="px-4 py-3">{u.phone}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 text-neutral-700">
                          {ROLE_LABELS[u.role] || u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill label={u.enabled === false ? "Disabled" : "Active"} tone={u.enabled === false ? "red" : "emerald"} />
                      </td>
                      <td className="px-4 py-3">
                        {confirmDeleteId === u.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-[11px] text-red-600 font-semibold flex items-center gap-1">
                              <FiAlertTriangle size={12} /> Delete?
                            </span>
                            <button onClick={() => handleDelete(u.id)} className="px-2 py-1 rounded bg-red-600 text-white text-[11px] font-semibold cursor-pointer">
                              Yes
                            </button>
                            <button onClick={() => setConfirmDeleteId(null)} className="px-2 py-1 rounded border border-neutral-200 text-[11px] font-semibold cursor-pointer">
                              No
                            </button>
                          </div>
                        ) : disablingUserId === u.id ? (
                          <div className="flex flex-wrap justify-end gap-1">
                            {Object.values(DISABLE_DURATION).map((d) => (
                              <button
                                key={d}
                                onClick={() => handleDisable(u.id, d)}
                                className="px-2 py-1 rounded border border-neutral-200 text-[10px] font-semibold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                              >
                                {d}
                              </button>
                            ))}
                            <button onClick={() => setDisablingUserId(null)} className="px-2 py-1 text-[10px] font-semibold text-neutral-400 cursor-pointer">
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            {u.enabled === false ? (
                              <button
                                onClick={() => dispatch(enableUser(u.id))}
                                disabled={mutationStatus.enable === "loading"}
                                className="px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                              >
                                Enable
                              </button>
                            ) : (
                              <button
                                onClick={() => setDisablingUserId(u.id)}
                                className="px-2.5 py-1 rounded-lg border border-amber-200 bg-amber-50 text-[11px] font-semibold text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer"
                              >
                                Disable
                              </button>
                            )}
                            <button
                              onClick={() => setConfirmDeleteId(u.id)}
                              className="px-2.5 py-1 rounded-lg border border-red-200 bg-red-50 text-[11px] font-semibold text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
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
    </div>
  );
};

export default AdminUsersSection;
