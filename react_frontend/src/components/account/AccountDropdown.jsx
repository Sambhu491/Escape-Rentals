import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiLogOut, FiChevronDown } from "react-icons/fi";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/auth/authSlice";

const AccountDropdown = ({ user, variant = "landing" }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getInitials = (user) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }

    if (user?.firstName) {
      return user.firstName[0].toUpperCase();
    }

    return user?.email?.[0]?.toUpperCase() || "?";
  };

  const handleLogout = () => {
    setIsOpen(false);
    dispatch(logout());

    navigate("/", {
      replace: true,
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 text-sm text-neutral-700 hover:text-neutral-900 transition-colors cursor-pointer"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
          {getInitials(user)}
        </div>

        <span className="hidden font-medium sm:inline">
          {user?.firstName}
        </span>

        <FiChevronDown
          size={14}
          className={`transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-gray-200 bg-white py-2 shadow-lg">
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="text-sm font-medium text-gray-900">
              {user?.firstName} {user?.lastName}
            </p>

            <p className="truncate text-xs text-gray-500">
              {user?.email}
            </p>
          </div>

          {variant === "landing" && (
            <>
              <div className="py-1">
                <Link
                  to="/account/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <MdOutlineSpaceDashboard size={16} />
                  Dashboard
                </Link>

                <Link
                  to="/account/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <FiUser size={16} />
                  Profile
                </Link>
              </div>

              <div className="border-t border-gray-100" />
            </>
          )}

          <div className="py-1">
            <button
              onClick={handleLogout}
              className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
            >
              <FiLogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountDropdown;
