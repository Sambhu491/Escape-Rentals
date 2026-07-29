import { useEffect, useState } from "react";

export default function Discover() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative h-7 md:h-10 
    overflow-hidden bg-white">

      <div
        className={`
          absolute left-0 top-1/2 h-px w-full
          bg-zinc-400
          origin-center
          transition-transform duration-700 ease-out
          ${loaded ? "scale-x-100" : "scale-x-0"}
        `}
      />

      <div
        className={`
          absolute left-1/2 top-1/2
          bg-white px-5
          text-[10px] md:text-[12px]
          uppercase tracking-[0.35em]
          text-neutral-400
          transition-all duration-700 ease-out
          ${
            loaded
              ? "-translate-x-1/2 -translate-y-1/2 opacity-100"
              : "-translate-x-1/2 translate-y-2 opacity-0"
          }
        `}
      >
        Discover
      </div>

    </section>
  );
}