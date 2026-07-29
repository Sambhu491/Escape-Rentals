import React, { useEffect, useState } from 'react';
import Navbar from "../components/landing/Navbar";
import BackButton from "../components/property/BackButton";
import { contactItems } from "../dataFile/footerData";

const SECTIONS = [
  {
    id: "collect",
    title: "Information we collect",
    body: (
      <>
        <p>When you create an account, we collect your name, email address, phone number, and password (stored securely, never in plain text). When you book or host a property, we collect the details necessary to complete that transaction — dates, guest counts, listing information, and payment metadata.</p>
        <p>We use Cloudinary to host property images you or a host upload, and Razorpay to process payments. We never store your full card or bank details ourselves — that's handled entirely by Razorpay's secure infrastructure.</p>
      </>
    ),
  },
  {
    id: "use",
    title: "How we use it",
    body: (
      <>
        <p>Your information is used to operate the core of the service: creating and verifying your account, processing bookings and payments, connecting guests with hosts, and sending transactional emails (OTP verification, booking confirmations, payment receipts, and status updates).</p>
        <p>We do not sell your personal data to third parties.</p>
      </>
    ),
  },
  {
    id: "sharing",
    title: "What we share, and with whom",
    body: (
      <>
        <p>A host sees a guest's name, phone number, and email once a booking is made, so the stay can be coordinated. A guest sees a host's name and property details. Payment processing is handled by Razorpay under their own privacy and security practices.</p>
      </>
    ),
  },
  {
    id: "security",
    title: "Security",
    body: (
      <p>Accounts are protected with hashed passwords and OTP-verified email addresses. Sessions are authenticated with signed, time-limited tokens. Payments are verified through Razorpay's signature-verification flow before any booking is confirmed.</p>
    ),
  },
  {
    id: "rights",
    title: "Your rights",
    body: (
      <p>You can review and update your profile information at any time from your account settings, and you can request deletion of your account. Deleting your account removes your profile from active use; records tied to completed transactions may be retained where required for financial or legal record-keeping.</p>
    ),
  },
  {
    id: "contact",
    title: "Contact us",
    body: (
      <p>
        Questions about this policy can be sent to{" "}
        <a href={contactItems[0].href} className="font-semibold text-neutral-900 border-b border-neutral-300 hover:border-neutral-900 transition-colors">
          {contactItems[0].text}
        </a>.
      </p>
    ),
  },
];

const LegalPageShell = ({ title, sections }) => {
  const [activeSection, setActiveSection] = useState(sections[0]?.id);

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

    sections.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#FCFCFC] 
      text-neutral-900 selection:bg-neutral-900 
      selection:text-white antialiased">
        
        {/* Header Section */}
        <header className="max-w-7xl mx-auto px-6 
        md:px-12 pt-6 pb-10">
          <div className="mb-8">
            <BackButton />
          </div>
          
          <div className="max-w-4xl">
      
            <h1 className="text-4xl sm:text-5xl md:text-5xl font-serif font-light tracking-tight text-neutral-900 leading-none">
              {title}
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
                <span className="block text-[10px] uppercase tracking-[0.25em] 
                text-neutral-400 font-semibold mb-4">
                  Contents
                </span>
                <ul className="space-y-0.5 border-l border-neutral-200">
                  {sections.map((s) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className={`block pl-4 py-1.5 text-[13px] 
                          font-medium transition-all duration-200 
                          -ml-px border-l ${
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
                {sections.map((s, index) => (
                  <div 
                    key={s.id} 
                    id={s.id} 
                    className="scroll-mt-24"
                  >
                    {/* Section Header */}
                    <div className="flex items-baseline gap-4 mb-4">
                      <span className="text-xs font-mono text-neutral-300 
                      font-medium tracking-wider">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <h2 className="text-2xl md:text-3xl 
                      font-serif font-normal text-neutral-900 
                      tracking-tight leading-tight">
                        {s.title}
                      </h2>
                    </div>
                    
                    {/* Section Body */}
                    <div className="text-[14px] leading-[1.8] 
                    text-neutral-600 space-y-4 md:pl-8">
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

const PrivacyPolicyPage = () => (
  <LegalPageShell title="Privacy Policy" sections={SECTIONS} />
);

export default PrivacyPolicyPage;