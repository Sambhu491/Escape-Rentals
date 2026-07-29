import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import LoadingPage from "../loading/LoadingPage/LoadingPage";

import {
  fetchCities,
  selectAllCities,
  selectCityStatus,
  selectCityError,
} from "../../redux/property/propertySlice";

const CityNavigation = ({selectedCity,onCityChange}) => {
  const dispatch = useDispatch();

  const cities = useSelector(selectAllCities);
  const status = useSelector(selectCityStatus);
  const error = useSelector(selectCityError);

  const scrollRef = useRef(null);

  const scrollLeft = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: -scrollRef.current.clientWidth * 0.7,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: scrollRef.current.clientWidth * 0.7,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchCities());
    }
  }, [dispatch, status]);

  const handlePropertyClick = (city) => {
    onCityChange(city);
  };

  const handleAllClick = () => {
    onCityChange("all");
  };

  if (status === "loading") {
    return (
      <section className="w-full py-6">
        <div className="flex justify-center">
          <LoadingPage
            variant="dots"
            size="xs"
            color="bg-slate-700"
            spinnerColor="red"
          />
        </div>
      </section>
    );
  }

  if (status === "failed") {
    return <section className="py-4 text-center text-red-500">{error}</section>;
  }


  return (
    <section className="w-full bg-white border-b border-gray-200">
      {/* Outer wrapper controls max width and centers the content block */}
      <div className="relative mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-12 flex items-center">
        
        {/* Left Chevron Button */}
        <button
          onClick={scrollLeft}
          className="
            absolute left-2 md:left-2 top-1/2 
            -translate-y-1/2 z-10
            hidden md:flex h-8 w-8
            items-center justify-center
            rounded-full bg-gray-50 border border-blue-500
            cursor-pointer transition duration-200
            focus:outline-none hover:bg-white
          "
          aria-label="Scroll Left"
        >
          <FiChevronLeft size={18} className="text-gray-600" />
        </button>

        {/* Right Chevron Button */}
        <button
          onClick={scrollRight}
          className="
            absolute right-2 md:right-2 top-1/2 -translate-y-1/2 
            z-10 hidden md:flex h-8 w-8 
            items-center justify-center
            rounded-full bg-gray-50 border border-blue-500
            cursor-pointer transition duration-200
            focus:outline-none hover:bg-white
          "
          aria-label="Scroll Right"
        >
          <FiChevronRight size={18} className="text-gray-600" />
        </button>

        {/* Scrollable Items Container */}
        <div
          ref={scrollRef}
          className="w-full md:px-10 flex items-center gap-8 overflow-x-auto
            no-scrollbar scroll-smooth whitespace-nowrap py-3"
        >
          {/* "All" Button */}
          <button
            onClick={handleAllClick}
            className={`flex flex-col items-center justify-center flex-shrink-0
              min-w-[50px] cursor-pointer border-b-2 font-medium text-sm
              transition duration-200 focus:outline-none
              ${
                selectedCity === "all"
                  ? "border-gray-900 text-gray-900 font-semibold"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
          >
            <span>All</span>
          </button>

          {/* Dynamic Property/City Buttons */}
          {cities.map((city,id) => (
            <button
              key={id}
              onClick={() => handlePropertyClick(city)}
              className={`flex-shrink-0 border-b-2 cursor-pointer lg:mr-3
                text-sm font-medium transition-all focus:outline-none
                ${
                  selectedCity === city
                    ? "border-gray-900 text-gray-900 font-semibold"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
            >
              <span className="block truncate max-w-[120px]">
                {city}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CityNavigation;