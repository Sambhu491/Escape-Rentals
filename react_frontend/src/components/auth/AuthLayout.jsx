
import { useState } from "react";
import { MdStar } from "react-icons/md";
import BackButton from "../property/BackButton";

export default function AuthLayout({
    img,
    children,
    formTopLabel,
    formHeading,
    formHeadingHighlight,
    heroSubLabel = "Premium stays",
}) {

    const [loaded, setLoaded] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="grid min-h-screen md:grid-cols-5">
        
    {/* ================= LEFT HERO ================= */}
<div className="hidden md:col-span-2 
lg:col-span-3 md:flex relative overflow-hidden">

 {!loaded && (
            <div className="absolute inset-0 
            bg-neutral-800 animate-pulse" />
          )}

  <img
    src={img}
    alt="Hero background"
    loading="eager"
    fetchPriority="high"
    onLoad={() => setLoaded(true)}
    className={`
              absolute
              inset-0
              h-full
              w-full
              object-cover
              scale-105
              transition-opacity
              duration-700
              ${loaded ? "opacity-100" : "opacity-0"}
            `}
  />
  <div className="absolute inset-0 bg-black/50" />

  <div className="relative z-10 flex flex-col justify-between p-14 text-white">
    
    {/* Grouped Header: Logo + SubLabel */}
    <div className="space-y-3">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-sm bg-white text-black flex items-center justify-center font-bold text-lg">
          E
        </div>
        <h1 className="text-xl font-semibold border-b border-amber-200">
          Escape Rentals
        </h1>
      </div>

      {/* Sub Label directly below */}
      <p className="text-xs uppercase tracking-[0.3em] 
      text-white/70">
        {heroSubLabel}
      </p>
    </div>

    {/* Review Badge */}
    <div className="rounded-xl 
    bg-white/10 backdrop-blur-md 
    border border-white/60 px-6 py-1 w-fit">
        <div className="flex gap-1 text-yellow-400"> 
            {[...Array(5)].map((_,index)=> 
            <MdStar key={index} size={20}/> )} 
        </div>
      <p className="text-sm mt-1 text-white/80">
        Loved by travelers
      </p>
    </div>
    
  </div>
</div>

        {/* ================= FORM SIDE ================= */}
        <div className="md:col-span-3 lg:col-span-2 
        flex items-center justify-center 
        px-6 py-6 bg-linear-to-b from-white 
        via-gray-100 to-gray-200">
          <div className="w-full max-w-md rounded-sm 
          bg-white shadow-md shadow-zinc-500 p-6">
            
            <BackButton/>

            {/* Form Header */}
            <div className="text-center mb-3">
              <span className="text-[10px] uppercase 
              tracking-[0.3em] text-neutral-500 
              font-semibold ">
                {formTopLabel}
              </span>
              <h1 className="mt-1 text-3xl font-light">
                {formHeading}
                <span className="font-semibold block">
                    {formHeadingHighlight}
                </span>
              </h1>
            </div>

            {/* Injected Form Content */}
            {children}

          </div>
        </div>
      </div>
    </div>
  );
}