import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiX,
  FiUploadCloud,
  FiTrash2,
  FiAlertCircle,
  FiImage,
  FiLoader,
  FiCheckCircle,
} from 'react-icons/fi';
import ImageWithLoader from '../../loading/ImageWithLoader/ImageWithLoader';
import noImage from '../../../assets/noImage.jpg';
import {
  uploadPropertyImagesAsync,
  deletePropertyImageAsync,
  selectPropertyById,
  selectIsUploadingImages,
  selectIsDeletingImage,
  selectMutationError,
  clearPropertyErrors,
} from '../../../redux/property/propertySlice';

const MAX_IMAGES = 10;
const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB

// ─── Image format helpers ─────────────────────────────────────

const getImageId = (img) => {
  if (typeof img === 'string') return null;
  return img.id ?? img.imageId ?? null;
};

const getImageSrc = (img) => {
  if (typeof img === 'string') return img;
  return img.imageUrl ?? img.url ?? '';
};

// ─── Component ────────────────────────────────────────────────

const PropertyImageManagerModal = ({ isOpen, onClose, propertyId }) => {
  const dispatch = useDispatch();

  // Select live property from Redux
  const property = useSelector((state) =>
    selectPropertyById(state, propertyId)
  );

  const isUploading = useSelector(selectIsUploadingImages);
  const isDeleting = useSelector(selectIsDeletingImage);
  const mutationError = useSelector(selectMutationError);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [deletingImageId, setDeletingImageId] = useState(null);

  // Reset local state on open / propertyId change only
  useEffect(() => {
    if (isOpen && propertyId != null) {
      dispatch(clearPropertyErrors());
      setSelectedFiles([]);
      setValidationError('');
      setDeletingImageId(null);
    }
  }, [isOpen, propertyId, dispatch]);

  // Lock body scroll
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Pre-compute object URLs; revoke on cleanup
  const previewUrls = useMemo(
    () =>
      selectedFiles.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      })),
    [selectedFiles]
  );

  useEffect(() => {
    return () => {
      previewUrls.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [previewUrls]);

  // Guard
  if (!isOpen || !property) return null;

  // Resolve existing images array from live Redux data
  const existingImages = Array.isArray(property.images) ? property.images : [];
  const currentCount = existingImages.length;

  // ─── File Validation & Queueing ─────────────────────────────

  const processFiles = (files) => {
    setValidationError('');
    const validFiles = [];
    let err = null;

    if (currentCount + selectedFiles.length + files.length > MAX_IMAGES) {
      setValidationError(
        `Total images cannot exceed ${MAX_IMAGES}. You currently have ${currentCount} uploaded.`
      );
      return;
    }

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        err = `File "${file.name}" exceeds the 3MB size limit.`;
        break;
      }
      if (!file.type.startsWith('image/')) {
        err = `File "${file.name}" is not a valid image format.`;
        break;
      }
      validFiles.push(file);
    }

    if (err) {
      setValidationError(err);
    } else {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
    e.target.value = '';
  };

  // ─── Drag & Drop ────────────────────────────────────────────

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removeFileFromQueue = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // ─── Upload ─────────────────────────────────────────────────

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    const result = await dispatch(
      uploadPropertyImagesAsync({ id: property.id, images: selectedFiles })
    );

    if (uploadPropertyImagesAsync.fulfilled.match(result)) {
      setSelectedFiles([]);
      setValidationError('');
    }
  };

  // ─── Delete Image ───────────────────────────────────────────

  const handleDeleteImage = async (imageId) => {
    if (imageId == null) return;

    try {
      setDeletingImageId(imageId);

      const result = await dispatch(
        deletePropertyImageAsync({
          propertyId: property.id,
          imageId,
        })
      );

      if (deletePropertyImageAsync.rejected.match(result)) {
        // allow redux error handling via mutationError.deleteImage
      }
    } finally {
      setDeletingImageId(null);
    }
  };

  // ─── Render ─────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.08] bg-neutral-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center">
              <FiImage size={16} />
            </div>
            <p className="text-xs text-neutral-500">
                {currentCount} of {MAX_IMAGES} images uploaded
              </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-black/[0.05] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Mutation & Validation Errors */}
        {(validationError || mutationError?.uploadImages || mutationError?.deleteImage) && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
            <FiAlertCircle size={16} className="shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>
                {validationError || mutationError.uploadImages || mutationError.deleteImage}
              </span>
            </div>
          </div>
        )}

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto 
        mt-2
        px-6 py-5 space-y-6">
          {/* Section 1: Existing Uploaded Gallery */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
              Current Property Images ({currentCount}/{MAX_IMAGES})
            </h3>

            {currentCount === 0 ? (
              <div className="p-6 text-center border border-dashed border-neutral-200 rounded-xl bg-neutral-50">
                <FiImage size={24} className="mx-auto text-neutral-400 mb-1" />
                <p className="text-xs text-neutral-500">
                  No images uploaded for this property yet.
                </p>
              </div>
            ) : (
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
  {existingImages.map((imgItem, idx) => {
    const src = getImageSrc(imgItem);
    const imageId = getImageId(imgItem);

    const isCurrentlyDeleting =
      isDeleting && deletingImageId === imageId;

    return (
      <div
        key={imageId ?? src ?? idx}
        className="
          relative
          rounded-xl
          overflow-hidden
          border border-neutral-200
          bg-neutral-100
          shadow-sm
        "
      >
        <div className="aspect-[4/3]">
          <ImageWithLoader
            src={src || noImage}
            alt={`Property image ${idx + 1}`}
            variant="shimmer"
            className="w-full h-full object-cover"
          />
        </div>


        {/* Always visible delete action */}
        <div className="
          flex
          items-center
          justify-between
          px-2
          py-2
          bg-white
          border-t
          border-neutral-100
        ">

          <span className="
            text-[10px]
            uppercase
            tracking-wide
            text-neutral-500
          ">
            Image {idx + 1}
          </span>


          <button
            onClick={() => handleDeleteImage(imageId)}
            disabled={
              !imageId ||
              isCurrentlyDeleting ||
              isUploading
            }
            className="
              flex
              items-center
              gap-1
              px-2
              py-1
              rounded-md
              border
              border-neutral-200
              text-neutral-600
              hover:text-red-600
              hover:border-red-200
              transition
              text-[11px]
              font-medium
              disabled:opacity-40
            "
          >
            {
              isCurrentlyDeleting
              ?
              <FiLoader 
                size={12}
                className="animate-spin"
              />
              :
              <FiTrash2 size={12}/>
            }

            Remove
          </button>

        </div>

      </div>
    );
  })}
</div>
            )}
          </div>

          {/* Section 2: Upload Zone (If slots available) */}
          {currentCount < MAX_IMAGES && (
            <div className="space-y-3 pt-4 border-t border-black/[0.05]">
              <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                Upload New Photos
              </h3>

              {/* Drag & Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`p-6 border-2 border-dashed rounded-2xl text-center transition-colors ${
                  dragActive
                    ? 'border-neutral-900 bg-neutral-100'
                    : 'border-neutral-300 bg-neutral-50/50 hover:bg-neutral-50'
                }`}
              >
                <FiUploadCloud size={32} className="mx-auto text-neutral-400 mb-2" />
                <p className="text-xs font-semibold text-neutral-900">
                  Drag and drop image files here, or browse
                </p>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Supported formats: JPG, PNG. Max file size: 3MB.
                </p>

                <label className="inline-block mt-3 px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-semibold cursor-pointer hover:bg-black transition-colors">
                  Browse Files
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Upload Queue Preview */}
              {selectedFiles.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-800">
                      Files ready to upload ({selectedFiles.length})
                    </span>
                    <button
                      onClick={handleUpload}
                      disabled={isUploading}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-emerald-700 disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                      {isUploading ? (
                        <>
                          <FiLoader size={14} className="animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <FiCheckCircle size={14} />
                          <span>Upload Now</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {previewUrls.map((item, i) => (
                      <div
                        key={`${item.file.name}-${item.file.size}-${i}`}
                        className="relative aspect-[4/3] rounded-lg overflow-hidden border border-black/[0.08] bg-neutral-100"
                      >
                        <img
                          src={item.url}
                          alt={item.file.name}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removeFileFromQueue(i)}
                          disabled={isUploading}
                          className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-black transition-colors disabled:opacity-50"
                        >
                          <FiX size={12} />
                        </button>
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-[9px] text-white truncate max-w-[90%]">
                          {(item.file.size / (1024 * 1024)).toFixed(1)}MB
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-black/[0.08] bg-neutral-50/50">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-black/[0.08] bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyImageManagerModal;