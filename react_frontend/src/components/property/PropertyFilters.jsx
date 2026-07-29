import React, { useEffect, useCallback } from "react";
import { FiX, FiSliders  } from "react-icons/fi";

// Inline Filter Fields to eliminate prop-drilling and separate file dependency
const FilterFields = ({ filters, categories, handleChange }) => (
  <div className="space-y-8">
    {/* Location */}
    <section>
      <h4 className="text-[11px] font-bold uppercase 
      tracking-[0.2em] text-zinc-700 
      inline-block">
        Location
      </h4>
      <div className="space-y-1">
        {["city", "state", "country"].map((field) => (
          <input
            key={field}
            name={field}
            value={filters[field] || ""}
            onChange={handleChange}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            className="w-full border-b py-3 text-sm outline-none 
            border-neutral-400 transition-colors 
            placeholder:text-neutral-400 
            text-neutral-800 bg-transparent"
          />
        ))}
      </div>
    </section>

    {/* Category */}
    <section>
      <h4 className="text-[11px] font-bold uppercase 
      tracking-[0.2em] text-zinc-700 
      inline-block">
        Category
      </h4>
      <select
        name="categoryId"
        value={filters.categoryId || ""}
        onChange={handleChange}
        className="w-full border-b 
        py-3 bg-white text-neutral-800 text-sm outline-none 
       border-neutral-400 transition-colors 
        cursor-pointer appearance-none"
      >
        <option 
        value=""> &nbsp;&nbsp;{"▼"}&nbsp;All categories </option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
    </section>

    {/* Price Range */}
    <section>
      <h4 className="text-[11px] font-bold uppercase 
      tracking-[0.2em] text-zinc-700 
      inline-block">
        Price per night
      </h4>
      <div className="flex gap-4">
        <input
          type="number"
          name="minPrice"
          placeholder="Min"
          value={filters.minPrice || ""}
          onChange={handleChange}
          className="w-full border-b py-3 outline-none text-sm border-neutral-400 transition-colors placeholder:text-neutral-400 text-neutral-800 bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <input
          type="number"
          name="maxPrice"
          placeholder="Max"
          value={filters.maxPrice || ""}
          onChange={handleChange}
          className="w-full border-b py-3 outline-none text-sm border-neutral-400 transition-colors placeholder:text-neutral-400 text-neutral-800 bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>
    </section>

    {/* Guests & Beds */}
    <section>
      <div className="grid grid-cols-2 gap-x-6 gap-y-1">
        <div>
          <h4 className="text-[11px] font-bold uppercase 
          tracking-[0.2em] text-zinc-700 
          inline-block">
            Guests
          </h4>
          <input
            type="number"
            name="maxGuests"
            min="1"
            placeholder="Any"
            value={filters.maxGuests || ""}
            onChange={handleChange}
            className="
    w-full
    border-b
       py-3
    text-sm
    outline-none
   border-neutral-400
    transition-colors
    placeholder:text-neutral-400
    text-neutral-800
    bg-transparent
  "
          />
        </div>
        <div>
          <h4 className="text-[11px] font-bold uppercase 
          tracking-[0.2em] text-zinc-700 
          inline-block">
            Bedrooms
          </h4>
          <input
            type="number"
            name="bedrooms"
            min="0"
            placeholder="Any"
            value={filters.bedrooms || ""}
            onChange={handleChange}
            className="
    w-full
    border-b
       py-3
    text-sm
    outline-none
   border-neutral-400
    transition-colors
    placeholder:text-neutral-400
    text-neutral-800
    bg-transparent
  "
          />
        </div>
      </div>
    </section>

    {/* Availability */}
    <section>
      <h4 className="text-[11px] font-bold uppercase 
      tracking-[0.2em] text-zinc-700 
      inline-block">
        Availability
      </h4>
      <div className="space-y-2 flex justify-between">
        <div className="space-x-7">
          <label 
          htmlFor="checkInDate" 
          className="text-[11px] uppercase font-semibold 
          text-neutral-600 tracking-wider">
            Check-In :
          </label>
          <input
          type="date"
          name="checkInDate"
          value={filters.checkInDate || ""}
          onChange={handleChange}
          className="w-4xs border-b py-1 text-sm 
          outline-none border-neutral-500 
          transition-colors bg-transparent 
          text-neutral-800"
        />
        </div>


        <div 
        className="space-x-4"
        >
           <label 
           htmlFor="checkOutDate" 
           className="text-[11px] 
           uppercase font-semibold 
           text-neutral-600 tracking-wider">
        Check-Out :
      </label>
          <input
          type="date"
          name="checkOutDate"
          value={filters.checkOutDate || ""}
          onChange={handleChange}
          className="w-4xs border-b py-1 text-sm 
          outline-none border-neutral-400 
          transition-colors bg-transparent 
          text-neutral-800"
          />
        </div>
        
      </div>
    </section>
  </div>
);

