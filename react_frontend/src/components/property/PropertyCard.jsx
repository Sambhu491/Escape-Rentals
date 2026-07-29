import { Link, useLocation  } from "react-router-dom";
import { FiMapPin, FiStar, FiHeart } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import ImageWithLoader from "../loading/ImageWithLoader/ImageWithLoader";
import noImage from "../../assets/noImage.jpg";
import { selectSavedPropertyIds, toggleSaveProperty } from "../../redux/saved/savedSlice";

const PropertyCard = ({ property }) => {

  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const savedIds = useSelector(selectSavedPropertyIds);
  const isSaved = savedIds.includes(property.id);

  const handleToggleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user?.id) return;
    dispatch(toggleSaveProperty({ propertyId: property.id, isSaved }));
  };

  const optimizeCloudinaryImage = (url, width = 700, height = 500) => {
    if (!url?.includes("/upload/")) return url;

    return url.replace(
      "/upload/",
      `/upload/f_auto,q_auto,w_${width},h_${height},c_fill/`,
    );
  };

  const image =
    property.images?.length > 0
      ? optimizeCloudinaryImage(
          property.images[0].imageUrl || property.images[0],
        )
      : noImage;

  return (
    <article
      className="
        group
        flex
        flex-col
      "
    >
      <Link
        to={`/properties/${property.id}`}
        state={{
          from: location.pathname + location.search,
        }}
        className="relative overflow-hidden bg-neutral-100"
      >
        <ImageWithLoader
          src={image}
          alt={property.title}
          variant="shimmer"
          className="
            aspect-[4/3]
            w-full
            object-cover
          "
        />

        {user?.id && (
          <button
            onClick={handleToggleSave}
            aria-label={isSaved ? "Remove from saved" : "Save property"}
            className="
              absolute
              top-3
              left-3
              flex
              items-center
              justify-center
              h-8
              w-8
              rounded-full
              bg-white/95
              backdrop-blur-sm
              shadow-sm
              cursor-pointer
              transition-transform
              active:scale-90
            "
          >
            <FiHeart
              size={15}
              className={isSaved ? "fill-red-500 text-red-500" : "text-neutral-700"}
            />
          </button>
        )}

        <div
          className="
            absolute
            top-3
            right-3
            flex
            items-center
            gap-1
            rounded-full
            bg-white/95
            backdrop-blur-sm
            px-2.5
            py-1
            text-xs
            font-medium
            shadow-sm
          "
        >
          <FiStar size={12} className="fill-amber-400 text-amber-400" />

          <span>
            {property.averageRating ? property.averageRating.toFixed(1) : "New"}
          </span>
        </div>
      </Link>

      <div className="mt-1 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="flex-1 break-words text-[15px] font-semibold text-neutral-900 min-w-0">
            <Link
              to={`/properties/${property.id}`}
              state={{
                from: location.pathname + location.search,
              }}
              className="hover:text-neutral-700 
                      inline-block transition-colors"
            >
              {property.title}
            </Link>
          </h3>

          <p className="pt-0.5 text-sm text-neutral-900 shrink-0 whitespace-nowrap">
            <span className="font-semibold">₹{property.pricePerNight}</span> /
            <span className="text-neutral-500">night</span>
          </p>
        </div>

        <div className="flex items-center gap-1 text-sm text-neutral-500">
          <FiMapPin size={14} className="shrink-0" />
          <span className="break-words">
            {property.city}, {property.country}
          </span>
        </div>
      </div>
    </article>
  );
};

export default PropertyCard;
