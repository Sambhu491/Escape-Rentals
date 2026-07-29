import React from "react";
import { FiX } from "react-icons/fi";

const formatDate = (date) => {
  if (!date) return "";
  try {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  } catch (e) {
    return date;
  }
};

const FilterChips = ({ filters, setFilters, onSearch, categories = [] }) => {
  const chips = [];

  if (filters.city) {
    chips.push({ key: "city", label: `In ${filters.city}` });
  }
  if (filters.categoryId) {
    const category = categories.find(
      (c) => c.id === Number(filters.categoryId)
    );
    chips.push({ key: "categoryId", label: category?.name ?? "Category" });
  }
  if (filters.minPrice) {
    chips.push({ key: "minPrice", label: `Min: ₹${filters.minPrice}` });
  }
  if (filters.maxPrice) {
    chips.push({ key: "maxPrice", label: `Max: ₹${filters.maxPrice}` });
  }
  if (filters.maxGuests) {
    chips.push({ key: "maxGuests", label: `${filters.maxGuests} guests` });
  }
  if (filters.bedrooms) {
    chips.push({ key: "bedrooms", label: `${filters.bedrooms}+ bedrooms` });
  }
  if (filters.checkInDate && filters.checkOutDate) {
    chips.push({
      key: "dates",
      label: `${formatDate(filters.checkInDate)} - ${formatDate(filters.checkOutDate)}`,
    });
  }

  if (chips.length === 0) return null;

  const removeChip = (key) => {
    const updated = { ...filters };
    if (key === "dates") {
      updated.checkInDate = "";
      updated.checkOutDate = "";
    } else {
      updated[key] = "";
    }
    setFilters(updated);
    onSearch({
      ...updated,
      minPrice: updated.minPrice ? Number(updated.minPrice) : null,
      maxPrice: updated.maxPrice ? Number(updated.maxPrice) : null,
      maxGuests: updated.maxGuests ? Number(updated.maxGuests) : null,
      bedrooms: updated.bedrooms ? Number(updated.bedrooms) : null,
    });
  };

  return (
    <div className="w-full overflow-x-auto scrollbar-none py-2">
      <div className="flex gap-2 min-w-max">
        {chips.map((chip) => (
          <button
            key={chip.key}
           
            className="group flex items-center gap-1.5 
            rounded-full border border-neutral-200 
            bg-white px-3 py-1.5 text-xs 
            font-semibold text-neutral-700 shadow-sm"
          >
            <span>{chip.label}</span>
            <FiX
              size={13}
              className="text-neutral-800 cursor-pointer"
              onClick={() => removeChip(chip.key)}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterChips;
