
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import bgImage from "../../assets/img12.jpg";
import { FiSearch } from "react-icons/fi";

import {
  fetchCities,
  selectAllCities,
  selectCityStatus,
  selectCityError,
} from "../../redux/property/propertySlice";

import { useDispatch, useSelector } from "react-redux";

const Hero = () => {

  const [imageLoaded, setImageLoaded] = useState(false);
  const [destination, setDestination] = useState("");
  const [filteredSuggestions,setFilteredSuggestions] = useState([]);
  const [showSuggestions,setShowSuggestions] = useState(false);

  const cities = useSelector(selectAllCities);
  const status = useSelector(selectCityStatus);
  const error = useSelector(selectCityError);
  const dispatch = useDispatch();

  const navigate = useNavigate();
  const dropDownref = useRef(null);

  const handleSearch = (e) => {
    if(e) e.preventDefault();
    const params = destination.trim() ? `?city=${encodeURIComponent(destination.trim())}` : "";
    setShowSuggestions(false);
    navigate(`/properties${params}`);
  };


  useEffect(() => {
    const img = new Image();
    img.src = bgImage;
    img.onload = () => {
      setTimeout(() => setImageLoaded(true), 100);
    };
  }, []);

  useEffect(()=>{
    if(status==="idle") {
      dispatch(fetchCities());
    }
  },[dispatch,status]);

  const handleInputChange=(e)=>{
    const value = e.target.value;
    setDestination(value);
    if(value.trim().length>0) {
      const matches = cities.filter((city) => city.toLowerCase().includes(value.toLowerCase()));
      setFilteredSuggestions(matches);
      setShowSuggestions(true);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick= (cityName) => {
    setDestination(cityName);
    setShowSuggestions(false);
    const params = `?city=${encodeURIComponent(cityName.trim())}`;
    navigate(`/properties${params}`);
  };

  useEffect(()=>{
    const handleClickOutside = (event) => {
      if(dropDownref.current && !dropDownref.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown",handleClickOutside);
    return () => document.removeEventListener("mousedown",handleClickOutside);
  },[]);

  if(error) {
    return <p className="text-red-500 bg-red-200"> 
    Error Occured while fetching property 
    </p>
  }
  
  return (
    <div className="w-full px-2 py-2 sm:px-2 lg:px-6">
      <section
        className="
          relative 
          mx-auto
          w-full 
          max-w-screen-2xl 
    h-60
    md:h-96
    xl:h-[460px]
          overflow-hidden
          rounded-sm
          shadow-sm
          flex
          items-center
          justify-center
        "
      >
        <div className="absolute inset-0 bg-neutral-800" />

        <div
          className={`
            absolute 
            inset-0 
            bg-cover 
            bg-center 
            bg-no-repeat
            transition-all
            duration-1000
            ease-out
          ${imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"}`}
          style={{
            backgroundImage: `url(${bgImage})`,
          }}
          aria-hidden="true"
        />

        <div
          className="
            absolute 
            inset-0 
            bg-black/50
          "
          aria-hidden="true"
        />

        <div
          className="
            relative
            z-10
            flex
            w-full
            max-w-2xl
            flex-col
            items-center
            justify-center
            px-5
            text-center
            text-white
            sm:px-6
            md:px-8
          "
        >
          <span
            className="
            mb-2
            text-[11px]
            sm:text-xs
            md:text-sm
            tracking-[0.22em]
            uppercase
            text-neutral-200
            underline
            underline-offset-4
            "
          >
            Escape Rentals
          </span>

          <h1
            className="
              mb-5
              text-xl
              sm:text-2xl
              md:text-3xl
              lg:text-4xl
              font-light
              leading-tight
              tracking-tight
            "
          >
            Raw Spaces, <span className="font-semibold">Elevated living.</span>
          </h1>

          <div
          ref={dropDownref}
          className="relative w-full max-w-xs 
          sm:max-w-sm md:max-w-md mx-auto"
          >
            <form
            role="search"
            onSubmit={handleSearch}
            className="
            flex w-full md:w-sm items-center rounded-full
            border border-white/20 bg-white/95
            px-2 h-8 sm:h-10 shadow-lg shadow-black/10
            backdrop-blur-lg  gap-2"
          >
            <input
              type="search"
              value={destination}
              onChange={handleInputChange}
              onFocus={() => destination.trim().length > 0 && setShowSuggestions(true)}
              placeholder="Your Next City.."
              aria-label="Search destinations"
              className="flex-1 min-w-0 bg-transparent px-3
              text-sm sm:text-xs md:text-md text-neutral-800
              placeholder:text-neutral-600 outline-none
              [&::-webkit-search-cancel-button]:hidden"
            />

            {destination.trim().length > 0 && (
    <button
      type="button"
      onClick={() => {
        setDestination("");
        setFilteredSuggestions([]);
        setShowSuggestions(false);
      }}
      aria-label="Clear search"
      className="text-zinc-700
       hover:text-zinc-600 text-sm px-1 
       cursor-pointer transition-colors"
    >
      ✕
    </button>
  )}

            <button
              type="submit"
              aria-label="Search"
              className="flex h-7 w-7 sm:h-9 sm:w-9 shrink-0 
              items-center justify-center rounded-full 
              bg-neutral-900 text-white transition-all 
              duration-200 hover:bg-neutral-800 
              active:scale-95 cursor-pointer"
            >
              <FiSearch className="text-base" />
            </button>
          </form>

                    {
            showSuggestions && filteredSuggestions.length > 0 && (
              <ul
  className="
    absolute
    left-0
    right-0
    top-full
    mt-2
    z-50
    max-h-44
    overflow-y-auto
    rounded-2xl
    bg-white
    text-neutral-800
    shadow-2xl
    border
    border-neutral-200/60
    py-1
    text-left
    text-sm
  "
>
  {filteredSuggestions.map((city, index) => (
    <li
      key={index}
      onClick={() => handleSuggestionClick(city)}
      className="
        px-4
        py-2.5
        cursor-pointer
        transition-colors
        hover:bg-neutral-50
        active:bg-neutral-100
        border-b
        border-neutral-100/40
        last:border-b-0
      "
    >
      <span className="break-words text-xs sm:text-sm font-medium text-neutral-700">
        {city}
      </span>
    </li>
  ))}
</ul>

            )}

          </div>

        </div>
      </section>
    </div>
  );
};

export default Hero;