const PropertyFilters = ({
  isOpen,
  onClose,
  filters,
  setFilters,
  categories = [],
  onSearch,
  onClear,
}) => {
  // Lock body scroll when open
  useEffect(() => {
    if (!isOpen) return;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isOpen]);

  // Handle keyboard escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFilters((prev) => ({ ...prev, [name]: value }));
    },
    [setFilters],
  );

  const applyFilters = useCallback(() => {
    const payload = {
      city: filters.city || null,
      state: filters.state || null,
      country: filters.country || null,
      categoryId: filters.categoryId ? Number(filters.categoryId) : null,
      minPrice: filters.minPrice ? Number(filters.minPrice) : null,
      maxPrice: filters.maxPrice ? Number(filters.maxPrice) : null,
      bedrooms: filters.bedrooms ? Number(filters.bedrooms) : null,
      maxGuests: filters.maxGuests ? Number(filters.maxGuests) : null,
      checkInDate: filters.checkInDate || null,
      checkOutDate: filters.checkOutDate || null,
      page: 0,
      size: 12,
      sort: "createdAt,desc",
    };

    if (
      payload.checkInDate &&
      payload.checkOutDate &&
      payload.checkInDate >= payload.checkOutDate
    ) {
      alert("Check-out date must be after check-in date");
      return;
    }

    onSearch(payload);
    onClose?.();
  }, [filters, onSearch, onClose]);

  const handleClear = useCallback(() => {
    onClear?.();
  }, [onClear]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Property filters"
      className={`fixed inset-0 z-[100] flex items-end 
        md:items-center justify-center 
        transition-all duration-300 ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {/* BACKDROP */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-neutral-950/20 
          backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* PANEL */}
      <section
        className={`relative w-full bg-white 
          border border-neutral-100 
          flex shadow-xl
          flex-col overscroll-contain
          /* Mobile: Bottom Sheet */
          max-h-[88vh] rounded-t-xl 
          /* Desktop: Centered Modal */
          md:w-[540px] md:max-h-[80vh] md:rounded-sm
          /* Animation States */
          transition-all duration-300 ease-out
          ${
            isOpen
              ? "translate-y-0 opacity-100 md:scale-100"
              : "translate-y-[100%] opacity-0 md:translate-y-0 md:scale-[0.98]"
          }
        `}
      >
        {/* Mobile Drag Handle */}
        <div className="mx-auto mt-3 h-1 w-10 rounded-full 
        bg-neutral-200 md:hidden shrink-0" />

        {/* Header */}
        <header className="flex items-center justify-between 
        px-6 py-4.5 border-b border-neutral-400 shrink-0
        bg-linear-to-b from-gray-50 to-gray-100
        ">
          <div className="flex items-center gap-2 text-neutral-800">
            <FiSliders size={14} className="text-zinc-700" />
            <h2 className="text-xs font-semibold 
            uppercase tracking-wider text-neutral-800">
              Filters
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-900
            transition-all duration-150 
            active:scale-90 cursor-pointer"
            aria-label="Close filters"
          >
            <FiX size={18} />
          </button>
        </header>

        {/* Scrollable Body */}
        <div className="overflow-y-auto px-6 py-6 
        flex-1 scrollbar-thin scrollbar-thumb-neutral-200 
        scrollbar-track-transparent">
          <FilterFields
            filters={filters}
            categories={categories}
            handleChange={handleChange}
          />
        </div>

        {/* Sticky Footer */}
        <footer className="flex items-center justify-between
        px-6 py-4 border-t border-neutral-400 
        bg-linear-to-t from-gray-50 to-gray-200 
        shrink-0">
          <button
            onClick={handleClear}
            className="px-2 py-2 text-[14px] font-medium 
            text-zinc-700 cursor-pointer
            hover:text-neutral-900  
            transition-colors duration-150 active:scale-[0.98]"
          >
            Clear all
          </button>
          <button
            onClick={applyFilters}
            className="px-6 py-2.5 rounded-sm bg-neutral-900 
            text-white text-xs font-light tracking-wide 
            hover:bg-neutral-800 shadow-xs cursor-pointer
            transition-all duration-150 active:scale-[0.97]"
          >
            Show Results
          </button>
        </footer>
      </section>
    </div>
  );
};

export default PropertyFilters;