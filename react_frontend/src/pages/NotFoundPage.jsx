import { Link } from "react-router-dom";
import { FiArrowLeft, FiCompass } from "react-icons/fi";
import Navbar from "../components/landing/Navbar";

const NotFoundPage = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-[70vh] bg-white flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-xs">
          <div className="mx-auto w-14 h-14 rounded-full bg-neutral-50 flex items-center justify-center">
            <FiCompass className="w-6 h-6 text-neutral-300" />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-[0.22em] text-neutral-400 font-semibold">
              404
            </span>
            <h1 className="text-lg font-semibold text-neutral-900">Page not found</h1>
            <p className="text-xs text-neutral-500 leading-relaxed">
              This page doesn't exist yet, or the link you followed is out of date.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-900 hover:text-neutral-600 transition-colors"
          >
            <FiArrowLeft className="w-3.5 h-3.5" />
            Back to home
          </Link>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;
