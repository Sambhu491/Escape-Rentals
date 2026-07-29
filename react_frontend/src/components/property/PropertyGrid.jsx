import React from "react";
import { FiHome } from "react-icons/fi";
import PropertyCard from "./PropertyCard";

const PropertyGrid = ({ properties = [], status, error, onClearFilters }) => {
  const gridClasses = `
    grid 
    grid-cols-1 
    sm:grid-cols-2 
    md:grid-cols-3 
    lg:grid-cols-4 
    gap-x-5 
    gap-y-8
    min-h-[720px]
  `;

  /* ── LOADING STATE SKELETONS ── */
  if (status === "loading") {
    return (
      <div className={gridClasses}>
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse flex flex-col gap-3 min-h-[360px]"
          >
            <div className="aspect-[4/3] rounded-2xl bg-neutral-200 w-full" />
            <div className="space-y-2 mt-1 flex-1">
              <div className="h-4 w-3/4 rounded bg-neutral-200" />
              <div className="h-3 w-1/2 rounded bg-neutral-200" />
              <div className="h-4 w-1/3 rounded bg-neutral-200 mt-2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  /* ── ERROR STATE ── */
  if (status === "failed") {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center px-6 bg-neutral-50/50 rounded-2xl border border-neutral-100 p-8 my-4">
        <h2 className="text-lg font-semibold text-neutral-900">
          Something went wrong
        </h2>
        <p className="mt-2 max-w-md text-sm text-neutral-500">
          {error || "Unable to load properties. Please try again later."}
        </p>
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="mt-6 rounded-full bg-neutral-900 hover:bg-black text-white px-6 py-2.5 text-sm font-semibold transition duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
          >
            Reset search
          </button>
        )}
      </div>
    );
  }

  /* ── EMPTY STATE ── */
  if (!properties || properties.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 mb-5 shadow-inner">
          <FiHome size={28} />
        </div>
        <h2 className="text-xl font-semibold text-neutral-900">
          No stays found
        </h2>
        <p className="mt-2 text-sm text-neutral-500 max-w-sm">
          We couldn't find any rentals matching your selection. Try modifying
          your search dates or removing some filters.
        </p>
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="mt-6 rounded-full border border-neutral-300 bg-indigo-50 px-6 py-2.5 text-sm font-semibold text-neutral-600 hover:text-neutral-700 cursor-pointer transition-colors duration-200 active:scale-[0.98]"
          >
            Clear all filters
          </button>
        )}
      </div>
    );
  }

  /* ── PROPERTY LIST GRID ── */
  return (
    <div className={gridClasses}>
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
};

export default PropertyGrid;
