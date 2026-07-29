import React from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { companyConfig, contactItems, socialLinks, footerLinks } from "../../dataFile/footerData";

export default function Footer() {
  return (
    <footer className="bg-neutral-950 text-neutral-400 border-t border-white/5 font-sans">
      <div className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-8">
        
        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-start">
          
          <div className="max-w-sm space-y-4 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center 
              rounded-sm bg-white text-neutral-900 
              text-base font-bold tracking-tighter shrink-0">
                {companyConfig.logoLetter}
              </div>
              <div>
                <h2 className="text-sm font-semibold tracking-tight text-white leading-none">
                  {companyConfig.brandName}
                </h2>
                <p className="text-[10px] uppercase tracking-widest text-neutral-500 mt-1">
                  {companyConfig.tagline}
                </p>
              </div>
            </div>

            <p className="text-xs leading-normal text-neutral-500">
              {companyConfig.description}
            </p>

            <div className="space-y-1.5 pt-1 text-xs border-t border-white/[0.03]">
             {contactItems.map((item) => (
                <ContactItem key={item.id} icon={item.icon} text={item.text} href={item.href} />
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              {socialLinks.map((social) => (
                <SocialIcon key={social.id} icon={social.icon} url={social.url} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4 lg:gap-x-8 xl:gap-x-12 flex-1 lg:max-w-3xl">
           {footerLinks.map((section) => (
              <div key={section.title} className="space-y-2">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-white">
                  {section.title}
                </h3>
                <ul className="space-y-1.5">
                  {section.links.map((item) => (
                    <li key={item.label}>
                      <Link
                        to={item.path}
                        className="group flex items-center gap-1 text-xs transition-colors duration-150 hover:text-white"
                      >
                        <span className="break-words">{item.label}</span>
                        <FiArrowRight
                          size={10}
                          className="opacity-0 shrink-0 text-white transition-all duration-200 transform -translate-x-1 group-hover:translate-x-0 group-hover:opacity-100"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>

        <div className="mt-6 pt-4 border-t 
        border-white/5 flex flex-col gap-1.5 
        text-[12px] text-neutral-500 sm:flex-row 
        sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {companyConfig.brandName}. All rights reserved.</p>
          <p className="tracking-wide font-light">Escape Rentals</p>
        </div>

      </div>
    </footer>
  );
}

function ContactItem({ icon: Icon, text, href }) {
  const content = (
    <>
      <span className="text-neutral-500 group-hover:text-neutral-300 transition-colors">
        <Icon className="h-3.5 w-3.5 shrink-0" />
      </span>
      <span className="break-words">{text}</span>
    </>
  );

  const wrapperClass = "flex items-center gap-2 group text-neutral-400 hover:text-white transition-colors duration-150 w-fit";

  return href ? (
    <a href={href} className={wrapperClass}>
      {content}
    </a>
  ) : (
    <div className={wrapperClass}>
      {content}
    </div>
  );
}

function SocialIcon({ icon: Icon, url }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-7 w-7 items-center justify-center rounded-md border border-white/5 bg-white/[0.01] text-neutral-500 transition-all duration-150 hover:border-white/20 hover:bg-white/[0.04] hover:text-white"
    >
      <Icon className="h-3 w-3" />
    </a>
  );
}
