import { Link } from "react-router-dom";
import { FiCompass, FiShield, FiHeart, FiMapPin, FiArrowRight } from "react-icons/fi";
import Navbar from "../components/landing/Navbar";
import BackButton from "../components/property/BackButton";
import heroImage from "../assets/img3.jpg";

const VALUES = [
  {
    icon: FiCompass,
    title: "Raw over polished",
    text: "We favor character over convention — spaces with a story, not a template. Every listing is chosen because it feels like somewhere, not anywhere.",
  },
  {
    icon: FiShield,
    title: "Trust, verified",
    text: "Every host is verified, every booking is protected, and every payment is secured end-to-end. Peace of mind isn't an add-on here — it's the foundation.",
  },
  {
    icon: FiHeart,
    title: "Hosting as craft",
    text: "The hosts on Escape Rentals aren't running a franchise. They're caregivers of a place they care about, and it shows in how they welcome you.",
  },
];

const AboutPage = () => {
  return (
    <>
      <Navbar />
      <div className="bg-white text-neutral-900">
        {/* Header */}
        <header className="max-w-5xl mx-auto px-4 py-3">
          <BackButton />
        </header>

        {/* Hero */}
        <section className="relative mx-auto w-full max-w-screen-2xl px-2 sm:px-4">
          <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden rounded-sm">
            <img
              src={heroImage}
              alt="A quiet, considered interior"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/45" />
            <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-6 text-white">
              <span className="mb-2 text-[11px] uppercase tracking-[0.3em] text-neutral-200">
                Our Story
              </span>
              <h1 className="text-2xl sm:text-4xl font-light leading-tight max-w-2xl">
                Raw spaces, <span className="font-semibold">elevated living.</span>
              </h1>
            </div>
          </div>
        </section>

        {/* Narrative */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20 space-y-6">
          <p className="text-lg sm:text-xl font-light leading-relaxed text-neutral-700">
            Escape Rentals — has grown from a simple broker agency into a 
            full-fledged property management company. 
            Since initial days we have accommodated not only 
            peoples but beautiful smiles, extraordinary 
            experiences and unforgettable memroies. 
            In 2007 when booking / renting a space was much tougher 
            than beating a dragon or swimming across pacific, Our 
            ambitions stood, Our team of just 3 people 
            began a journey that could not only 
            spare a space but let to truly live in.   
          </p>
          <p className="text-base leading-relaxed text-neutral-600">
            Select a space that describes the language one is looking for.
            Properties are listed by Host. And its more of a guesture that
            welcomes guests into a room that could be shared with. There are 
            thousands of properties ready to be booked all listed and mantained 
            by our wonderful dedicated self listed HOST and our team.
          </p>
        </section>

        {/* Divider */}
        <section className="relative h-7 md:h-10 overflow-hidden bg-white">
          <div className="absolute left-0 top-1/2 h-px w-full bg-zinc-400" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-5 text-[10px] md:text-[12px] uppercase tracking-[0.35em] text-neutral-400">
            What we stand for
          </div>
        </section>

        {/* Values */}
        <section className="max-w-6xl 
        mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {VALUES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="space-y-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-neutral-900 text-white">
                  <Icon size={18} />
                </div>
                <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
                <p className="text-sm leading-relaxed text-neutral-600">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-neutral-950 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center space-y-6">
            <FiMapPin size={22} className="mx-auto text-neutral-400" />
            <h2 className="text-2xl sm:text-3xl font-light">
              Ready to find <span className="font-semibold">somewhere, not anywhere?</span>
            </h2>
            <Link
              to="/properties"
              className="inline-flex items-center gap-2 rounded-sm bg-white px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] text-neutral-900 hover:bg-neutral-200 transition-colors"
            >
              Browse Properties
              <FiArrowRight size={14} />
            </Link>
          </div>
        </section>
      </div>
    </>
  );
};

export default AboutPage;
