import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiHeart, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import SectionCard from "../../components/account/SectionCard";
import PropertyGrid from "../../components/property/PropertyGrid";
import {
  fetchSavedProperties,
  selectSavedProperties,
  selectSavedPagination,
  selectSavedFetchStatus,
} from "../../redux/saved/savedSlice";

const SavedSection = () => {
  const dispatch = useDispatch();
  const properties = useSelector(selectSavedProperties);
  const pagination = useSelector(selectSavedPagination);
  const fetchStatus = useSelector(selectSavedFetchStatus);

  useEffect(() => {
    dispatch(fetchSavedProperties({ page: 0, size: 12, sort: "createdAt,desc" }));
  }, [dispatch]);

  const goToPage = (page) => {
    dispatch(fetchSavedProperties({ page, size: pagination.size, sort: "createdAt,desc" }));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Saved & Wishlist</h1>

      <SectionCard
        title="Your saved stays"
        subtitle={
          pagination.totalElements > 0
            ? `${pagination.totalElements} propert${pagination.totalElements === 1 ? "y" : "ies"} bookmarked`
            : undefined
        }
      >
        {fetchStatus !== "loading" && properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 mb-4">
              <FiHeart size={24} />
            </div>
            <h3 className="text-base font-semibold text-neutral-900">Nothing saved yet</h3>
            <p className="mt-1.5 text-sm text-neutral-500 max-w-sm">
              Tap the heart icon on any property to bookmark it for later. Your saved stays will show up here.
            </p>
          </div>
        ) : (
          <>
            <PropertyGrid properties={properties} status={fetchStatus} />

            {pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  onClick={() => goToPage(pagination.page - 1)}
                  disabled={pagination.page === 0}
                  className="h-8 w-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition"
                >
                  <FiChevronLeft size={15} />
                </button>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                  Page {pagination.page + 1} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => goToPage(pagination.page + 1)}
                  disabled={pagination.page + 1 >= pagination.totalPages}
                  className="h-8 w-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition"
                >
                  <FiChevronRight size={15} />
                </button>
              </div>
            )}
          </>
        )}
      </SectionCard>
    </div>
  );
};

export default SavedSection;
