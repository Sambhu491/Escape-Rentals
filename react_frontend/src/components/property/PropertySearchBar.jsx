import React, { useEffect, useState } from "react";
import { FiSearch, FiMapPin, FiCalendar, FiUsers } from "react-icons/fi";
const PropertySearchBar = ({ onSearch, initialFilters = {} }) => {
  const today = new Date().toISOString().split("T")[0];
  const [filters, setFilters] = useState({
    city: "",
    checkInDate: "",
    checkOutDate: "",
    maxGuests: "",
  });
  const [dateError, setDateError] = useState("");
useEffect(() => {
  setFilters({
    city: initialFilters.city || "",
    checkInDate: initialFilters.checkInDate || "",
    checkOutDate: initialFilters.checkOutDate || "",
    maxGuests: initialFilters.maxGuests || "",
  });

  setDateError("");
}, [initialFilters]);
const updateField = (key, value) => {
  setFilters((prev) => ({
    ...prev,
    [key]: value,
  }));

  setDateError("");
};
  const handleSubmit = (e) => {
  e.preventDefault();

  if (
    filters.checkInDate &&
    filters.checkOutDate &&
    filters.checkOutDate < filters.checkInDate
  ) {
    setDateError("Check-out date cannot be earlier than check-in date.");
    return;
  }

  setDateError("");

  onSearch({
    city: filters.city || null,
    checkInDate: filters.checkInDate || null,
    checkOutDate: filters.checkOutDate || null,
    maxGuests: filters.maxGuests
      ? Number(filters.maxGuests)
      : null,
  });
};
  return (
   <div className="w-full max-w-4xl mx-auto">
     <form
      onSubmit={handleSubmit}
      className="w-full bg-white border 
      border-neutral-200 rounded-2xl md:rounded-full 
      shadow-md flex flex-col md:flex-row 
      md:items-center gap-1"
    >
      
      {/* LOCATION */}
      <SearchField icon={<FiMapPin />} label="Where">
        
        <input
          type="text"
          placeholder="Search destinations"
          value={filters.city}
          onChange={(e) => updateField("city", e.target.value)}
          className="w-full bg-transparent outline-none text-sm 
          text-neutral-900 placeholder:text-neutral-400 
          font-medium"
        />
      </SearchField>
      {/* CHECK IN */}
      <SearchField icon={<FiCalendar />} label="Check in">
        
        <input
          type="date"
          min={today}
          value={filters.checkInDate}
          onChange={(e) => updateField("checkInDate", e.target.value)}
          className="w-full bg-transparent outline-none text-sm 
          text-neutral-900 font-medium cursor-pointer"
        />
      </SearchField>
      {/* CHECK OUT */}
      <SearchField icon={<FiCalendar />} label="Check out">
        
        <input
          type="date"
          min={filters.checkInDate || today}
          value={filters.checkOutDate}
          onChange={(e) => updateField("checkOutDate", e.target.value)}
          className="w-full bg-transparent outline-none text-sm 
          text-neutral-900 font-medium cursor-pointer"
        />
      </SearchField>
      {/* GUESTS */}
      <div className="flex-1 flex items-center justify-between 
      gap-3 px-4 py-2 rounded-2xl md:rounded-full 
      hover:bg-neutral-50 transition duration-150">
        
        <div className="flex-1 flex flex-col gap-0.5 min-w-0">
          
          <label className="flex items-center gap-1.5 
          text-[10px] font-bold uppercase tracking-wider 
          text-neutral-600 select-none">
            
            <FiUsers /> Guests
          </label>
          <input
            type="number"
            min="1"
            placeholder="Add guests"
            value={filters.maxGuests}
onChange={(e) => {
  const value = e.target.value;

  updateField(
    "maxGuests",
    value === "" ? "" : Math.max(1, Number(value))
  );
}}
            className="w-full bg-transparent outline-none text-sm 
            text-neutral-900 placeholder:text-neutral-400 
            font-medium"
          />
        </div>
        <button
          type="submit"
          className="shrink-0 h-10 w-10 rounded-full bg-neutral-900 
          text-white flex items-center justify-center 
          shadow-md hover:bg-neutral-800 transition 
          duration-150 active:scale-95"
          aria-label="Search"
        >
          
          <FiSearch size={18} />
        </button>
      </div>
    </form>
       {dateError && (
     <p className="mt-2 px-2 text-xs font-medium text-red-500">
        {dateError}
      </p>
    )}
   </div>
    
  );
};
const SearchField = ({ icon, label, children }) => {
  return (
    <div className="flex-1 w-full px-4 py-2 rounded-2xl 
    md:rounded-full hover:bg-neutral-50 transition 
    duration-150 flex flex-col gap-0.5">
      
      <label className="flex items-center gap-1.5 text-[10px] 
      font-bold uppercase tracking-wider text-neutral-600 
      select-none">
        
        {icon} {label}
      </label>
      {children}
    </div>
  );
};
export default PropertySearchBar;
