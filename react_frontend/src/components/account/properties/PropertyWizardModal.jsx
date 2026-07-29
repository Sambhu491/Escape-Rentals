import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FiX,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiUploadCloud,
  FiAlertCircle,
  FiInfo,
  FiImage,
  FiCheckCircle,
  FiTrash2,
  FiLoader,
} from "react-icons/fi";
import ImageWithLoader from "../../loading/ImageWithLoader/ImageWithLoader";
import noImage from "../../../assets/noImage.jpg";
import {
  createPropertyAsync,
  updatePropertyAsync,
  deletePropertyImageAsync,
  uploadPropertyImagesAsync,
  selectIsCreatingProperty,
  selectIsUpdatingProperty,
  selectIsUploadingImages,
  selectIsDeletingImage,
  selectMutationError,
  clearPropertyErrors,
  PROPERTY_STATUS,
  BOOKING_APPROVAL_TYPE,
} from "../../../redux/property/propertySlice";
import { selectAllCategories } from "../../../redux/category/categorySlice";

const DEFAULT_AMENITIES = [
  "WiFi",
  "Air Conditioning",
  "Kitchen",
  "Free Parking",
  "Swimming Pool",
  "Gym",
  "TV",
  "Washer",
  "Dedicated Workspace",
  "Balcony",
  "Patio",
  "Pet Friendly",
  "Hot Tub",
  "EV Charger",
];

const STEPS = [
  { id: 1, title: "Basic Info" },
  { id: 2, title: "Location" },
  { id: 3, title: "Capacity" },
  { id: 4, title: "Amenities" },
  { id: 5, title: "Images" },
  { id: 6, title: "Booking" },
  { id: 7, title: "Review" },
];

const INITIAL_FORM = {
  title: "",
  description: "",
  categoryId: "",
  pricePerNight: "",
  address: "",
  city: "",
  state: "",
  country: "",
  maxGuests: 2,
  bedrooms: 1,
  bathrooms: 1,
  amenities: ["WiFi"],
  bookingApprovalType: BOOKING_APPROVAL_TYPE.AUTO,
  status: PROPERTY_STATUS.AVAILABLE,
};

// ─── Image format helpers ─────────────────────────────────────
const getImageId = (img) => {
  if (typeof img === "string") return null;
  return img.id ?? img.imageId ?? null;
};

const getImageSrc = (img) => {
  if (typeof img === "string") return img;
  return img.imageUrl ?? img.url ?? "";
};

