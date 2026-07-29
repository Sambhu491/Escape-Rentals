import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';
import SectionCard from '../../components/account/SectionCard';
import HostPropertiesView from '../../components/account/properties/HostPropertiesView';
import AdminPropertiesView from '../../components/account/properties/AdminPropertiesView';
import UserPropertiesView from '../../components/account/properties/UserPropertiesView';
import PropertyWizardModal from '../../components/account/properties/PropertyWizardModal';
import PropertyImageManagerModal from '../../components/account/properties/PropertyImageManagerModal';
import DeletePropertyConfirmModal from '../../components/account/properties/DeletePropertyConfirmModal';
import {
  fetchMyProperties,
  fetchAdminProperties,
  deletePropertyAsync,
  selectMyProperties,
  selectAdminProperties,
  selectPropertyFetchStatus,
  selectPropertyError,
  selectAdminPagination,
  selectIsDeletingProperty,
  selectPropertyById,
} from '../../redux/property/propertySlice';
import { fetchCategories, selectCategoryStatus } from '../../redux/category/categorySlice';

const PAGE_SIZE = 12;

const PropertySkeleton = () => (
  <div className="rounded-xl border border-black/[0.05] p-4 bg-white space-y-3 animate-pulse">
    <div className="aspect-[16/10] bg-black/[0.04] rounded-lg w-full" />
    <div className="h-4 w-3/4 bg-black/[0.04] rounded" />
    <div className="h-3 w-1/2 bg-black/[0.03] rounded" />
    <div className="flex justify-between pt-2 border-t border-black/[0.04]">
      <div className="h-4 w-20 bg-black/[0.04] rounded" />
      <div className="h-4 w-16 bg-black/[0.03] rounded" />
    </div>
  </div>
);

const PropertiesSection = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const role = user?.role;
  const [searchParams, setSearchParams] = useSearchParams();

  const myProperties = useSelector(selectMyProperties);
  const adminProperties = useSelector(selectAdminProperties);
  const fetchStatus = useSelector(selectPropertyFetchStatus);
  const error = useSelector(selectPropertyError);
  const adminPagination = useSelector(selectAdminPagination);
  const categoryStatus = useSelector(selectCategoryStatus);
  const isDeletingProperty = useSelector(selectIsDeletingProperty);

  const [adminPage, setAdminPage] = useState(0);

  // Wizard Modal State
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardProperty, setWizardProperty] = useState(null);

  // Auto-open the create wizard when arriving via a "?new=true" deep link
  // (used by the Host quick action, since there is no standalone /properties/new route).
  useEffect(() => {
    if ((role === 'ROLE_HOST' || role === 'ROLE_ADMIN') && searchParams.get('new') === 'true') {
      setWizardProperty(null);
      setIsWizardOpen(true);
      searchParams.delete('new');
      setSearchParams(searchParams, { replace: true });
    }
  }, [role, searchParams, setSearchParams]);

  // Image Manager Modal State — store ID only
  const [isImageManagerOpen, setIsImageManagerOpen] = useState(false);
  const [imageManagerPropertyId, setImageManagerPropertyId] = useState(null);

  // Derive live property from Redux
  const imageManagerProperty = useSelector((state) =>
    selectPropertyById(state, imageManagerPropertyId)
  );

  // Delete Confirmation Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingProperty, setDeletingProperty] = useState(null);

  // Fetch Categories on mount if idle
  useEffect(() => {
    if (categoryStatus === 'idle') {
      dispatch(fetchCategories());
    }
  }, [dispatch, categoryStatus]);

  // Fetch properties based on role
  const loadRoleProperties = useCallback(
    (page = 0) => {
      if (role === 'ROLE_HOST') {
        dispatch(fetchMyProperties());
      } else if (role === 'ROLE_ADMIN') {
        dispatch(fetchAdminProperties({ page, size: PAGE_SIZE }));
      }
    },
    [dispatch, role]
  );

  useEffect(() => {
    loadRoleProperties(adminPage);
  }, [loadRoleProperties, adminPage]);

  const isLoading = useMemo(() => {
    if (role === 'ROLE_HOST') return fetchStatus.mine === 'loading';
    if (role === 'ROLE_ADMIN') return fetchStatus.admin === 'loading';
    return false;
  }, [role, fetchStatus]);

  const isFailed = useMemo(() => {
    if (role === 'ROLE_HOST') return fetchStatus.mine === 'failed';
    if (role === 'ROLE_ADMIN') return fetchStatus.admin === 'failed';
    return false;
  }, [role, fetchStatus]);

  const sectionTitle =
    role === 'ROLE_HOST'
      ? 'My Properties'
      : role === 'ROLE_ADMIN'
        ? 'All Properties'
        : 'Properties';

  const handleAdminPageChange = useCallback((page) => {
    setAdminPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleCreateProperty = useCallback(() => {
    setWizardProperty(null);
    setIsWizardOpen(true);
  }, []);

  const handleEditProperty = useCallback((property) => {
    setWizardProperty(property);
    setIsWizardOpen(true);
  }, []);

  const handleManageImages = useCallback((property) => {
    setImageManagerPropertyId(property.id);
    setIsImageManagerOpen(true);
  }, []);

  const handleCloseImageManager = useCallback(() => {
    setIsImageManagerOpen(false);
    setImageManagerPropertyId(null);
  }, []);

  const handleDeleteProperty = useCallback((property) => {
    setDeletingProperty(property);
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = async () => {
    if (!deletingProperty) return;
    const result = await dispatch(deletePropertyAsync(deletingProperty.id));
    if (deletePropertyAsync.fulfilled.match(result)) {
      setIsDeleteModalOpen(false);
      setDeletingProperty(null);
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="h-6 w-36 bg-black/[0.04] rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <PropertySkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Error State
  if (isFailed) {
    return (
      <div className="space-y-5">
        <h1 className="text-[20px] font-semibold tracking-tight text-neutral-900">
          {sectionTitle}
        </h1>
        <SectionCard>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/[0.06] flex items-center justify-center mb-4">
              <FiHome size={22} className="text-red-400" />
            </div>
            <h3 className="text-[15px] font-semibold text-neutral-900 mb-1">
              Failed to load properties
            </h3>
            <p className="text-[12px] text-neutral-400 max-w-xs mb-5">
              {error || 'Something went wrong while loading property data.'}
            </p>
            <button
              onClick={() => loadRoleProperties(adminPage)}
              className="px-5 py-2.5 rounded-xl bg-neutral-900 text-white text-[11px] font-bold uppercase tracking-[0.15em] hover:bg-black transition-all duration-150 ease-out active:scale-[0.98]"
            >
              Try Again
            </button>
          </div>
        </SectionCard>
      </div>
    );
  }

  // Render Role Views
  return (
    <div className="space-y-5">
      <h1 className="text-[20px] font-semibold tracking-tight text-neutral-900">
        {sectionTitle}
      </h1>

      {role === 'ROLE_HOST' && (
        <HostPropertiesView
          properties={myProperties}
          onCreateClick={handleCreateProperty}
          onEditClick={handleEditProperty}
          onManageImages={handleManageImages}
          onDeleteClick={handleDeleteProperty}
        />
      )}

      {role === 'ROLE_ADMIN' && (
        <AdminPropertiesView
          properties={adminProperties}
          pagination={adminPagination}
          onPageChange={handleAdminPageChange}
          onCreateClick={handleCreateProperty}
          onEditClick={handleEditProperty}
          onManageImages={handleManageImages}
          onDeleteClick={handleDeleteProperty}
        />
      )}

      {role !== 'ROLE_HOST' && role !== 'ROLE_ADMIN' && (
        <UserPropertiesView />
      )}

      {/* Property Wizard Modal for Create & Edit */}
      <PropertyWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        property={wizardProperty}
      />

      {/* Property Image Manager Modal */}
      <PropertyImageManagerModal
        isOpen={isImageManagerOpen}
        onClose={handleCloseImageManager}
        propertyId={imageManagerPropertyId}
      />

      {/* Delete Property Confirmation Modal */}
      <DeletePropertyConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        property={deletingProperty}
        isDeleting={isDeletingProperty}
      />
    </div>
  );
};

export default PropertiesSection;