import React, { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { FiSliders, FiChevronDown } from "react-icons/fi";
import BackButton from "../components/property/BackButton";
import PropertySearchBar from "../components/property/PropertySearchBar";
import PropertyFilters from "../components/property/PropertyFilters";
import FilterChips from "../components/property/FilterChips";
import PropertyGrid from "../components/property/PropertyGrid";
import PropertyPagination from "../components/property/PropertyPagination";

import {
  fetchProperties,
  searchPropertiesAsync,
  selectAllProperties,
  selectPropertyFetchStatus,
  selectPropertyError,
  selectPagination,
} from "../redux/property/propertySlice";

import {
  fetchCategories,
  selectAllCategories,
  selectCategoryStatus,
} from "../redux/category/categorySlice";

// ─── Constants ───────────────────────────────────────────────
const PAGE_SIZE = 12;

const FILTER_KEYS = [
  "city",
  "state",
  "country",
  "categoryId",
  "minPrice",
  "maxPrice",
  "maxGuests",
  "bedrooms",
  "checkInDate",
  "checkOutDate",
];

const EMPTY_FILTERS = Object.fromEntries(FILTER_KEYS.map((k) => [k, ""]));

// ─── Pure Helpers (outside component — no re-creation on render) ─────

/**
 * Reads filter values from a URLSearchParams instance.
 * Returns an object with empty strings for missing keys.
 */
const readFiltersFromParams = (params) => {
  const filters = {};
  FILTER_KEYS.forEach((key) => {
    filters[key] = params.get(key) || "";
  });
  return filters;
};

/**
 * Builds a clean API params object from the filter state.
 * Strips empty strings and coerces numeric fields to Numbers.
 */
const buildSearchParams = (filterState) => {
  const params = {};
  Object.entries(filterState).forEach(([key, value]) => {
    if (value !== "" && value != null) {
      params[key] = value;
    }
  });
  // Coerce numeric fields for the API
  if (params.minPrice) params.minPrice = Number(params.minPrice);
  if (params.maxPrice) params.maxPrice = Number(params.maxPrice);
  if (params.maxGuests) params.maxGuests = Number(params.maxGuests);
  if (params.bedrooms) params.bedrooms = Number(params.bedrooms);
  return params;
};

/**
 * Normalizes incoming values so filter state always uses
 * empty strings for "not set" — never null, undefined, or raw Numbers.
 */
const normalizeToStrings = (obj) => {
  const result = {};
  Object.keys(obj).forEach((key) => {
    const val = obj[key];
    result[key] = val != null ? String(val) : "";
  });
  return result;
};

// ─── Component ───────────────────────────────────────────────
const PropertyPage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Redux Selectors ──
  const properties = useSelector(selectAllProperties);
  const fetchStatus = useSelector(selectPropertyFetchStatus);
  const error = useSelector(selectPropertyError);
  const categories = useSelector(selectAllCategories);
  const categoryStatus = useSelector(selectCategoryStatus);
  const pagination = useSelector(selectPagination);

  // ── Local UI State ──
  // Filters are initialized from URL query params so that navigating back
  // restores the exact search state the user had before leaving.
  const [filters, setFilters] = useState(() =>
    readFiltersFromParams(searchParams),
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  // Tracks which Redux thunk was dispatched last ("fetch" or "search")
  // so the derived status reads from the correct slice field.
  const lastActionRef = useRef("fetch");

  // ── Derived Status ──
  const status =
    lastActionRef.current === "search" ? fetchStatus.search : fetchStatus.all;

  // ── URL Sync ──

  /**
   * Writes the current filter state and page number into the URL
   * as query params (e.g. /properties?city=Paris&page=2).
   *
   * Uses `replace: true` so browsing within the page doesn't flood
   * the browser history stack. The single history entry is enough
   * for the back button to restore the correct state.
   */
  const syncUrlParams = useCallback(
    (filterState, page) => {
      const params = new URLSearchParams();
      Object.entries(filterState).forEach(([key, value]) => {
        if (value !== "" && value != null) {
          params.set(key, String(value));
        }
      });
      // Only include page in URL if it's not the first page
      if (page > 0) {
        params.set("page", String(page));
      }
      setSearchParams(params, { replace: true });
    },
    [setSearchParams],
  );

  // ── Dispatch Helper ──

  /**
   * Central dispatch function. Decides whether to call searchPropertiesAsync
   * (when filters are active) or fetchProperties (when no filters are set).
   * Also syncs the URL and updates the lastActionRef.
   */
  const dispatchWithFilters = useCallback(
    (filterState, page = 0, shouldSyncUrl = true) => {
      const params = buildSearchParams(filterState);
      const hasActiveFilters = Object.keys(params).length > 0;

      if (hasActiveFilters) {
        lastActionRef.current = "search";
        dispatch(searchPropertiesAsync({ ...params, page, size: PAGE_SIZE }));
      } else {
        lastActionRef.current = "fetch";
        dispatch(fetchProperties({ page, size: PAGE_SIZE }));
      }

      if (shouldSyncUrl) {
        syncUrlParams(filterState, page);
      }
    },
    [dispatch, syncUrlParams],
  );

  // ── Effects ──

  // Fetch categories on mount (if not already loaded)
  useEffect(() => {
    if (categoryStatus === "idle") {
      dispatch(fetchCategories());
    }
  }, [dispatch, categoryStatus]);

  // Initial property fetch — reads page from URL, filters already
  // initialized from URL via the useState initializer above.
  useEffect(() => {
    const initialPage = Number(searchParams.get("page") || 0);

    // shouldSyncUrl = false — the URL already has these params,
    // no need to replace it on the initial load.
    dispatchWithFilters(filters, initialPage, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // ↑ Intentionally mount-only. `filters` is the initial state from URL.
  //   `dispatchWithFilters` is stable via useCallback.

  // ── Event Handlers ──

  /**
   * Called by PropertySearchBar, FilterChips, and PropertyFilters.
   * Normalizes incoming params, merges into filter state, and dispatches
   * from page 0 (new search = new result set, always start at page 1).
   */
  const handleSearch = (incomingParams = {}) => {
    const normalized = normalizeToStrings(incomingParams);
    const updatedFilters = { ...filters, ...normalized };
    setFilters(updatedFilters);

    window.scrollTo({ top: 0, behavior: "auto" });
    dispatchWithFilters(updatedFilters, 0);
  };

  /**
   * Resets all filters and fetches the default property list from page 1.
   */
  const handleClearFilters = () => {
    setFilters({ ...EMPTY_FILTERS });

    window.scrollTo({ top: 0, behavior: "auto" });
    lastActionRef.current = "fetch";
    dispatch(fetchProperties({ page: 0, size: PAGE_SIZE }));
    syncUrlParams(EMPTY_FILTERS, 0);
  };

  /**
   * Pagination handler. Scrolls to top, then dispatches with
   * the current filter state at the requested page.
   */
  const handlePageChange = (page) => {
    window.scrollTo({ top: 0, behavior: "auto" });
    dispatchWithFilters(filters, page);
  };

  // ── Render ──

  // Should pagination controls be interactive?
  const isPaginationDisabled =
    status === "loading" || !properties || properties.length === 0;

  return (
    <div className="min-h-screen bg-neutral-50/30 text-neutral-800 pb-16">
      {/* ── Sticky Search Header ──────────────────────────── */}
      {/* Full-width wrapper ensures bg + border span the viewport on wide screens */}
      <div className="bg-white sticky top-0 z-30 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto py-4 px-4">
          <div className="flex flex-col gap-3">
            {/* Mobile top row */}
            <div className="flex items-center justify-between md:hidden">
              <BackButton />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowMobileSearch((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-1 text-xs font-semibold text-neutral-700 bg-white hover:shadow-md transition active:scale-[0.98]"
                >
                  Search
                  <FiChevronDown
                    size={16}
                    className={`transition-transform duration-300 ${
                      showMobileSearch ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <button
                  onClick={() => setIsFilterOpen(true)}
                  className="flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-1 text-xs font-semibold text-neutral-700 bg-white hover:shadow-md transition active:scale-[0.98]"
                >
                  <FiSliders size={14} />
                  Filters
                </button>
              </div>
            </div>

            {/* Desktop row */}
            <div className="hidden md:flex items-center gap-2">
              <BackButton />
              <div className="flex-1 min-w-0">
                <PropertySearchBar
                  onSearch={handleSearch}
                  initialFilters={filters}
                />
              </div>
              <button
                onClick={() => setIsFilterOpen(true)}
                className="shrink-0 flex items-center justify-center gap-2 rounded-full border border-neutral-300 px-4 py-1 text-sm font-semibold text-neutral-700 bg-white hover:shadow-sm transition cursor-pointer active:scale-[0.98]"
              >
                <FiSliders size={15} />
                Filters
              </button>
            </div>

            {/* Mobile expandable search */}
            <div
              className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
                showMobileSearch
                  ? "max-h-96 opacity-100 mt-3"
                  : "max-h-0 opacity-0"
              }`}
            >
              <PropertySearchBar
                onSearch={handleSearch}
                initialFilters={filters}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Active filter chips */}
        <div className="mb-6">
          <FilterChips
            filters={filters}
            setFilters={setFilters}
            onSearch={handleSearch}
            categories={categories}
          />
        </div>

        {/* Top pagination — right-aligned */}
        <div
          className={`flex justify-end mb-6 transition-opacity duration-200 ${
            isPaginationDisabled
              ? "opacity-50 pointer-events-none"
              : "opacity-100"
          }`}
        >
          <PropertyPagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>

        {/* Property grid with stable min-height to prevent layout shifts */}
        <div className="min-h-[700px] transition-all duration-300 ease-in-out">
          <PropertyGrid
            properties={properties}
            status={status}
            error={error}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Bottom pagination — centered */}
        <div
          className={`h-24 flex items-center justify-center mt-6 transition-opacity duration-200 ${
            isPaginationDisabled
              ? "opacity-50 pointer-events-none"
              : "opacity-100"
          }`}
        >
          <PropertyPagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </main>

      {/* ── Filter Modal/Drawer ──────────────────────────── */}
      <PropertyFilters
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
        categories={categories}
        onSearch={handleSearch}
        onClear={handleClearFilters}
      />
    </div>
  );
};

export default PropertyPage;
