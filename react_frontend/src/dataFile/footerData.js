// footerData.js
import { FaInstagram, FaFacebook, FaTwitter } from "react-icons/fa";
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import { FaGithub } from "react-icons/fa";

export const companyConfig = {
  brandName: "Escape Rentals",
  tagline: "Vacation Rentals",
  logoLetter: "E",
  description: "Discover unique stays, trusted hosts, and memorable experiences designed around the way you travel.",
};

export const contactItems = [
  {
    id: "email",
    icon: FiMail,
    text: "escape.rentals.official90@gmail.com",
    href: "mailto:escape.rentals.official90@gmail.com",
  },
  {
    id: "phone",
    icon: FiPhone,
    text: "+91 00000 00000",
    href: "tel:+910000000000",
  },
  {
    id: "location",
    icon: FiMapPin,
    text: "Available Worldwide",
    href: null,
  },
   {
    id: "github",
    icon: FaGithub,
    text: "Visit Github",
    href: "https://github.com/Sambhu491/Escape-Rentals/tree/main",
  },
];

export const socialLinks = [
  { id: "github", icon: FaGithub, url: "https://github.com/Sambhu491" },
  { id: "instagram", icon: FaInstagram, url: "https://instagram.com" },
  { id: "facebook", icon: FaFacebook, url: "https://facebook.com" },
  { id: "twitter", icon: FaTwitter, url: "https://twitter.com" },
];

// Note: links below were repointed to routes that actually exist in App.jsx
// (previously "/host", "/bookings", "/reviews", "/payments", "/property",
// "/dashboard", "/host-reviews" were all dead — no matching <Route>).
// About Us / Contact / Privacy Policy / Terms now have real pages. "Help
// Center" (/help) is still unbuilt — out of scope for this pass — and
// resolves to a proper 404 page instead of a blank screen.
export const footerLinks = [
  {
    title: "Explore",
    links: [
      { label: "Home Page", path: "/" },
      { label: "Browse Properties", path: "/properties" },
      { label: "Become a Host", path: "/register" },
    ],
  },
  {
    title: "Guests",
    links: [
      { label: "My Bookings", path: "/account/bookings" },
      { label: "Reviews", path: "/account/reviews" },
      { label: "Payment History", path: "/account/payments" },
      { label: "Help Center", path: "/contact" },
    ],
  },
  {
    title: "Hosts",
    links: [
      { label: "List Your Property", path: "/account/properties" },
      { label: "Host Dashboard", path: "/account/dashboard" },
      { label: "Host Reviews", path: "/account/reviews" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", path: "/about" },
      { label: "Contact", path: "/contact" },
      { label: "Privacy Policy", path: "/privacy" },
      { label: "Terms", path: "/terms" },
    ],
  },
];
