import React from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const PropertyPagination = ({ currentPage, totalPages, onPageChange }) => {
  // Hide component entirely if there is only 1 page or none
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  let start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages - 1, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(0, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  const buttonBase =
    "flex items-center h-1 w-4 justify-center cursor-pointer select-none";

  return (
    <div className="flex justify-center items-center gap-3">
      {/* Previous Page Button */}
      <button
        disabled={currentPage === 0}
        onClick={() => onPageChange(currentPage - 1)}
        className={`${buttonBase} text-zinc-900 
        disabled:opacity-30 
        disabled:pointer-events-none`}
        aria-label="Previous page"
      >
        <FiChevronLeft size={18} />
      </button>

      {/* First Page Shortcut */}
      {start > 0 && (
        <>
          <button
            onClick={() => onPageChange(0)}
            className={`${buttonBase} 
            text-neutral-700 hidden 
            sm:flex`}
          >
            1
          </button>
          {start > 1 && (
            <span
              className="px-2 text-neutral-400 
            select-none"
            >
              ...
            </span>
          )}
        </>
      )}

      {/* Visible Page Numbers */}
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`${buttonBase} ${
            currentPage === page
              ? "underline underline-offset-2 decoration-black decoration-2 font-bold"
              : "text-neutral-900"
          }`}
        >
          {page + 1}
        </button>
      ))}

      {/* Last Page Shortcut */}
      {end < totalPages - 1 && (
        <>
          {end < totalPages - 2 && (
            <span
              className="px-2 text-neutral-400 
            select-none"
            >
              ...
            </span>
          )}
          <button
            onClick={() => onPageChange(totalPages - 1)}
            className={`${buttonBase} text-zinc-900 hidden sm:flex`}
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next Page Button */}
      <button
        disabled={currentPage >= totalPages - 1}
        onClick={() => onPageChange(currentPage + 1)}
        className={`${buttonBase} text-zinc-800 disabled:opacity-30 disabled:pointer-events-none`}
        aria-label="Next page"
      >
        <FiChevronRight size={18} />
      </button>
    </div>
  );
};

export default PropertyPagination;