const PropertyWizardModal = ({ isOpen, onClose, property = null }) => {
  const dispatch = useDispatch();
  const categories = useSelector(selectAllCategories);
  const isCreating = useSelector(selectIsCreatingProperty);
  const isUpdating = useSelector(selectIsUpdatingProperty);
  const isUploading = useSelector(selectIsUploadingImages);
  const isDeleting = useSelector(selectIsDeletingImage);
  const mutationError = useSelector(selectMutationError);

  const isSubmitting = isCreating || isUpdating || isUploading;
  const isEditMode = Boolean(property && property.id);

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [customAmenity, setCustomAmenity] = useState("");
  const [stepErrors, setStepErrors] = useState({});
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  
  // Image Manager Specific State
  const [deletingImageId, setDeletingImageId] = useState(null);
  const [validationError, setValidationError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false); // <-- NEW: Success feedback state

  useEffect(() => {
    if (isOpen) {
      dispatch(clearPropertyErrors());
      setCurrentStep(1);
      setStepErrors({});
      setShowCancelConfirm(false);
      setValidationError("");
      setDeletingImageId(null);
      setDragActive(false);
      setUploadSuccess(false);

      if (property) {
        setFormData({
          title: property.title || "",
          description: property.description || "",
          categoryId: property.categoryId ? String(property.categoryId) : "",
          pricePerNight: property.pricePerNight ? String(property.pricePerNight) : "",
          address: property.address || "",
          city: property.city || "",
          state: property.state || "",
          country: property.country || "",
          maxGuests: property.maxGuests || 1,
          bedrooms: property.bedrooms || 0,
          bathrooms: property.bathrooms || 0,
          amenities: Array.isArray(property.amenities) ? [...property.amenities] : [],
          bookingApprovalType: property.bookingApprovalType || BOOKING_APPROVAL_TYPE.AUTO,
          status: property.status || PROPERTY_STATUS.AVAILABLE,
        });
        setExistingImages(Array.isArray(property.images) ? property.images : []);
        setSelectedFiles([]);
      } else {
        setFormData(INITIAL_FORM);
        setExistingImages([]);
        setSelectedFiles([]);
      }
    }
  }, [isOpen, property, dispatch]);

  const isDirty = useMemo(() => {
    if (!isOpen) return false;
    if (selectedFiles.length > 0) return true;
    if (!isEditMode) {
      return (
        formData.title !== INITIAL_FORM.title ||
        formData.description !== INITIAL_FORM.description ||
        formData.address !== INITIAL_FORM.address ||
        formData.city !== INITIAL_FORM.city ||
        formData.pricePerNight !== INITIAL_FORM.pricePerNight
      );
    }
    return (
      formData.title !== (property?.title || "") ||
      formData.description !== (property?.description || "") ||
      formData.pricePerNight !== String(property?.pricePerNight || "") ||
      formData.status !== (property?.status || PROPERTY_STATUS.AVAILABLE)
    );
  }, [isOpen, selectedFiles, formData, isEditMode, property]);

  const previewUrls = useMemo(() => {
    return selectedFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
  }, [selectedFiles]);

  useEffect(() => {
    return () => {
      previewUrls.forEach((item) => {
        URL.revokeObjectURL(item.url);
      });
    };
  }, [previewUrls]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (stepErrors[key]) {
      setStepErrors((prev) => ({ ...prev, [key]: null }));
    }
  };

  const validateStep = (step) => {
    const errors = {};
    if (step === 1) {
      if (!formData.title.trim()) errors.title = "Title is required";
      else if (formData.title.length > 150) errors.title = "Title cannot exceed 150 characters";
      if (!formData.categoryId) errors.categoryId = "Please select a category";
      if (!formData.pricePerNight) errors.pricePerNight = "Price per night is required";
      else if (Number(formData.pricePerNight) <= 0) errors.pricePerNight = "Price must be greater than zero";
    } else if (step === 2) {
      if (!formData.address.trim()) errors.address = "Street address is required";
      if (!formData.city.trim()) errors.city = "City is required";
      if (!formData.state.trim()) errors.state = "State is required";
      if (!formData.country.trim()) errors.country = "Country is required";
    } else if (step === 3) {
      if (Number(formData.maxGuests) < 1) errors.maxGuests = "Must accommodate at least 1 guest";
      if (Number(formData.bedrooms) < 0) errors.bedrooms = "Bedrooms cannot be negative";
      if (Number(formData.bathrooms) < 0) errors.bathrooms = "Bathrooms cannot be negative";
    } else if (step === 5 && !isEditMode) {
      if (selectedFiles.length === 0) errors.images = "Please select at least 1 image for your property";
      else if (selectedFiles.length > 10) errors.images = "Maximum 10 images allowed";
    }

    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const toggleAmenity = (item) => {
    setFormData((prev) => {
      const exists = prev.amenities.includes(item);
      if (exists) {
        return { ...prev, amenities: prev.amenities.filter((a) => a !== item) };
      }
      if (prev.amenities.length >= 20) return prev;
      return { ...prev, amenities: [...prev.amenities, item] };
    });
  };

  const addCustomAmenity = () => {
    const trimmed = customAmenity.trim();
    if (trimmed && !formData.amenities.includes(trimmed) && formData.amenities.length < 20) {
      setFormData((prev) => ({
        ...prev,
        amenities: [...prev.amenities, trimmed],
      }));
      setCustomAmenity("");
    }
  };

  // ─── Image Management Logic ─────────────────────────────────
  const processFiles = (files) => {
    setValidationError("");
    const validFiles = [];
    let err = null;
    const currentCount = existingImages.length;

    if (currentCount + selectedFiles.length + files.length > 10) {
      setValidationError(`Total images cannot exceed 10. You currently have ${currentCount} uploaded.`);
      return;
    }

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        err = `File "${file.name}" exceeds the 3MB size limit.`;
        break;
      }
      if (!file.type.startsWith("image/")) {
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
    e.target.value = "";
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
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

  const handleUploadNewImages = async () => {
    if (selectedFiles.length === 0 || !isEditMode) return;

    const result = await dispatch(
      uploadPropertyImagesAsync({ id: property.id, images: selectedFiles })
    );

    if (uploadPropertyImagesAsync.fulfilled.match(result)) {
      // 1. Intelligently extract new images from the payload (handles various backend response shapes)
      let imagesToAdd = [];
      
      if (Array.isArray(result.payload)) {
        imagesToAdd = result.payload;
      } else if (result.payload?.images) {
        imagesToAdd = result.payload.images;
      } else if (result.payload?.property?.images) {
        // If the payload returned the entire updated property object, replace the gallery entirely
        setExistingImages(result.payload.property.images);
        imagesToAdd = []; 
      }

      // 2. Append the new images to the existing gallery so the user sees them immediately
      if (imagesToAdd.length > 0) {
       setExistingImages((prev)=>{
    const merged=[
        ...prev,
        ...imagesToAdd
    ];

    return merged.filter(
        (img,index,array)=>
            index === array.findIndex(
                x => getImageId(x) === getImageId(img)
            )
    );
});
      }

      // 3. Clear the upload queue and validation errors
      setSelectedFiles([]);
      setValidationError("");
      
      // 4. Trigger success feedback for the user
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3500);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (imageId == null || !isEditMode) return;

    try {
      setDeletingImageId(imageId);
      const result = await dispatch(
        deletePropertyImageAsync({
          propertyId: property.id,
          imageId,
        })
      );

      if (deletePropertyImageAsync.fulfilled.match(result)) {
        setExistingImages((prev) => prev.filter((img) => getImageId(img) !== imageId));
      }
    } finally {
      setDeletingImageId(null);
    }
  };

  // Close Trigger
  const handleAttemptClose = () => {
    if (isDirty && !isSubmitting) {
      setShowCancelConfirm(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    setShowCancelConfirm(false);
    onClose();
  };

  // Final Form Submission
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    if (!isEditMode) {
      // CREATE MODE
      const propertyData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        pricePerNight: Number(formData.pricePerNight),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country.trim(),
        maxGuests: Number(formData.maxGuests),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        amenities: formData.amenities,
        categoryId: Number(formData.categoryId),
      };

      const result = await dispatch(
        createPropertyAsync({ propertyData, images: selectedFiles })
      );

      if (createPropertyAsync.fulfilled.match(result)) {
        onClose();
      }
    } else {
      // EDIT MODE (Text data)
      const updateData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        pricePerNight: Number(formData.pricePerNight),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country.trim(),
        maxGuests: Number(formData.maxGuests),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        amenities: formData.amenities,
        categoryId: Number(formData.categoryId),
        status: formData.status,
        bookingApprovalType: formData.bookingApprovalType,
      };

      const result = await dispatch(
        updatePropertyAsync({ id: property.id, data: updateData })
      );

      if (updatePropertyAsync.fulfilled.match(result)) {
        // Fallback: If user queued images but hit "Save Changes" instead of "Upload Now"
        if (selectedFiles.length > 0) {
          const uploadResult = await dispatch(
            uploadPropertyImagesAsync({ id: property.id, images: selectedFiles })
          );
          
          if (uploadPropertyImagesAsync.fulfilled.match(uploadResult)) {
             let imagesToAdd = [];
             if (Array.isArray(uploadResult.payload)) imagesToAdd = uploadResult.payload;
             else if (uploadResult.payload?.images) imagesToAdd = uploadResult.payload.images;
             else if (uploadResult.payload?.property?.images) setExistingImages(uploadResult.payload.property.images);
             
             if (imagesToAdd.length > 0) {
               setExistingImages((prev) => [...prev, ...imagesToAdd]);
             }
          }
        }
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200 pb-15">
      <div className="relative w-full max-w-3xl h-[650px] max-h-[88vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.08] bg-linear-to-b from-gray-100 to-gray-200 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-neutral-900">
              {isEditMode ? "Edit Property" : "Create New Property"}
            </h2>
            <p className="text-xs text-neutral-500">
              Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].title}
            </p>
          </div>
          <button
            onClick={handleAttemptClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-black/[0.05] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="px-6 py-3 border-b border-black/[0.05] bg-white shrink-0">
          <div className="flex items-center justify-between gap-1 overflow-x-auto scrollbar-none py-1">
            {STEPS.map((step) => {
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => isCompleted && setCurrentStep(step.id)}
                  disabled={!isCompleted && !isCurrent}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    isCurrent
                      ? "bg-neutral-900 text-white"
                      : isCompleted
                      ? "bg-emerald-50 text-emerald-700 cursor-pointer hover:bg-emerald-100"
                      : "text-neutral-400 bg-neutral-100 cursor-not-allowed"
                  }`}
                >
                  {isCompleted ? <FiCheck size={12} /> : <span>{step.id}</span>}
                  <span>{step.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Global Mutation Error Notification */}
        {(mutationError?.create || mutationError?.update || mutationError?.uploadImages || mutationError?.deleteImage) && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700 shrink-0">
            <FiAlertCircle size={16} className="shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Operation Failed: </span>
              <span>{mutationError.create || mutationError.update || mutationError.uploadImages || mutationError.deleteImage}</span>
            </div>
          </div>
        )}

        {/* Modal Scrollable Step Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          
          {/* STEP 1: BASIC INFO */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Property Title *</label>
                <input type="text" value={formData.title} onChange={(e) => updateField("title", e.target.value)} placeholder="e.g. Luxurious Sea-Facing Villa" className="w-full h-11 px-3.5 rounded-xl border border-black/[0.08] text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 bg-white" />
                {stepErrors.title && <p className="mt-1 text-xs text-red-500 font-medium">{stepErrors.title}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Category *</label>
                  <select value={formData.categoryId} onChange={(e) => updateField("categoryId", e.target.value)} className="w-full h-11 px-3.5 rounded-xl border border-black/[0.08] text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 cursor-pointer bg-white">
                    <option value="">Select Category</option>
                    {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                  {stepErrors.categoryId && <p className="mt-1 text-xs text-red-500 font-medium">{stepErrors.categoryId}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Price Per Night (₹) *</label>
                  <input type="number" min="1" step="0.01" value={formData.pricePerNight} onChange={(e) => updateField("pricePerNight", e.target.value)} placeholder="e.g. 4500" className="w-full h-11 px-3.5 rounded-xl border border-black/[0.08] text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 bg-white" />
                  {stepErrors.pricePerNight && <p className="mt-1 text-xs text-red-500 font-medium">{stepErrors.pricePerNight}</p>}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Description</label>
                <textarea rows={4} value={formData.description} onChange={(e) => updateField("description", e.target.value)} placeholder="Describe your property, features, vibe, and surroundings..." className="w-full p-3.5 rounded-xl border border-black/[0.08] text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 bg-white" />
              </div>
            </div>
          )}

          {/* STEP 2: LOCATION */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Street Address *</label>
                <input type="text" value={formData.address} onChange={(e) => updateField("address", e.target.value)} placeholder="e.g. 124 Beachfront Drive" className="w-full h-11 px-3.5 rounded-xl border border-black/[0.08] text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 bg-white" />
                {stepErrors.address && <p className="mt-1 text-xs text-red-500 font-medium">{stepErrors.address}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {["city", "state", "country"].map((field) => (
                  <div key={field}>
                    <label className="block text-xs font-medium text-neutral-700 mb-1 capitalize">{field} *</label>
                    <input type="text" value={formData[field]} onChange={(e) => updateField(field, e.target.value)} placeholder={`e.g. ${field === 'city' ? 'Goa' : field === 'state' ? 'Goa' : 'India'}`} className="w-full h-11 px-3.5 rounded-xl border border-black/[0.08] text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 bg-white" />
                    {stepErrors[field] && <p className="mt-1 text-xs text-red-500 font-medium">{stepErrors[field]}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: CAPACITY */}
          {currentStep === 3 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { key: "maxGuests", label: "Maximum Guests *", min: 1 },
                { key: "bedrooms", label: "Bedrooms *", min: 0 },
                { key: "bathrooms", label: "Bathrooms *", min: 0 },
              ].map(({ key, label, min }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">{label}</label>
                  <input type="number" min={min} value={formData[key]} onChange={(e) => updateField(key, Math.max(min, Number(e.target.value)))} className="w-full h-11 px-3.5 rounded-xl border border-black/[0.08] text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 bg-white" />
                  {stepErrors[key] && <p className="mt-1 text-xs text-red-500 font-medium">{stepErrors[key]}</p>}
                </div>
              ))}
            </div>
          )}

          {/* STEP 4: AMENITIES */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-2">Popular Amenities ({formData.amenities.length}/20 selected)</label>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_AMENITIES.map((amenity) => {
                    const isSelected = formData.amenities.includes(amenity);
                    return (
                      <button
                        type="button"
                        key={amenity}
                        onClick={() => toggleAmenity(amenity)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          isSelected ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                        }`}
                      >
                        {isSelected ? "✓ " : "+ "}
                        {amenity}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="pt-4 border-t border-black/[0.05] space-y-3">
                <label className="block text-xs font-medium text-neutral-700">Add Custom Amenity</label>
                <div className="flex gap-2 max-w-md items-center">
                  <input
                    type="text"
                    value={customAmenity}
                    onChange={(e) => setCustomAmenity(e.target.value)}
                    placeholder="e.g. Private Jacuzzi"
                    className="flex-1 h-11 px-3.5 rounded-xl border border-black/[0.08] text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 bg-white"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomAmenity();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addCustomAmenity}
                    disabled={!customAmenity.trim() || formData.amenities.length >= 20}
                    className="h-11 px-5 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-black disabled:opacity-30 cursor-pointer shrink-0 flex items-center justify-center"
                  >
                    Add
                  </button>
                </div>
                {formData.amenities.some((a) => !DEFAULT_AMENITIES.includes(a)) && (
                  <div className="space-y-2">
                    <p className="text-[11px] font-semibold text-neutral-500 uppercase">Added Amenities</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.amenities
                        .filter((a) => !DEFAULT_AMENITIES.includes(a))
                        .map((amenity) => (
                          <div key={amenity} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                            <span>{amenity}</span>
                            <button type="button" onClick={() => toggleAmenity(amenity)} className="hover:text-red-600 cursor-pointer">
                              <FiX size={12} />
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: IMAGES (PropertyImageManagerModal Integration) */}
          {currentStep === 5 && (
            <div className="space-y-6">
              {validationError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
                  <FiAlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* SUCCESS FEEDBACK BANNER */}
              {uploadSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-700 animate-in fade-in slide-in-from-top-2 duration-300">
                  <FiCheckCircle size={16} className="shrink-0 mt-0.5" />
                  <span>Images uploaded successfully and added to your gallery!</span>
                </div>
              )}

              {isEditMode ? (
                <>
                  {/* Section 1: Existing Uploaded Gallery */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                      Current Property Images ({existingImages.length}/10)
                    </h3>

                    {existingImages.length === 0 ? (
                      <div className="p-6 text-center border border-dashed border-neutral-200 rounded-xl bg-neutral-50">
                        <FiImage size={24} className="mx-auto text-neutral-400 mb-1" />
                        <p className="text-xs text-neutral-500">No images uploaded for this property yet.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {existingImages.map((imgItem, idx) => {
                          const src = getImageSrc(imgItem);
                          const imageId = getImageId(imgItem);
                          const isCurrentlyDeleting = isDeleting && deletingImageId === imageId;

                          return (
                            <div key={idx} className="relative rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 shadow-sm">
                              <div className="aspect-[4/3]">
                                <ImageWithLoader
                                  src={src || noImage}
                                  alt={`Property image ${idx + 1}`}
                                  variant="shimmer"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex items-center justify-between px-2 py-2 bg-white border-t border-neutral-100">
                                <span className="text-[10px] uppercase tracking-wide text-neutral-500">Image {idx + 1}</span>
                                <button
                                  onClick={() => handleDeleteImage(imageId)}
                                  disabled={!imageId || isCurrentlyDeleting || isUploading}
                                  className="flex items-center gap-1 px-2 py-1 rounded-md border border-neutral-200 text-neutral-600 hover:text-red-600 hover:border-red-200 transition text-[11px] font-medium disabled:opacity-40 cursor-pointer"
                                >
                                  {isCurrentlyDeleting ? <FiLoader size={12} className="animate-spin" /> : <FiTrash2 size={12} />}
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
                  {existingImages.length + selectedFiles.length < 10 && (
                    <div className="space-y-3 pt-4 border-t border-black/[0.05]">
                      <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">Upload New Photos</h3>
                      <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={`p-6 border-2 border-dashed rounded-2xl text-center transition-colors ${
                          dragActive ? "border-neutral-900 bg-neutral-100" : "border-neutral-300 bg-neutral-50/50 hover:bg-neutral-50"
                        }`}
                      >
                        <FiUploadCloud size={32} className="mx-auto text-neutral-400 mb-2" />
                        <p className="text-xs font-semibold text-neutral-900">Drag and drop image files here, or browse</p>
                        <p className="text-[11px] text-neutral-500 mt-0.5">Supported formats: JPG, PNG. Max file size: 3MB.</p>
                        <label className="inline-block mt-3 px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-semibold cursor-pointer hover:bg-black transition-colors">
                          Browse Files
                          <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                        </label>
                      </div>

                      {/* Upload Queue Preview */}
                      {selectedFiles.length > 0 && (
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-neutral-800">Files ready to upload ({selectedFiles.length})</span>
                            <button
                              onClick={handleUploadNewImages}
                              disabled={isUploading}
                              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-emerald-700 disabled:opacity-50 cursor-pointer shadow-xs"
                            >
                              {isUploading ? (
                                <><FiLoader size={14} className="animate-spin" /><span>Uploading...</span></>
                              ) : (
                                <><FiCheckCircle size={14} /><span>Upload Now</span></>
                              )}
                            </button>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {previewUrls.map((item, i) => (
                              <div key={`${item.file.name}-${item.file.size}-${i}`} className="relative aspect-[4/3] rounded-lg overflow-hidden border border-black/[0.08] bg-neutral-100">
                                <img src={item.url} alt={item.file.name} className="w-full h-full object-cover" />
                                <button
                                  onClick={() => removeFileFromQueue(i)}
                                  disabled={isUploading}
                                  className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-black transition-colors disabled:opacity-50 cursor-pointer"
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
                </>
              ) : (
                /* CREATE MODE: Simplified Queue (Uploaded on Publish) */
                <div className="space-y-4">
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`p-6 border-2 border-dashed rounded-2xl text-center transition-colors ${
                      dragActive ? "border-neutral-900 bg-neutral-100" : "border-neutral-300 bg-neutral-50/50 hover:bg-neutral-50"
                    }`}
                  >
                    <FiUploadCloud size={32} className="mx-auto text-neutral-400 mb-2" />
                    <p className="text-xs font-semibold text-neutral-900">Drag and drop image files here, or browse</p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">JPEG or PNG files. Up to 10 images total, maximum 3MB per image.</p>
                    <label className="inline-block mt-3 px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-semibold cursor-pointer hover:bg-black transition-colors">
                      Browse Files
                      <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                  </div>

                  {selectedFiles.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-neutral-800">Selected Files ({selectedFiles.length}/10) - Will be uploaded on publish</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {previewUrls.map((item, i) => (
                          <div key={`${item.file.name}-${item.file.size}-${i}`} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-black/[0.08] bg-neutral-100">
                            <img src={item.url} alt={item.file.name} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeFileFromQueue(i)}
                              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/95 text-red-600 shadow-md flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                            >
                              <FiX size={14} />
                            </button>
                            <span className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-black/60 text-[10px] text-white">
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
          )}

          {/* STEP 6: BOOKING SETTINGS */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-2">Booking Approval Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
                  <button
                    type="button"
                    onClick={() => updateField("bookingApprovalType", BOOKING_APPROVAL_TYPE.AUTO)}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-full min-h-[110px] ${
                      formData.bookingApprovalType === BOOKING_APPROVAL_TYPE.AUTO
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : "border-black/[0.08] bg-white text-neutral-900 hover:bg-neutral-50"
                    }`}
                  >
                    <span className="font-bold text-xs block">Automatic Approval (Instant)</span>
                    <span className="text-[11px] opacity-80 mt-1 block">Guest bookings are automatically confirmed upon payment.</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField("bookingApprovalType", BOOKING_APPROVAL_TYPE.MANUAL)}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-full min-h-[110px] ${
                      formData.bookingApprovalType === BOOKING_APPROVAL_TYPE.MANUAL
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : "border-black/[0.08] bg-white text-neutral-900 hover:bg-neutral-50"
                    }`}
                  >
                    <span className="font-bold text-xs block">Manual Host Approval</span>
                    <span className="text-[11px] opacity-80 mt-1 block">Host must review and manually accept each reservation request.</span>
                  </button>
                </div>
              </div>
              {isEditMode && (
                <div className="pt-3 border-t border-black/[0.05]">
                  <label className="block text-xs font-semibold text-neutral-800 mb-2">Property Status</label>
                  <select value={formData.status} onChange={(e) => updateField("status", e.target.value)} className="w-full h-11 px-3.5 rounded-xl border border-black/[0.08] text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 cursor-pointer bg-white">
                    <option value={PROPERTY_STATUS.AVAILABLE}>Available</option>
                    <option value={PROPERTY_STATUS.UNAVAILABLE}>Unavailable</option>
                    <option value={PROPERTY_STATUS.UNDER_MAINTENANCE}>Under Maintenance</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* STEP 7: REVIEW */}
          {currentStep === 7 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl border border-black/[0.08] bg-neutral-50/60 space-y-3">
                <h3 className="text-sm font-bold text-neutral-900 border-b border-black/[0.06] pb-2">Listing Summary</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <div>
                    <span className="text-neutral-400 block">Title</span>
                    <span className="font-semibold text-neutral-900">{formData.title}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">Price / Night</span>
                    <span className="font-bold text-neutral-900">₹{formData.pricePerNight}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">Location</span>
                    <span className="font-medium text-neutral-800">{[formData.city, formData.state, formData.country].filter(Boolean).join(", ")}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">Capacity</span>
                    <span className="font-medium text-neutral-800">{formData.maxGuests} Guests • {formData.bedrooms} Beds • {formData.bathrooms} Baths</span>
                  </div>
                </div>
                {formData.amenities.length > 0 && (
                  <div className="pt-2 border-t border-black/[0.05]">
                    <span className="text-neutral-400 text-xs block mb-1">Amenities</span>
                    <div className="flex flex-wrap gap-1.5">
                      {formData.amenities.map((a) => (
                        <span key={a} className="px-2 py-0.5 rounded bg-neutral-200 text-[10px] text-neutral-700 font-medium">{a}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-black/[0.08] bg-linear-to-t from-gray-200 to-gray-200 shrink-0">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1 || isSubmitting}
            className="inline-flex items-center gap-1 h-10 px-4 rounded-xl border border-black/[0.4] bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 cursor-pointer"
          >
            <FiChevronLeft size={16} />
            Back
          </button>
          {currentStep < STEPS.length ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1 h-10 px-5 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-black transition-colors cursor-pointer"
            >
              Next
              <FiChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 h-10 px-6 rounded-xl bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <FiCheckCircle size={15} />
              {isSubmitting ? "Saving..." : isEditMode ? "Save Changes" : "Publish Property"}
            </button>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Prompt */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 text-center shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <FiAlertCircle size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-neutral-900">Unsaved Changes</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">You have unsaved changes. Are you sure you want to discard your progress and exit?</p>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowCancelConfirm(false)} className="flex-1 h-10 rounded-xl border border-black/[0.08] text-xs font-semibold text-neutral-700 hover:bg-neutral-50 cursor-pointer">
                Keep Editing
              </button>
              <button onClick={handleConfirmClose} className="flex-1 h-10 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 cursor-pointer">
                Discard & Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyWizardModal;