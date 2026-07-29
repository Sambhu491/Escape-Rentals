import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  FiArrowLeft,
  FiArrowRight,
  FiStar,
  FiMapPin,
  FiUsers,
  FiHome,
  FiCalendar,
  FiShare2,
  FiHeart,
  FiCamera,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiImage,
  FiCheckCircle,
  FiClock,
  FiShield,
  FiAlertCircle,
  FiFlag,
} from "react-icons/fi";
import Navbar from "../components/landing/Navbar";
import BackButton from "../components/property/BackButton";
import ImageWithLoader from "../components/loading/ImageWithLoader/ImageWithLoader";
import {
  fetchPropertyById,
  clearSelectedProperty,
  selectSelectedProperty,
  selectPropertyFetchStatus,
  selectPropertyError,
  selectAllProperties,
  fetchProperties,
} from "../redux/property/propertySlice";
import noImage from "../assets/noImage.jpg";
import BookingModal from "../components/booking/BookingModal";
import PropertyCard from "../components/property/PropertyCard";
import PropertyReviews from "../components/property/PropertyReviews";
import PropertyComments from "../components/property/PropertyComments";
import AvailabilityModal from "../components/property/AvailabilityModal";
import ReportPropertyModal from "../components/property/ReportPropertyModal";
import ReportUserModal from "../components/user/ReportUserModal";
import { selectSavedPropertyIds, toggleSaveProperty } from "../redux/saved/savedSlice";

// Sub-Component: Minimalist Stat Item  (UNCHANGED)
const DetailItem = ({ icon, label, value }) => (
  <div className="flex flex-col gap-0.5">
    <div className="flex items-center gap-1.5 text-neutral-400">
      {icon}
      <span className="text-[9px] font-bold uppercase tracking-[0.15em]">
        {label}
      </span>
    </div>
    <div className="text-sm md:text-md font-semibold text-neutral-900 leading-tight">
      {value}
    </div>
  </div>
);

const statusClasses = {
  AVAILABLE: "bg-emerald-50 text-emerald-700",
  UNAVAILABLE: "bg-red-50 text-red-700",
  UNDER_MAINTENANCE: "bg-amber-50 text-amber-700",
};

// Helper: Cloudinary Optimization  (UNCHANGED)
const optimizeCloudinaryImage = (url, width = 1200, height = 1200) => {
  if (!url?.includes("/upload/")) return url;
  return url.replace(
    "/upload/",
    `/upload/f_auto,q_auto,w_${width},h_${height},c_fill/`,
  );
};

// Main Component
const PropertyDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const property = useSelector(selectSelectedProperty);
  const fetchStatus = useSelector(selectPropertyFetchStatus);
  const error = useSelector(selectPropertyError);
  const allProperties = useSelector(selectAllProperties);

  // 1. Get current logged-in user from Redux auth state
const currentUser = useSelector((state) => state.auth.user); // Adjust slice name if needed
const savedIds = useSelector(selectSavedPropertyIds);
const isSaved = savedIds.includes(property?.id);
const handleToggleSave = () => {
  if (!currentUser?.id || !property?.id) return;
  dispatch(toggleSaveProperty({ propertyId: property.id, isSaved }));
};

// 2. Determine host & availability states
const isHost = currentUser?.role === "ROLE_HOST";
const isOwnProperty = String(currentUser?.id) === String(property?.hostId || property?.host?.id);
const isPropertyAvailable = property?.status === "AVAILABLE";

// 3. Define allowed booking condition
const canBook = isPropertyAvailable && !isHost && !isOwnProperty;

// 4. Generate dynamic button label / status message
const getBookingButtonText = () => {
  if (isOwnProperty) return "Cannot Book Own Property";
  if (isHost) return "Hosts Cannot Book Properties";
  if (!isPropertyAvailable) return "Bookings Closed";
  return "Book Now";
};

  const [activeImage, setActiveImage] = useState(0);
  const scrollContainerRef = useRef(null);
  const [showBooking, setShowBooking] = useState(false);
  const [showAvailability, setShowAvailability] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReportHostModal, setShowReportHostModal] = useState(false);

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    if (id) {
      dispatch(fetchPropertyById(id));
      dispatch(fetchProperties({ page: 0, size: 6 }));
    }
    return () => {
      dispatch(clearSelectedProperty());
    };
  }, [dispatch, id]);


  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const newIndex = Math.round(container.scrollLeft / container.clientWidth);
    setActiveImage(newIndex);
  }, []);

  const scrollToImage = useCallback((index) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollTo({
      left: index * container.clientWidth,
      behavior: "smooth",
    });
    setActiveImage(index);
  }, []);

  const images = useMemo(() => {
    if (!property?.images?.length) return [noImage];
    return property.images.map((img) =>
      optimizeCloudinaryImage(img.imageUrl || img, 1200, 1200),
    );
  }, [property]);

  useEffect(() => {
  const handleKeyDown = (e) => {
    if (!isLightboxOpen) return;

    if (e.key === "ArrowRight") {
      setLightboxIndex((prev) =>
        prev < images.length - 1 ? prev + 1 : prev
      );
    }

    if (e.key === "ArrowLeft") {
      setLightboxIndex((prev) =>
        prev > 0 ? prev - 1 : prev
      );
    }

    if (e.key === "Escape") {
      setIsLightboxOpen(false);
    }
  };

  window.addEventListener("keydown", handleKeyDown);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, [isLightboxOpen, images.length]);


  const similarProperties = useMemo(() => {
    if (!Array.isArray(allProperties)) return [];
    return allProperties
      .filter((p) => String(p.id) !== String(id))
      .slice(0, 2);
  }, [allProperties, id]);

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const nextLightboxImage = (e) => {
    e.stopPropagation();
    if (lightboxIndex < images.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
  };

  const prevLightboxImage = (e) => {
    e.stopPropagation();
    if (lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    }
  };

  const checkAvailableAndBook = property?.status === "AVAILABLE";

  const handleShare = async () => {
    const shareData = {
      title: property.title,
      text: `Check out this property: ${property.title}`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Property link copied to clipboard.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ── Loading Skeleton  (UNCHANGED) ──
  if (fetchStatus.single === "loading") {
    return (
      <div className="min-h-screen bg-white animate-pulse">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="h-7 w-7 rounded-full bg-neutral-100" />
        </div>
        <div className="max-w-5xl mx-auto px-4">
          <div className="aspect-[21/9] rounded-xl bg-neutral-100" />
        </div>
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
          <div className="space-y-2 max-w-lg">
            <div className="h-6 w-3/4 bg-neutral-100 rounded-lg" />
            <div className="h-3 w-1/3 bg-neutral-100 rounded" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-neutral-100">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="h-2.5 w-12 bg-neutral-100 rounded" />
                <div className="h-4 w-8 bg-neutral-100 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Error State  (UNCHANGED) ──
  if (error || !property) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-xs">
          <div className="mx-auto w-12 h-16 rounded-full bg-neutral-50 flex items-center justify-center">
            <FiHome className="w-6 h-6 text-neutral-300" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-neutral-900">
              Property not found
            </h2>
            <p className="text-xs text-neutral-500 leading-relaxed">
              This listing may have been removed or is currently unavailable.
            </p>
          </div>
          <Link
            to="/properties"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-900 hover:text-neutral-600 transition-colors"
          >
            <FiArrowLeft className="w-3.5 h-3.5" />
            Back to properties
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white text-neutral-900 md:px-12 pb-12">
        {/* ═══════════ Header  (UNCHANGED) ═══════════ */}
        <header className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <BackButton />
          <div className="flex items-center gap-1">
            {currentUser && !isOwnProperty && (
              <button
                onClick={handleToggleSave}
                className="p-2 rounded-full cursor-pointer hover:text-neutral-600 transition"
                aria-label={isSaved ? "Remove from saved" : "Save this listing"}
                title={isSaved ? "Remove from saved" : "Save this listing"}
              >
                <FiHeart
                  size={17}
                  className={isSaved ? "fill-red-500 text-red-500" : ""}
                />
              </button>
            )}
            {currentUser && !isOwnProperty && (
              <button
                onClick={() => setShowReportModal(true)}
                className="p-2 rounded-full cursor-pointer hover:text-neutral-600 transition"
                aria-label="Report this listing"
                title="Report this listing"
              >
                <FiFlag size={16} />
              </button>
            )}
            <button
              onClick={handleShare}
              className="p-2 rounded-full cursor-pointer hover:text-neutral-600 transition"
            >
              <FiShare2 size={17} />
            </button>
          </div>
        </header>

        {/* ═══════════ Gallery Section  (UNCHANGED) ═══════════ */}
        <section className="max-w-5xl mx-auto relative group/gallery">
          {images.length > 0 && (
            <>
              <div className="hidden md:flex absolute bottom-4 left-4 z-20 items-center gap-1.5 rounded-md bg-white border border-neutral-300 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider shadow-sm text-neutral-700 select-none">
                <FiImage size={13} />
                {images.length} Photos
              </div>
              <button
                onClick={() => openLightbox(0)}
                className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 rounded-md bg-white border border-neutral-300 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider shadow-sm hover:bg-neutral-50 cursor-pointer select-none dynamic-button transition"
              >
                <FiCamera size={13} />
                Show all photos
              </button>
            </>
          )}

          {/* Desktop Grid Layout */}
          <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-1.5 h-[360px] rounded-sm overflow-hidden">
            <div
              className="col-span-2 row-span-2 cursor-pointer overflow-hidden relative group"
              onClick={() => openLightbox(0)}
            >
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition duration-200 z-10" />
              <ImageWithLoader
                src={images[0]}
                alt={property.title}
                variant="shimmer"
                className="w-full h-full object-cover transition duration-300 group-hover:scale-[1.02]"
                size="lg"
              />
            </div>
            {images.slice(1, 5).map((img, index) => (
              <div
                key={index}
                className="cursor-pointer overflow-hidden relative group"
                onClick={() => openLightbox(index + 1)}
              >
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition duration-200 z-10" />
                <ImageWithLoader
                  src={img}
                  alt={property.title}
                  variant="shimmer"
                  className="w-full h-full object-cover transition duration-300 group-hover:scale-[1.03]"
                />
              </div>
            ))}
          </div>

          {/* Mobile Slider */}
          <div className="md:hidden relative rounded-sm px-3 overflow-hidden bg-neutral-100 aspect-[4/3] group">
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none"
            >
              {images.map((img, index) => (
                <div
                  key={index}
                  className="shrink-0 w-full snap-center"
                  onClick={() => openLightbox(index)}
                >
                  <ImageWithLoader
                    src={img}
                    alt={property.title}
                    variant="shimmer"
                    className="w-full h-full aspect-[4/3] object-cover"
                  />
                </div>
              ))}
            </div>
            {images.length > 1 && (
              <div className="absolute top-3 right-6 z-20 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-medium text-white tracking-wide">
                {activeImage + 1} / {images.length}
              </div>
            )}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => scrollToImage(activeImage - 1)}
                  disabled={activeImage === 0}
                  className={`absolute left-5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-neutral-800 shadow-sm transition-opacity ${
                    activeImage === 0
                      ? "opacity-0 pointer-events-none"
                      : "opacity-100"
                  }`}
                >
                  <FiChevronLeft size={20} />
                </button>
                <button
                  onClick={() => scrollToImage(activeImage + 1)}
                  disabled={activeImage === images.length - 1}
                  className={`absolute right-5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-neutral-800 shadow-sm transition-opacity ${
                    activeImage === images.length - 1
                      ? "opacity-0 pointer-events-none"
                      : "opacity-100"
                  }`}
                >
                  <FiChevronRight size={20} />
                </button>
              </>
            )}
          </div>
        </section>

        {/* ═══════════ Structured Content Grid ═══════════ */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-8">
            {/* ──────── Main Content Details ──────── */}
            <div className="space-y-6">
              {/* Title & Metadata  (UNCHANGED) */}
              <div className="space-y-1.5">
                <h1 className="text-xl sm:text-2xl font-semibold tracking-tight leading-tight">
                  {property.title}
                </h1>
                <div className="flex flex-wrap gap-4 text-xs text-neutral-600">
                  <span className="flex gap-1 items-center">
                    <FiMapPin size={13} />
                    {[
                      property.address,
                      property.city,
                      property.state,
                      property.country,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                  <span className="flex items-center gap-1">
                    <FiStar size={13} className="fill-black" />
                    {property.averageRating
                      ? property.averageRating.toFixed(1)
                      : "New"}
                    {property.reviewCount > 0 && ` (${property.reviewCount})`}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-neutral-600 underline underline-offset-3">
                  {property.categoryName}
                </div>
              </div>

              {/* Core Statistics Bar  (UNCHANGED) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-neutral-300">
                <DetailItem
                  icon={<FiUsers size={15} />}
                  label="Guests"
                  value={`${property.maxGuests || 0} max`}
                />
                <DetailItem
                  icon={<FiHome size={15} />}
                  label="Bedrooms"
                  value={property.bedrooms || 0}
                />
                <DetailItem
                  icon={<FiHome size={15} />}
                  label="Bathrooms"
                  value={property.bathrooms || 0}
                />
                <DetailItem
                  icon={<FiCalendar size={15} />}
                  label="Status"
                  value={
                    <span
                      className={`${statusClasses[property.status] || "bg-neutral-100 text-neutral-600"}`}
                    >
                      {(property.status || "UNKNOWN").replaceAll("_", " ")}
                    </span>
                  }
                />
              </div>

              {/* Description Text  (UNCHANGED) */}
              <div className="space-y-2">
                <h2 className="text-base font-semibold">About this place</h2>
                <p className="text-neutral-600 leading-6 text-sm md:text-lg">
                  {property.description || "No description available."}
                </p>
              </div>

              {/* Amenities with FiCheckCircle  (UNCHANGED from last version) */}
              {property.amenities?.length > 0 && (
                <div className="space-y-2">
                  <h2 className="text-base font-semibold">Amenities</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {property.amenities.map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-neutral-100 border border-neutral-200 text-[11px] text-neutral-700 font-medium tracking-wide"
                      >
                        <FiCheckCircle
                          size={13}
                          className="text-emerald-600 shrink-0"
                        />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Host Card  (UNCHANGED from last version) */}
              {property.hostName && (
                <div className="border-t border-neutral-100 pt-4">
                  <div className="flex items-center justify-between gap-4 p-4 rounded border border-neutral-200 bg-neutral-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-neutral-900 text-white text-sm font-bold flex items-center justify-center shrink-0">
                        {property.hostName[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-neutral-900">
                            {property.hostName}
                          </p>
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            <FiCheckCircle size={9} />
                            Verified
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-400 uppercase tracking-wider mt-0.5">
                          Host
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1.5 text-[10px] font-medium text-neutral-500">
                        <FiShield size={13} className="text-neutral-400" />
                        <span className="hidden sm:inline">Protected</span>
                      </div>
                      {currentUser && !isOwnProperty && (
                        <button
                          onClick={() => setShowReportHostModal(true)}
                          className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                        >
                          Report
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <ReportUserModal
                userId={property.hostId || property.host?.id}
                userLabel="this host"
                open={showReportHostModal}
                onClose={() => setShowReportHostModal(false)}
              />

              {/* House Policies  (UNCHANGED from last version) */}
              <div className="border-t border-neutral-100 pt-4 space-y-3">
                <h2 className="text-base font-semibold">Things to know</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded border border-neutral-200 bg-white space-y-2">
                    <div className="flex items-center gap-1.5 text-neutral-800">
                      <FiClock size={14} />
                      <span className="text-[9px] font-bold uppercase tracking-[0.15em]">
                        House Rules
                      </span>
                    </div>
                    <ul className="space-y-1 text-[11px] text-neutral-500 leading-relaxed">
                      <li>• Check-in: 2:00 PM – 10:00 PM</li>
                      <li>• Checkout: 11:00 AM</li>
                      <li>• No smoking inside</li>
                    </ul>
                  </div>
                  <div className="p-3 rounded border border-neutral-200 bg-white space-y-2">
                    <div className="flex items-center gap-1.5 text-neutral-800">
                      <FiShield size={14} />
                      <span className="text-[9px] font-bold 
                      uppercase tracking-[0.15em]">
                        Safety
                      </span>
                    </div>
                    <ul className="space-y-1 text-[11px] text-neutral-500 leading-relaxed">
                      <li>• Smoke alarm installed</li>
                      <li>• Carbon monoxide alarm</li>
                      <li>• First aid kit on site</li>
                    </ul>
                  </div>
                  <div className="p-3 rounded border border-neutral-200 bg-white space-y-2">
                    <div className="flex items-center gap-1.5 text-neutral-800">
                      <FiAlertCircle size={14} />
                      <span className="text-[9px] font-bold uppercase tracking-[0.15em]">
                        Cancellation
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 leading-relaxed">
                      Free cancellation up to 48 hours before check-in.
                      Non-refundable after.
                    </p>
                  </div>
                </div>
              </div>

              {/* Guest Reviews Placeholder  (UNCHANGED from last version) */}
              <div className="border-t border-neutral-100 pt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <FiStar size={16} className="fill-black" />
                  <h2 className="text-base font-semibold">
                    {property.averageRating
                      ? property.averageRating.toFixed(1)
                      : "New Listing"}
                  </h2>
                  <span className="text-[11px] text-neutral-400">
                    ({property.reviewCount || 0} reviews)
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 uppercase tracking-wider -mt-1">
                  From guests who completed a stay here
                </p>
                <PropertyReviews propertyId={id} />
              </div>

              {/* Comments — open to any account, unlike reviews which require a
                  completed stay. Kept as its own section so the two stay visually
                  and semantically distinct (see badges rendered on each). */}
              <div className="border-t border-neutral-100 pt-4">
                <PropertyComments propertyId={id} isPropertyHost={isOwnProperty} />
              </div>

              {/*
                ✂️  "Where you'll be"  → MOVED to sidebar
                ✂️  "Similar Stays"    → MOVED to sidebar
              */}
            </div>

            {/* ──────── Sidebar ──────── */}
<aside className="lg:col-span-1 flex flex-col gap-4">

  {/* ── Where you'll be ── mobile: 1st · desktop: 2nd */}
  <div className="order-1 md:order-2 border border-neutral-300 rounded p-4 shadow-sm bg-white space-y-2">
    <h2 className="text-[11px] font-bold 
    uppercase tracking-[0.15em] text-neutral-800">
      Where you'll be
    </h2>
    <div className="p-4 rounded border border-neutral-200 bg-neutral-100 text-center space-y-1.5 min-h-[110px] flex flex-col items-center justify-center">
      <FiMapPin size={20} className="text-neutral-500" />
      <p className="text-[11px] font-semibold text-neutral-800 leading-snug">
        {[
          property.address,
          property.city,
          property.state,
          property.country,
        ]
          .filter(Boolean)
          .join(", ")}
      </p>
      <p className="text-[9px] 
      text-neutral-600 uppercase tracking-wider">
        Exact location shared after booking
      </p>
    </div>
  </div>

  {/* ── Similar Stays ── mobile: 2nd · desktop: 3rd */}
  {similarProperties.length > 0 && (
    <div className="order-2 md:order-3 border border-neutral-300 rounded p-4 shadow-sm bg-white space-y-3">
      <h2 className="text-[11px] 
      font-bold uppercase 
      tracking-[0.15em] text-neutral-800">
        Similar stays
      </h2>
      <div className="space-y-3">
        {similarProperties.map((simProp) => (
          <PropertyCard key={simProp.id} property={simProp} />
        ))}
      </div>
    </div>
  )}

  {/* ── Booking Card ── mobile: LAST · desktop: FIRST */}
{/* ── Booking Card ── mobile: LAST · desktop: FIRST */}
<div className="order-3 md:order-1 border border-neutral-300 rounded p-4 shadow-sm bg-white">
  <div className="flex items-baseline gap-1 mb-4">
    <span className="text-xl font-bold tracking-tight text-neutral-900">
      ₹{" "}
      {property.pricePerNight
        ? property.pricePerNight.toLocaleString("en-IN")
        : "0"}
    </span>
    <span className="text-xs text-neutral-500 font-medium">
      / night
    </span>
  </div>

  <div className="space-y-2">
    <button
      disabled={!canBook}
      onClick={() => setShowBooking(true)}
      className={`w-full py-2.5 rounded-sm text-[11px] font-bold uppercase tracking-wider transition-all duration-200 shadow-sm ${
        canBook
          ? "bg-neutral-900 text-white hover:bg-black active:scale-[0.98] cursor-pointer"
          : "bg-neutral-200 text-neutral-400 cursor-not-allowed shadow-none"
      }`}
    >
      {getBookingButtonText()}
    </button>

    {canBook && (
      <button
        onClick={() => setShowAvailability(true)}
        className="w-full py-2 rounded-sm text-[11px] font-semibold text-neutral-600 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
      >
        Check Availability
      </button>
    )}

    {/* Informational messaging for Host users */}
    {isHost && (
      <p className="text-[11px] md:text-[12px] text-amber-700 bg-amber-50 p-2 rounded border border-amber-200 leading-tight">
        {isOwnProperty
          ? "You are viewing your own property listing."
          : "Host accounts cannot place bookings. Please register as a User account."}
      </p>
    )}
  </div>

  <BookingModal
    open={showBooking}
    onClose={() => setShowBooking(false)}
    property={property}
  />

  <AvailabilityModal
    propertyId={property.id}
    open={showAvailability}
    onClose={() => setShowAvailability(false)}
  />

  <ReportPropertyModal
    propertyId={property.id}
    open={showReportModal}
    onClose={() => setShowReportModal(false)}
  />
</div>
</aside>
          </div>
        </section>
      </div>

      {/* ═══════════ FULL SCREEN LIGHTBOX  (UNCHANGED) ═══════════ */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-linear-to-b from-gray-100 to-gray-300 flex flex-col animate-fadeIn"
          onClick={() => setIsLightboxOpen(false)}
        >
          <header className="h-16 border-b border-neutral-400 flex items-center justify-between px-5 md:px-8 shrink-0">
            <div className="flex items-center gap-2">
              <FiImage size={16} className="text-neutral-500" />
              <span className="text-sm font-medium text-neutral-800">
                {lightboxIndex + 1} / {images.length} Photos
              </span>
            </div>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="h-10 w-10 rounded-full border border-neutral-500 flex items-center justify-center hover:bg-neutral-100 transition cursor-pointer"
            >
              <FiX size={18} />
            </button>
          </header>

          <div
            className="relative flex-1 flex items-center justify-center px-6 md:px-16 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {images.length > 1 && (
              <button
                disabled={lightboxIndex === 0}
                onClick={prevLightboxImage}
                className="absolute left-6 md:left-10 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full border border-zinc-600 bg-white shadow-sm hover:bg-neutral-100 transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              >
                <FiChevronLeft size={20} className="mx-auto" />
              </button>
            )}

            <img
              src={images[lightboxIndex]}
              alt={`${property.title}`}
              className="max-w-full max-h-[78vh] object-contain select-none animate-fadeIn"
            />

            {images.length > 1 && (
              <button
                disabled={lightboxIndex === images.length - 1}
                onClick={nextLightboxImage}
                className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full border border-zinc-600 bg-white shadow-sm hover:bg-neutral-100 transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              >
                <FiChevronRight size={20} className="mx-auto" />
              </button>
            )}
          </div>

          {images.length > 0 && (
            <footer className="shrink-0 border-t border-neutral-500 py-5 px-6">
              <div className="flex justify-center gap-3 overflow-x-auto scrollbar-none">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxIndex(index);
                    }}
                    className={`shrink-0 h-16 w-24 overflow-hidden rounded-md border transition-all ${
                      lightboxIndex === index
                        ? "border-neutral-900 ring-1 ring-neutral-900"
                        : "border-neutral-200 hover:border-neutral-400"
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </footer>
          )}
        </div>
      )}
    </>
  );
};

export default PropertyDetailPage;