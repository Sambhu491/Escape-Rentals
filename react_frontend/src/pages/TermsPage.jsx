import React, { useEffect, useState } from 'react';
import Navbar from "../components/landing/Navbar";
import BackButton from "../components/property/BackButton";
import { contactItems } from "../dataFile/footerData";

const SECTIONS = [
  {
    id: "acceptance",
    title: "Acceptance of terms",
    body: (
      <p>By creating an account or using Escape Rentals, you agree to these terms. If you're booking a stay, you're the "guest"; if you're listing a property, you're the "host." Some accounts hold both roles at different times, never simultaneously on the same booking.</p>
    ),
  },
  {
    id: "bookings",
    title: "Bookings & payments",
    body: (
      <>
        <p>A booking request is either confirmed automatically or requires the host's approval, depending on the property's settings. Once approved, payment is due within the window shown at checkout — unpaid requests expire automatically and release the dates.</p>
        <p>All payments are processed securely through Razorpay in Indian Rupees (INR). A confirmed, paid booking is a binding reservation between guest and host.</p>
      </>
    ),
  },
  {
    id: "cancellation",
    title: "Cancellation policy",
    body: (
      <>
        <p>Guests may cancel a reservation any time before the check-in date. Cancelling a paid booking triggers a refund back through Razorpay. Cancellations are not possible once the check-in date has passed.</p>
        <p>Hosts may decline a pending request before approval, or cancel an already-confirmed reservation when genuinely necessary — in which case any payment already made is refunded to the guest in full.</p>
      </>
    ),
  },
  {
    id: "hosts",
    title: "Host responsibilities",
    body: (
      <p>Hosts are responsible for the accuracy of their listings — description, pricing, amenities, and photos — and for honoring confirmed reservations. Listings found to be materially misleading may be reported and reviewed by our team.</p>
    ),
  },
  {
    id: "conduct",
    title: "Prohibited conduct",
    body: (
      <p>Fraudulent bookings, harassment of hosts or guests, circumventing the platform's payment system, and posting false reviews or reports are all grounds for account suspension.</p>
    ),
  },
  {
    id: "liability",
    title: "Limitation of liability",
    body: (
      <p>Escape Rentals connects independent hosts with guests; we are not the owner or operator of any listed property. We work to verify hosts and secure payments, but the condition and conduct of an individual stay remains between guest and host.</p>
    ),
  },
  {
    id: "contact",
    title: "Questions",
    body: (
      <p>
        Reach us at{" "}
        <a href={contactItems[0].href} className="font-semibold text-neutral-900 border-b border-neutral-300 hover:border-neutral-900 transition-colors">
          {contactItems[0].text}
        </a>{" "}
        for anything not covered here.
      </p>
    ),
  },
];

const TermsPage = () => {
  const [activeSection, setActiveSection] = useState(SECTIONS[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-15% 0px -75% 0px' }
    );

    SECTIONS.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#FCFCFC] text-neutral-900 selection:bg-neutral-900 selection:text-white antialiased">
        
        {/* Header Section */}
        <header className="max-w-7xl mx-auto px-6 md:px-12 pt-6 pb-12">
          <div className="mb-8">
            <BackButton />
          </div>
          
          <div className="max-w-4xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-light tracking-tight text-neutral-900 leading-none">
              Terms of Service
            </h1>
            
            <div className="mt-6 flex items-center gap-3">
              <div className="h-px w-8 bg-neutral-300"></div>
              <p className="text-[10px] text-neutral-400 font-medium tracking-widest uppercase">
                Last Updated {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>
        </header>

        {/* Main Content Grid */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
            
            {/* Sticky Sidebar Navigation */}
            <nav className="md:col-span-3 hidden md:block">
              <div className="sticky top-24">
                <span className="block text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-semibold mb-4">
                  Contents
                </span>
                <ul className="space-y-0.5 border-l border-neutral-200">
                  {SECTIONS.map((s) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className={`block pl-4 py-1.5 text-[13px] font-medium transition-all duration-200 -ml-px border-l ${
                          activeSection === s.id
                            ? 'border-neutral-900 text-neutral-900 font-semibold'
                            : 'border-transparent text-neutral-400 hover:text-neutral-700 hover:border-neutral-300'
                        }`}
                      >
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>

            {/* Content Area */}
            <article className="md:col-span-8 xl:col-span-7 max-w-2xl">
              <div className="space-y-12 md:space-y-16">
                {SECTIONS.map((s, index) => (
                  <div 
                    key={s.id} 
                    id={s.id} 
                    className="scroll-mt-24"
                  >
                    {/* Section Header */}
                    <div className="flex items-baseline gap-4 mb-4">
                      <span className="text-xs font-mono text-neutral-300 font-medium tracking-wider">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <h2 className="text-2xl md:text-3xl font-serif font-normal text-neutral-900 tracking-tight leading-tight">
                        {s.title}
                      </h2>
                    </div>
                    
                    {/* Section Body */}
                    <div className="text-[14px] leading-[1.8] text-neutral-600 space-y-4 md:pl-8">
                      {s.body}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>
        
        {/* End Mark */}
        <footer className="max-w-7xl mx-auto px-6 md:px-12 pb-12">
           <div className="h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent"></div>
           <p className="text-center text-[9px] text-neutral-400 mt-6 tracking-[0.2em] uppercase">End of document</p>
        </footer>
      </div>
    </>
  );
};

export default TermsPage;