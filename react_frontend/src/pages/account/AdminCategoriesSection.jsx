import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiGrid, FiPlus, FiEdit2, FiTrash2, FiLoader, FiAlertTriangle } from "react-icons/fi";

import SectionCard from "../../components/account/SectionCard";
import PlaceholderCard from "../../components/account/PlaceholderCard";
import StatusPill from "../../components/account/StatusPill";
import {
  fetchCategories,
  createCategoryAsync,
  updateCategoryAsync,
  deleteCategoryAsync,
  deactivateCategoryAsync,
  selectAllCategories,
  selectCategoryStatus,
  selectCategoryError,
} from "../../redux/category/categorySlice";

const AdminCategoriesSection = () => {
  const dispatch = useDispatch();
  const categories = useSelector(selectAllCategories);
  const status = useSelector(selectCategoryStatus);
  const error = useSelector(selectCategoryError);

  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const result = await dispatch(createCategoryAsync({ name: newName.trim(), description: newDescription.trim() }));
    if (createCategoryAsync.fulfilled.match(result)) {
      setNewName("");
      setNewDescription("");
    }
  };

  const startEdit = (category) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditDescription(category.description || "");
  };

  const saveEdit = async (id) => {
    const result = await dispatch(
      updateCategoryAsync({ id, categoryData: { name: editName.trim(), description: editDescription.trim() } }),
    );
    if (updateCategoryAsync.fulfilled.match(result)) setEditingId(null);
  };

  const isLoading = status === "loading" && categories.length === 0;

  return (
    <div className="space-y-5">
      <h1 className="text-[20px] font-semibold tracking-tight text-neutral-900">Categories</h1>

      <SectionCard title="Add Category" subtitle="Create a new property category">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_auto] gap-2.5">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Category name"
            className="px-3.5 py-2.5 rounded-xl border border-black/[0.08] text-xs text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-900"
          />
          <input
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Description"
            className="px-3.5 py-2.5 rounded-xl border border-black/[0.08] text-xs text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-900"
          />
          <button
            onClick={handleCreate}
            disabled={!newName.trim() || status === "loading"}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-sm bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 disabled:opacity-40 transition-colors cursor-pointer"
          >
            <FiPlus size={14} />
            Add
          </button>
        </div>
        {error && <p className="mt-2 text-[11px] text-red-500 font-medium">{error}</p>}
      </SectionCard>

      <SectionCard title="All Categories" subtitle="Manage existing property categories">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 text-[12px] text-neutral-500 font-medium py-12">
            <FiLoader size={14} className="animate-spin" />
            Loading categories…
          </div>
        ) : categories.length === 0 ? (
          <PlaceholderCard title="No categories yet" description="Add your first property category above." icon={FiGrid} />
        ) : (
          <div className="space-y-2.5">
            {categories.map((cat) => (
              <div key={cat.id} className="p-3.5 rounded-xl border border-neutral-200 bg-white">
                {editingId === cat.id ? (
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_auto] gap-2.5">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-neutral-200 text-xs outline-none focus:border-neutral-900"
                    />
                    <input
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-neutral-200 text-xs outline-none focus:border-neutral-900"
                    />
                    <div className="flex gap-1.5">
                      <button onClick={() => saveEdit(cat.id)} className="px-3 py-1.5 rounded-sm bg-neutral-900 text-white text-[11px] font-bold uppercase tracking-wider cursor-pointer">
                        Save
                      </button>
                      <button onClick={() => setEditingId(null)} className="px-3 py-1.5 rounded-sm border border-neutral-200 text-[11px] font-semibold text-neutral-600 cursor-pointer">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-semibold text-neutral-900">{cat.name}</p>
                        <StatusPill label={cat.active ? "Active" : "Inactive"} tone={cat.active ? "emerald" : "neutral"} />
                      </div>
                      {cat.description && <p className="text-[12px] text-neutral-500 mt-0.5 truncate">{cat.description}</p>}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {confirmDeleteId === cat.id ? (
                        <>
                          <span className="text-[11px] text-red-600 font-semibold flex items-center gap-1">
                            <FiAlertTriangle size={12} /> Sure?
                          </span>
                          <button onClick={() => { dispatch(deleteCategoryAsync(cat.id)); setConfirmDeleteId(null); }} className="px-2 py-1 rounded bg-red-600 text-white text-[11px] font-semibold cursor-pointer">
                            Yes
                          </button>
                          <button onClick={() => setConfirmDeleteId(null)} className="px-2 py-1 rounded border border-neutral-200 text-[11px] font-semibold cursor-pointer">
                            No
                          </button>
                        </>
                      ) : (
                        <>
                          {cat.active && (
                            <button
                              onClick={() => dispatch(deactivateCategoryAsync(cat.id))}
                              className="px-2.5 py-1 rounded-lg border border-amber-200 bg-amber-50 text-[11px] font-semibold text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer"
                            >
                              Deactivate
                            </button>
                          )}
                          <button onClick={() => startEdit(cat)} className="p-1.5 rounded-lg border border-black/[0.08] text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer" aria-label="Edit">
                            <FiEdit2 size={12} />
                          </button>
                          <button onClick={() => setConfirmDeleteId(cat.id)} className="p-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer" aria-label="Delete">
                            <FiTrash2 size={12} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
};

export default AdminCategoriesSection;
