import React, { useState, useMemo } from 'react';
import SectionCard from '../SectionCard';
import PlaceholderCard from '../PlaceholderCard';
import PropertyPagination from '../../property/PropertyPagination';
import AdminPropertyDetailDrawer from './AdminPropertyDetailDrawer';
import PropertyStatusBadge from './PropertyStatusBadge';
import {
  FiHome,
  FiUser,
  FiMapPin,
  FiEdit2,
  FiCamera,
  FiTrash2,
  FiEye,
  FiSearch,
  FiX,
} from 'react-icons/fi';

const STATUS_FILTERS = [
  { key: 'ALL', label: 'All' },
  { key: 'AVAILABLE', label: 'Available' },
  { key: 'UNAVAILABLE', label: 'Unavailable' },
  { key: 'UNDER_MAINTENANCE', label: 'Maintenance' },
  { key: 'DELETED', label: 'Deleted' },
];

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch (e) {
    return dateStr;
  }
};

const AdminPropertiesView = ({
  properties = [],
  pagination = { page: 0, totalPages: 0, totalElements: 0 },
  onPageChange,
  onCreateClick,
  onEditClick,
  onManageImages,
  onDeleteClick,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedPropertyForDrawer, setSelectedPropertyForDrawer] = useState(null);

  const filteredProperties = useMemo(() => {
    if (!Array.isArray(properties)) return [];

    return properties.filter((property) => {
      if (statusFilter === 'DELETED') {
        if (!property.deleted) return false;
      } else if (statusFilter !== 'ALL') {
        if (property.status !== statusFilter) return false;
      }

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const titleMatch = property.title?.toLowerCase().includes(query);
        const hostMatch = property.hostName?.toLowerCase().includes(query);
        const cityMatch = property.city?.toLowerCase().includes(query);
        const categoryMatch = property.categoryName?.toLowerCase().includes(query);
        return titleMatch || hostMatch || cityMatch || categoryMatch;
      }

      return true;
    });
  }, [properties, statusFilter, searchTerm]);

  return (
    <SectionCard
      title="All Properties"
      subtitle="Platform-wide property listings, host details, and status management"
      actionLabel={pagination.totalElements ? `${pagination.totalElements} Total` : null}
    >

      {/* Search & Filter Toolbar */}
 {/* Search & Filter Toolbar */}
<div className="space-y-3 pb-4 border-b border-black/[0.06] mb-4">

  {/* Search + Create */}
  <div className="flex flex-col sm:flex-row items-stretch 
  sm:items-center justify-between gap-2">

    <div className="relative flex-1 max-w-md">
      <FiSearch
        size={16}
        className="absolute left-3.5 top-1/2 
        -translate-y-1/2 text-neutral-400"
      />

      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search by title, host name, city, category..."
        className="w-full pl-9 pr-9 py-2 rounded-sm
        border border-black/[0.08] bg-white 
        text-xs text-neutral-900 
        placeholder:text-neutral-400 
        focus:outline-none focus:border-neutral-900 
        transition-colors"
      />

      {searchTerm && (
        <button
          onClick={() => setSearchTerm('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
        >
          <FiX size={14}/>
        </button>
      )}
    </div>

    <button
      onClick={onCreateClick}
      className="px-4 py-2 rounded-sm 
      bg-neutral-900 text-white 
      text-xs font-semibold 
      hover:bg-black transition-all 
      active:scale-95 whitespace-nowrap"
    >
      + Create Property
    </button>

  </div>

        
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5" role="tablist" aria-label="Admin status filters">
          {STATUS_FILTERS.map((tab) => {
            const count = tab.key === 'ALL'
              ? properties.length
              : tab.key === 'DELETED'
              ? properties.filter((p) => p.deleted).length
              : properties.filter((p) => p.status === tab.key).length;

            const isActive = statusFilter === tab.key;

            return (
              <button
                key={tab.key}
                role="tab"
                aria-selected={isActive}
                onClick={() => setStatusFilter(tab.key)}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
                  isActive
                    ? 'bg-neutral-900 text-white shadow-2xs'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-black/[0.04]'
                }`}
              >
                {tab.label}
                <span className={`ml-1.5 ${isActive ? 'text-white/70' : 'text-neutral-400'}`}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div> 
      </div>

      

      {properties.length === 0 ? (
        <PlaceholderCard
          title="No properties found"
          description="There are currently no property listings on the platform."
          icon={FiHome}
        />
      ) : filteredProperties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in duration-150">
          <div className="w-12 h-12 rounded-full bg-black/[0.03] flex items-center justify-center mb-3">
            <FiSearch size={20} className="text-neutral-400" />
          </div>
          <h3 className="text-sm font-semibold text-neutral-900 mb-1">
            No matching properties
          </h3>
          <p className="text-xs text-neutral-400 max-w-xs">
            No platform listings matched your search or status filter criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-4 pt-1">
          <div className="overflow-x-auto rounded-xl border border-black/[0.08]">
            <table className="w-full text-left text-xs text-neutral-700">
              <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider font-semibold border-b border-black/[0.06]">
                <tr>
                  <th className="px-4 py-3">Property</th>
                  <th className="px-4 py-3">Host</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price/Night</th>
                  <th className="px-4 py-3">Booking Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">State</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.05] bg-white">
                {filteredProperties.map((property) => (
                  <tr key={property.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-neutral-900 text-sm line-clamp-1">
                        {property.title}
                      </div>
                      <div className="flex items-center gap-1 text-neutral-400 text-xs mt-0.5">
                        <FiMapPin size={11} />
                        <span>{[property.city, property.country].filter(Boolean).join(', ')}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-neutral-800 font-medium">
                        <FiUser size={13} className="text-neutral-400" />
                        <span>{property.hostName || `Host #${property.hostId}`}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-neutral-600">
                      {property.categoryName || 'Standard'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-bold text-neutral-900">
                      ₹{property.pricePerNight}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 text-neutral-700">
                        {property.bookingApprovalType === 'MANUAL' ? 'Manual' : 'AUTO'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <PropertyStatusBadge status={property.status} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {property.deleted ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 uppercase tracking-wider">
                          Deleted
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-neutral-500 text-[11px]">
                      {formatDate(property.createdAt)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedPropertyForDrawer(property)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-black/[0.08] bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer active:scale-95"
                          title="View property details"
                          aria-label={`View details for ${property.title}`}
                        >
                          <FiEye size={12} />
                        </button>
                        <button
                          onClick={() => onManageImages && onManageImages(property)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-black/[0.08] bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer active:scale-95"
                          title="Manage photos"
                          aria-label={`Manage photos for ${property.title}`}
                        >
                          <FiCamera size={12} />
                        </button>
                        <button
                          onClick={() => onEditClick && onEditClick(property)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-black/[0.08] bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer active:scale-95"
                          aria-label={`Edit ${property.title}`}
                        >
                          <FiEdit2 size={12} />
                          <span>Edit</span>
                        </button>
                        {!property.deleted && (
                          <button
                            onClick={() => onDeleteClick && onDeleteClick(property)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-red-200 bg-red-50 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors cursor-pointer active:scale-95"
                            title="Delete listing"
                            aria-label={`Delete ${property.title}`}
                          >
                            <FiTrash2 size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex justify-center pt-4">
              <PropertyPagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={onPageChange}
              />
            </div>
          )}
        </div>
      )}

      {/* Admin Property Detail Drawer */}
      <AdminPropertyDetailDrawer
        isOpen={Boolean(selectedPropertyForDrawer)}
        onClose={() => setSelectedPropertyForDrawer(null)}
        property={selectedPropertyForDrawer}
        onEditClick={onEditClick}
        onManageImages={onManageImages}
        onDeleteClick={onDeleteClick}
      />
    </SectionCard>
  );
};

export default AdminPropertiesView;
