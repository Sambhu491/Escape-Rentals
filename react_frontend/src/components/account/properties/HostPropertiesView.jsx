import { useState, useMemo } from "react";
import SectionCard from "../SectionCard";
import PlaceholderCard from "../PlaceholderCard";
import ImageWithLoader from "../../loading/ImageWithLoader/ImageWithLoader";
import PropertyStatusBadge from "./PropertyStatusBadge";
import noImage from "../../../assets/noImage.jpg";
import { Link } from "react-router-dom";
import {
  FiHome,
  FiMapPin,
  FiStar,
  FiSearch,
  FiGrid,
  FiList,
  FiPlus,
  FiX,
  FiUsers,
  FiEdit2,
  FiCamera,
  FiTrash2,
} from "react-icons/fi";

const STATUS_FILTERS = [
  { key: "ALL", label: "All" },
  { key: "AVAILABLE", label: "Available" },
  { key: "UNAVAILABLE", label: "Unavailable" },
  { key: "UNDER_MAINTENANCE", label: "Maintenance" },
];

const HostPropertiesView = ({
  properties = [],
  onCreateClick,
  onEditClick,
  onManageImages,
  onDeleteClick,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");

const filteredAndSortedProperties = useMemo(() => {
  if (!Array.isArray(properties)) return [];

  return properties
    .filter((property) => {
      // Remove deleted properties
      if (property.deleted === true) {
        return false;
      }

      if (statusFilter !== "ALL" && property.status !== statusFilter) {
        return false;
      }

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();

        const titleMatch = property.title?.toLowerCase().includes(query);
        const cityMatch = property.city?.toLowerCase().includes(query);
        const stateMatch = property.state?.toLowerCase().includes(query);
        const countryMatch = property.country?.toLowerCase().includes(query);
        const categoryMatch = property.categoryName
          ?.toLowerCase()
          .includes(query);

        return (
          titleMatch || cityMatch || stateMatch || countryMatch || categoryMatch
        );
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price_asc":
          return (a.pricePerNight || 0) - (b.pricePerNight || 0);

        case "price_desc":
          return (b.pricePerNight || 0) - (a.pricePerNight || 0);

        case "rating_desc":
          return (b.averageRating || 0) - (a.averageRating || 0);

        case "title_asc":
          return (a.title || "").localeCompare(b.title || "");

        case "newest":
        default:
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
    });
}, [properties, statusFilter, searchTerm, sortBy]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
    setSortBy("newest");
  };

    const optimizeCloudinaryImage = (url, width = 1200, height = 1200) => {
    if (!url?.includes("/upload/")) return url;
    return url.replace(
      "/upload/",
      `/upload/f_auto,q_auto,w_${width},h_${height},c_fill/`,
    );
  };

  const hasActiveFilters = searchTerm.trim() !== "" || statusFilter !== "ALL";

  return (
    <SectionCard
      title="My Properties"
      subtitle="Manage your listed properties, search, and monitor status"
    >
      {/* ── Controls ── */}
      <div className="space-y-5 pb-6 border-b border-neutral-200 mb-6">
        {/* Search + Action */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative w-full sm:max-w-sm">
            <FiSearch
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, location, category…"
              className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 transition-colors duration-150"
              aria-label="Search properties"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 transition-colors duration-150 cursor-pointer"
                aria-label="Clear search query"
              >
                <FiX size={15} />
              </button>
            )}
          </div>

          {/* Primary Action */}
          <button
            onClick={onCreateClick}
            className=" 
            w-auto md:w-50 inline-flex 
            items-center 
            justify-center 
            gap-1 px-2 py-2 
            rounded-sm bg-neutral-900 
            text-white text-sm font-medium 
            hover:bg-neutral-800 transition-colors 
            duration-150 cursor-pointer select-none"
          >
            <FiPlus size={15} />
            <span>Create Property</span>
          </button>
        </div>

        {/* Status Filters + Sort + View Toggle */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Status Tabs */}
          <div
            className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0"
            role="tablist"
            aria-label="Status filters"
          >
            {STATUS_FILTERS.map((tab) => {
              const activeProperties = properties.filter(
  (property) => !property.deleted
);

const count =
  tab.key === "ALL"
    ? activeProperties.length
    : activeProperties.filter((p) => p.status === tab.key).length;

              const isActive = statusFilter === tab.key;

              return (
                <button
                  key={tab.key}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setStatusFilter(tab.key)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-md text-xs font-medium tracking-wide transition-colors duration-150 cursor-pointer ${
                    isActive
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`ml-1.5 text-[11px] ${
                      isActive ? "text-white/70" : "text-neutral-400"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sort + View Mode */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
            <div className="relative flex-1 sm:flex-initial">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto appearance-none pl-3.5 pr-9 py-2 rounded-lg border border-neutral-200 bg-white text-xs font-medium text-neutral-600 focus:outline-none focus:border-neutral-400 cursor-pointer transition-colors duration-150"
                aria-label="Sort properties"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="rating_desc">Highest Rated</option>
                <option value="title_asc">Title: A → Z</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* View Toggle */}
            <div
              className="hidden sm:flex items-center rounded-lg border border-neutral-200 p-0.5"
              role="group"
              aria-label="View mode"
            >
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-colors duration-150 cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-400 hover:text-neutral-600"
                }`}
                aria-label="Grid view mode"
              >
                <FiGrid size={14} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition-colors duration-150 cursor-pointer ${
                  viewMode === "list"
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-400 hover:text-neutral-600"
                }`}
                aria-label="List view mode"
              >
                <FiList size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      {properties.length === 0 ? (
        <PlaceholderCard
          title="No properties listed yet"
          description="You haven't added any rental listings. Click 'Create Property' to start hosting on EscapeRentals."
          icon={FiHome}
        />
      ) : filteredAndSortedProperties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 rounded-lg bg-neutral-50 flex items-center justify-center mb-5 border border-neutral-200">
            <FiSearch size={20} className="text-neutral-400" />
          </div>
          <h3 className="text-sm font-semibold tracking-tight text-neutral-900 mb-1.5">
            No matching properties
          </h3>
          <p className="text-xs text-neutral-500 max-w-xs mb-6 px-4 leading-relaxed">
            No listings matched your search or status filter criteria.
          </p>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 rounded-lg border border-neutral-200 bg-white text-xs font-medium text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 transition-colors duration-150 cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div>
          {viewMode === "grid" ? (
            /* ── Grid View ── */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredAndSortedProperties.map((property) => {
                const image =
                  property.images?.length > 0
                    ?  optimizeCloudinaryImage(property.images[0].imageUrl) 
                    || property.images[0]
                    : noImage;

                return (
                  <article
                    key={property.id}
                    className="flex flex-col rounded-lg border border-neutral-400 bg-white overflow-hidden hover:border-neutral-300 transition-colors duration-200"
                  >
                    {/* Image */}
                    <div className="relative w-full aspect-[16/10] shrink-0 bg-neutral-100 overflow-hidden">
                      
                            <Link
        to={`/properties/${property.id}`}
        state={{
          from: location.pathname + location.search,
        }}>
                      <ImageWithLoader
                        src={image}
                        alt={property.title}
                        variant="shimmer"
                        className="w-full h-full object-cover"
                      />
                      </Link>
                      <div className="absolute top-3 left-3 z-10">
                        <PropertyStatusBadge
                          status={property.status}
                          deleted={property.deleted}
                        />
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-4 flex flex-col 
                    flex-1 gap-4">
                      <div className="space-y-2.5">
                        {/* Title + Rating */}
                        <div className="flex items-start 
                        justify-between gap-3">
      <Link
        to={`/properties/${property.id}`}
        state={{
          from: location.pathname + location.search,
        }}>
                          <h3 className="font-semibold 
                          text-neutral-900 text-sm 
                          leading-snug tracking-tight 
                          line-clamp-1">
                            {property.title}
                          </h3>
                          </Link>
                          {property.averageRating > 0 && (
                            <span className="flex items-center gap-1 text-xs font-medium text-neutral-700 shrink-0">
                              <FiStar
                                className="fill-amber-400 text-amber-400"
                                size={12}
                              />
                              {property.averageRating.toFixed(1)}
                            </span>
                          )}
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-1.5 text-xs 
                        text-neutral-600">
                          <FiMapPin size={13} className="shrink-0 
                          text-neutral-500" />
                          <span className="truncate">
                            {[property.city, property.country]
                              .filter(Boolean)
                              .join(", ")}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="flex items-center gap-2 text-xs 
                        text-zinc-600">
                          <span className="flex items-center gap-1 text-neutral-500">
                            <FiUsers size={13} className="text-neutral-500" />
                            {property.maxGuests || 1}
                          </span>
                          <span className="text-neutral-300">·</span>
                          <span>{property.bedrooms || 0} Beds</span>
                          <span className="text-neutral-300">·</span>
                          <span>{property.bathrooms || 0} Baths</span>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="pt-2 border-t border-stone-400 
                      mt-auto space-y-1">
                        <div className="flex items-baseline gap-1">
                          <span className="text-base font-semibold 
                          tracking-tight text-neutral-900">
                            ₹{property.pricePerNight}
                          </span>
                          <span className="text-xs text-stone-600">/ night</span>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => onManageImages && onManageImages(property)}
                            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1 rounded-sm border border-slate-400 bg-gray-100 text-xs font-medium text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 transition-colors duration-150 cursor-pointer min-h-[30px]"
                            title="Manage photos"
                            aria-label={`Manage photos for ${property.title}`}
                          >
                            <FiCamera size={14} />
                            <span>Photos</span>
                          </button>

                          <button
                            onClick={() => onEditClick && onEditClick(property)}
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-1 rounded-sm border border-slate-400 bg-gray-100 text-xs font-medium text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 transition-colors duration-150 cursor-pointer min-h-[30px]"
                            aria-label={`Edit ${property.title}`}
                          >
                            <FiEdit2 size={13} />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => onDeleteClick && onDeleteClick(property)}
                            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1 rounded-sm border border-slate-400 bg-gray-100 text-xs font-medium text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors duration-150 cursor-pointer min-h-[30px]"
                            title="Delete listing"
                            aria-label={`Delete ${property.title}`}
                          >
                            <FiTrash2 size={13} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            /* ── List View ── */
            <div className="space-y-4">
              {filteredAndSortedProperties.map((property) => {
                const image =
                  property.images?.length > 0
                    ? property.images[0].imageUrl || property.images[0]
                    : noImage;

                return (
                  <article
                    key={property.id}
                    className="flex flex-col sm:flex-row items-stretch rounded-lg border border-neutral-400 bg-white overflow-hidden hover:border-neutral-300 transition-colors duration-200"
                  >
                    {/* Image */}
                    <div className="w-full sm:w-48 md:w-56 
                    aspect-[16/10] sm:aspect-auto shrink-0 
                    relative bg-neutral-100 
                    overflow-hidden">
                    <Link
        to={`/properties/${property.id}`}
        state={{
          from: location.pathname + location.search,
        }}>
                      <ImageWithLoader
                        src={image}
                        alt={property.title}
                        variant="shimmer"
                        className="w-full h-full object-cover"
                      />
                      </Link>

                      <div className="absolute top-3 left-3 sm:hidden z-10">
                        <PropertyStatusBadge
                          status={property.status}
                          deleted={property.deleted}
                        />
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
                      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center gap-2.5 flex-wrap">
                               <Link
        to={`/properties/${property.id}`}
        state={{
          from: location.pathname + location.search,
        }}>
                            <h3 className="font-semibold 
                            text-neutral-900 
                            text-sm leading-snug 
                            tracking-tight break-words">
                              {property.title}
                            </h3>
                            </Link>

                            <div className="hidden sm:block">
                              <PropertyStatusBadge
                                status={property.status}
                                deleted={property.deleted}
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-neutral-500 flex-wrap">
                            <span className="flex items-center gap-1">
                              <FiMapPin size={13} className="text-neutral-700" />
                              {[property.city, property.country]
                                .filter(Boolean)
                                .join(", ")}
                            </span>
                            <span className="text-neutral-400">·</span>
                            <span className="text-neutral-700 text-[11px] font-medium uppercase tracking-wider">
                              {property.categoryName || "Rental"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-neutral-700 sm:pt-0.5">
                          <span className="flex items-center gap-1 text-neutral-500">
                            <FiUsers size={13} className="text-neutral-700" />
                            {property.maxGuests || 1}
                          </span>
                          <span className="text-neutral-300">·</span>
                          <span>{property.bedrooms || 0} Beds</span>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex flex-col gap-3.5 pt-4 border-t 
                      border-stone-400 sm:flex-row sm:items-center sm:justify-between sm:pt-3 mt-auto">
                        <div className="flex items-baseline gap-1">
                          <span className="text-base font-semibold tracking-tight text-neutral-900">
                            ₹{property.pricePerNight}
                          </span>
                          <span className="text-xs text-neutral-700">/ night</span>
                        </div>

                        <div className="grid grid-cols-3 sm:flex sm:items-center gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => onManageImages && onManageImages(property)}
                            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1 rounded-sm border border-slate-400 bg-gray-100 text-xs font-medium text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 transition-colors duration-150 cursor-pointer min-h-[30px]"
                          >
                            <FiCamera size={14} />
                            <span>Photos</span>
                          </button>

                          <button
                            onClick={() => onEditClick && onEditClick(property)}
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-1 rounded-sm border border-slate-400 bg-gray-100 text-xs font-medium text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 transition-colors duration-150 cursor-pointer min-h-[30px]"
                          >
                            <FiEdit2 size={13} />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => onDeleteClick && onDeleteClick(property)}
                            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1 rounded-sm border border-slate-400 bg-gray-100 text-xs font-medium text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors duration-150 cursor-pointer min-h-[30px]"
                          >
                            <FiTrash2 size={13} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
};

export default HostPropertiesView;