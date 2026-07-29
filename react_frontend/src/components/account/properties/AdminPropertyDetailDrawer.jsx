import React from 'react';
import {
  FiX,
  FiUser,
  FiMapPin,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiHome,
  FiEdit2,
  FiCamera,
  FiTrash2,
  FiInfo,
} from 'react-icons/fi';
import ImageWithLoader from '../../loading/ImageWithLoader/ImageWithLoader';
import noImage from '../../../assets/noImage.jpg';

const statusBadgeClasses = {
  AVAILABLE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  UNAVAILABLE: 'bg-red-50 text-red-700 border-red-200',
  UNDER_MAINTENANCE: 'bg-amber-50 text-amber-700 border-amber-200',
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (e) {
    return dateStr;
  }
};

const AdminPropertyDetailDrawer = ({
  isOpen,
  onClose,
  property,
  onEditClick,
  onManageImages,
  onDeleteClick,
}) => {
  if (!isOpen || !property) return null;

  const optimizeCloudinaryImage = (url, width = 1200, height = 1200) => {
    if (!url?.includes("/upload/")) return url;
    return url.replace(
      "/upload/",
      `/upload/f_auto,q_auto,w_${width},h_${height},c_fill/`,
    );
  };

  const images = Array.isArray(property.images) ? optimizeCloudinaryImage(property.images) : [];
  const firstImage = images.length > 0
    ? (typeof images[0] === 'string' ? images[0] : (images[0].imageUrl || images[0]))
    : noImage;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/40 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Centered Modal Framework Container */}
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[85vh] border border-neutral-200/60 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200/60 bg-neutral-50/50">
          <div className="space-y-0.5">
            <h2 className="text-base font-semibold text-neutral-900 line-clamp-1">
              Property Details #{property.id}
            </h2>
            <p className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
              Administrative Asset Overview
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Scrollable Document Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin scrollbar-thumb-neutral-200">
          
          {/* Main Hero Header Image */}
          <div className="relative aspect-[21/9] rounded-xl overflow-hidden border border-neutral-200/80 bg-neutral-50">
            <ImageWithLoader
              src={firstImage}
              alt={property.title}
              variant="shimmer"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-semibold border bg-white uppercase tracking-wider ${statusBadgeClasses[property.status] || 'bg-neutral-100 text-neutral-600 border-neutral-200'}`}>
                {(property.status || 'UNKNOWN').replaceAll('_', ' ')}
              </span>
              {property.deleted && (
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-red-600 text-white uppercase tracking-wider shadow-xs">
                  Deleted
                </span>
              )}
            </div>
          </div>

          {/* Identity & Valuation Title Row */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 border-b border-neutral-100 pb-4">
            <div className="space-y-1">
              <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2.5 py-0.5 rounded-md inline-block">
                {property.categoryName || 'Rental'}
              </span>
              <h3 className="text-lg font-bold text-neutral-900 tracking-tight leading-snug">
                {property.title}
              </h3>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <div className="text-xl font-black text-neutral-950">
                ₹{Number(property.pricePerNight || 0).toLocaleString('en-IN')}
              </div>
              <span className="text-xs font-medium text-neutral-400">per night</span>
            </div>
          </div>

          {/* Info Matrix Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl border border-neutral-200/60 bg-neutral-50/50 text-xs">
            <div>
              <span className="text-neutral-400 block text-[9px] uppercase font-bold tracking-wider">Host Assignment</span>
              <span className="font-semibold text-neutral-900 flex items-center gap-1 mt-0.5 truncate">
                <FiUser size={13} className="text-neutral-400 shrink-0" />
                {property.hostName || `ID: ${property.hostId}`}
              </span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[9px] uppercase font-bold tracking-wider">Approval workflow</span>
              <span className="font-semibold text-neutral-900 mt-0.5 block truncate">
                {property.bookingApprovalType === 'MANUAL' ? 'Manual Validation' : 'Instant Booking'}
              </span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[9px] uppercase font-bold tracking-wider">Registration Date</span>
              <span className="font-medium text-neutral-700 mt-0.5 flex items-center gap-1 truncate">
                <FiCalendar size={12} className="text-neutral-400 shrink-0" />
                {formatDate(property.createdAt)}
              </span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[9px] uppercase font-bold tracking-wider">System Log Update</span>
              <span className="font-medium text-neutral-700 mt-0.5 flex items-center gap-1 truncate">
                <FiClock size={12} className="text-neutral-400 shrink-0" />
                {formatDate(property.updatedAt)}
              </span>
            </div>
          </div>

          {/* Physical Parameters Grouping */}
          <div className="grid sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1">
              <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Location Properties</h4>
              <p className="text-xs text-neutral-700 flex items-start gap-1.5 leading-relaxed">
                <FiMapPin size={14} className="shrink-0 text-neutral-400 mt-0.5" />
                <span>{[property.address, property.city, property.state, property.country].filter(Boolean).join(', ') || 'No address registered.'}</span>
              </p>
            </div>

            <div className="space-y-1">
              <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Structural Limits</h4>
              <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-700 mt-1">
                <span className="px-2 py-1 rounded bg-neutral-100 border border-neutral-200/40">{property.maxGuests || 1} Guests Max</span>
                <span className="px-2 py-1 rounded bg-neutral-100 border border-neutral-200/40">{property.bedrooms || 0} Bedrooms</span>
                <span className="px-2 py-1 rounded bg-neutral-100 border border-neutral-200/40">{property.bathrooms || 0} Bathrooms</span>
              </div>
            </div>
          </div>

          {/* Description Section */}
          {property.description && (
            <div className="space-y-1 pt-1">
              <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Listing Description</h4>
              <p className="text-xs text-neutral-600 leading-relaxed max-h-24 overflow-y-auto pr-1">
                {property.description}
              </p>
            </div>
          )}

          {/* Active Features Checklist */}
          {Array.isArray(property.amenities) && property.amenities.length > 0 && (
            <div className="space-y-2 pt-1">
              <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Verified Amenities</h4>
              <div className="flex flex-wrap gap-1.5">
                {property.amenities.map((item) => (
                  <span
                    key={item}
                    className="px-2.5 py-1 rounded-md bg-neutral-50 text-neutral-700 text-[11px] font-medium border border-neutral-200 flex items-center gap-1"
                  >
                    <FiCheckCircle size={11} className="text-neutral-400" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Administrative Directives */}
          {property.deleted && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2.5">
              <FiInfo size={16} className="shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                This asset has been soft-deleted and permanently assigned an offline status. Per system configuration variables, archival properties cannot be altered or restored.
              </span>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 border-t border-neutral-200/80 bg-neutral-50/50 flex items-center justify-end gap-2.5">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {!property.deleted && (
              <button
                onClick={() => {
                  onClose();
                  if (onDeleteClick) onDeleteClick(property);
                }}
                className="h-9 px-3 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 active:bg-red-200/60 flex items-center justify-center transition-colors cursor-pointer"
                title="Delete asset listing"
              >
                <FiTrash2 size={14} />
              </button>
            )}

            <button
              onClick={() => {
                onClose();
                if (onManageImages) onManageImages(property);
              }}
              className="flex-1 sm:flex-initial h-9 px-2 rounded-lg border border-neutral-300 bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <FiCamera size={13} />
              <span>Photos</span>
            </button>

            <button
              onClick={() => {
                onClose();
                if (onEditClick) onEditClick(property);
              }}
              className="flex-1 sm:flex-initial h-9 px-2 rounded-lg bg-neutral-950 text-white text-xs font-semibold hover:bg-neutral-900 active:bg-neutral-800 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <FiEdit2 size={13} />
              <span>Edit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPropertyDetailDrawer;