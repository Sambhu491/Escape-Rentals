import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FiMapPin } from "react-icons/fi";
import noImage from "../../assets/noImage.jpg";
import ImageWithLoader from "../loading/ImageWithLoader/ImageWithLoader";
import { BsHouseSlash } from "react-icons/bs";

import {
  fetchProperties,
  selectAllProperties,
  searchPropertiesAsync,
  selectPropertyFetchStatus,
} from "../../redux/property/propertySlice";

const FeaturedProperties = ({ selectedCategory, selectedCity, onResetFilter }) => {
  const dispatch = useDispatch();

  const properties = useSelector(selectAllProperties);
  const fetchStatus = useSelector(selectPropertyFetchStatus);
  const status = fetchStatus.search;

  useEffect(() => {
    const params = {
      page: 0,
      size: 8,
    };

    if (selectedCategory != "all") {
      params.categoryId = selectedCategory;
    }

    if (selectedCity != "all") {
      params.city = selectedCity;
    }

    if (selectedCategory === "all" && selectedCity === "all") {
      dispatch(searchPropertiesAsync(params));
    } else {
      dispatch(searchPropertiesAsync(params));
    }
  }, [dispatch, selectedCategory, selectedCity]);

  const featured = properties.slice(0, 8);

  const optimizeCloudinaryImage = (url, width = 700, height = 500) => {
    if (!url?.includes("/upload/")) return url;
    return url.replace(
      "/upload/",
      `/upload/f_auto,q_auto,w_${width},h_${height},c_fill/`,
    );
  };


  // Minimalist Skeleton Loading UI
  if (status === "loading") {
    return (
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4 max-w-sm mb-16">
            <div className="h-3 w-24 bg-neutral-200 rounded-sm" />
            <div className="h-8 w-64 bg-neutral-200 rounded-sm" />
          </div>
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="space-y-4">
                <div className="animate-pulse bg-neutral-200 h-64 sm:h-72 w-full rounded-sm" />
                <div className="h-4 bg-neutral-200 rounded-sm w-3/4" />
                <div className="h-3 bg-neutral-200 rounded-sm w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (status === "succeeded" && properties.length === 0) {
    return (
      <section className="bg-linear-to-b from-white 
      to-gray-200 py-20">
        <div className="mx-auto max-w-screen-2xl px-4 flex flex-col items-center justify-center text-center">
          <div
            className="
          w-16 h-16 rounded-full
          bg-neutral-200
          flex items-center justify-center
          text-2xl
          mb-2
        "
          >
            <BsHouseSlash size={25}/>
          </div>

          <h3
            className="
          text-xl 
          font-semibold 
          text-neutral-900
        "
          >
            No properties found
          </h3>

          <p
            className="
          mt-2 
          max-w-md
          text-sm
          text-neutral-700
        "
          >
            Sorry, there's no{" "}
            {selectedCategory !== "all"
              ? "properties listed for this category"
              : "properties"}{" "}
              in{" "}
            {selectedCity !== "all" ? selectedCity : "this location"}.
          </p>

          <p
            className="
          mt-1
          text-sm
          text-neutral-500
        "
          >
            Try selecting another category or city.
          </p>

          <button
          onClick={onResetFilter}
          className="cursor-pointer underline underline-offset-2
          bg-amber-200 px-1 mt-3"
          >
            Reset
          </button>

        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-8 sm:py-6">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 md:px-8">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-neutral-900">
            Featured <span className="font-semibold">Properties.</span>
          </h2>

          <Link
            to="/properties"
            className="hidden text-xs font-semibold tracking-wider 
            uppercase text-neutral-900 hover:text-neutral-600 
            transition-colors duration-200 md:block 
            underline underline-offset-4 bg-zinc-200"
          >
            View All Properties
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {featured.map((property) => (
            <article key={property.id} className="group flex flex-col">
              <Link to={`/properties/${property.id}`} className="block">
                <div className="overflow-hidden rounded-sm bg-neutral-100">
                  <ImageWithLoader
                    src={
                      optimizeCloudinaryImage(property.images[0].imageUrl, 700, 500) ||
                      noImage
                    }
                    alt={property.title}
                    className="h-44 sm:h-48 md:h-56 w-full 
                    object-cover object-center brightness-[0.98]
                    transition duration-300
                    hover:brightness-85"
                    variant="shimmer"
                    size="md"
                  />
                </div>
              </Link>

              <div className="mt-1 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="flex-1 break-words text-[15px] font-semibold text-neutral-900 min-w-0">
                    <Link
                      to={`/properties/${property.id}`}
                      className="hover:text-neutral-700 
                      inline-block transition-colors"
                    >
                      {property.title}
                    </Link>
                  </h3>

                  <p className="pt-0.5 text-sm text-neutral-900 shrink-0 whitespace-nowrap">
                    <span className="font-semibold">
                      ₹{property.pricePerNight}
                    </span>{" "}
                    /<span className="text-neutral-500">night</span>
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
          ))}
        </div>

        <div className="mt-12 flex justify-center md:hidden">
          <Link
            to="/properties"
            className="text-xs font-semibold tracking-wider 
            uppercase text-neutral-900 hover:text-neutral-600 
            transition-colors duration-200 bg-zinc-200
            underline underline-offset-4"
          >
            View All Properties
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
