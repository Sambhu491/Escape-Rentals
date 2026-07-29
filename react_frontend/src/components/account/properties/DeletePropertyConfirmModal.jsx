import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FiAlertTriangle, FiTrash2, FiLoader, FiX } from 'react-icons/fi';
import { selectMutationError } from '../../../redux/property/propertySlice';

const DeletePropertyConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  property,
  isDeleting,
}) => {
  const mutationError = useSelector(selectMutationError);

  // Keyboard Escape Key Handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isDeleting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  // Lock Body Scroll when Open
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !property) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-property-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      {/* Backdrop overlay trigger */}
      <div
        className="absolute inset-0"
        onClick={() => !isDeleting && onClose()}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-black/[0.05] transition-colors cursor-pointer disabled:opacity-50 active:scale-95"
          aria-label="Close delete confirmation dialog"
        >
          <FiX size={18} />
        </button>

        {/* Warning Icon */}
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto shrink-0 shadow-xs">
          <FiAlertTriangle size={24} />
        </div>

        {/* Content */}
        <div className="text-center space-y-1.5">
          <h3 id="delete-property-modal-title" className="text-base font-bold text-neutral-900">
            Delete Property Listing
          </h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Are you sure you want to soft-delete <span className="font-semibold text-neutral-800">"{property.title}"</span>?
          </p>
          <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200/80 mt-2 font-medium">
            This listing will be marked as Unavailable and removed from public search results.
          </p>
        </div>

        {/* Delete Error Notification */}
        {mutationError?.delete && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            Failed to delete property: {mutationError.delete}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl border border-black/[0.08] bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-all duration-150 disabled:opacity-50 cursor-pointer active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-all duration-150 shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer active:scale-[0.98]"
          >
            {isDeleting ? (
              <>
                <FiLoader size={14} className="animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <FiTrash2 size={14} />
                <span>Delete Listing</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeletePropertyConfirmModal;
