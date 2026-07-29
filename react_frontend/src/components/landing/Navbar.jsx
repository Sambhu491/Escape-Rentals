import React, { useEffect, useCallback } from "react";
import { FiUser, FiBell } from "react-icons/fi";
import { brandConfig, navLinks } from "../../dataFile/navbarData";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import AccountDropdown from "../account/AccountDropdown";
import {
  fetchMyNotifications,
  selectUnreadNotificationCount,
} from "../../redux/notification/notificationSlice";
import { fetchSavedPropertyIds } from "../../redux/saved/savedSlice";
import useRefetchOnFocus from "../../dataFile/useRefetchOnFocus";

export default function Navbar({ accountPage = false }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const unreadCount = useSelector(selectUnreadNotificationCount);

  // Fetched here (not just on the notifications page) so the bell's red dot
  // reflects reality on every page — an Instagram/Facebook/Airbnb-style
  // "there's something new" cue that doesn't require opening the section first.
  const refreshBellState = useCallback(() => {
    if (user?.id) {
      dispatch(fetchMyNotifications({ page: 0, size: 20, sort: "createdAt,desc" }));
      // Fetched once here so every heart icon across the site (property
      // cards, detail page) already knows its saved state without each one
      // needing its own request.
      dispatch(fetchSavedPropertyIds());
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    refreshBellState();
  }, [refreshBellState]);

  // Navbar is mounted the whole time a tab is open — without this, the red
  // dot only ever reflects notifications that existed when the tab first
  // loaded, since nothing else re-triggers the fetch above.
  useRefetchOnFocus(refreshBellState);

  return (
    <header
      className="sticky top-0 z-50 
    bg-linear-to-b from-white/70 to-gray-100 backdrop-blur-xl border-b 
    border-neutral-200"
    >
      <div className="relative mx-auto max-w-screen-2xl px-4 py-3 sm:px-6 lg:px-8">
        {/* Main Header Horizon Row */}
        <div className="flex items-center justify-between">
          {/* BRAND BLOCK */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-sm bg-neutral-900 text-white flex items-center justify-center font-semibold">
              {brandConfig.logoLetter}
            </div>
            <div className="leading-tight">
              <h1 className="text-sm sm:text-base font-semibold text-neutral-900">
                {brandConfig.name}
              </h1>
              <p className="text-[10px] uppercase tracking-[0.22em] text-neutral-400">
                {brandConfig.tagline}
              </p>
            </div>
          </div>

          {/* ACTIONS BLOCK */}
          <div className="flex items-center gap-3 z-10">
            {user?.id ? (
              <>
                <Link
                  to="/account/notifications"
                  className="relative flex items-center justify-center h-8 w-8 rounded-full text-neutral-600 hover:text-neutral-900 hover:bg-black/[0.04] transition-colors"
                  aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
                >
                  <FiBell size={17} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                  )}
                </Link>
                <AccountDropdown
                user={user}
                variant={accountPage ? "account" : "landing"}
                />
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center 
      gap-1.5 text-xs sm:text-sm 
      text-neutral-700 hover:text-neutral-900 
      transition-colors cursor-pointer"
                >
                  <FiUser size={14} />
                  Login
                </Link>

                <Link
                  to="/register"
                  className="rounded-sm 
      bg-neutral-900 px-4 py-2 text-xs 
      sm:text-sm text-white hover:bg-neutral-800 
      transition-colors cursor-pointer"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

        {/* RESPONSIVE NAVIGATION */}
        {/* Flex-wraps natively on small viewports; locks to absolute center on desktop viewports */}
        <nav className="mt-4 flex justify-center flex-wrap gap-x-5 gap-y-3 md:mt-0 md:absolute md:left-1/2 md:-translate-x-1/2 md:top-1/2 md:-translate-y-1/2">
          {navLinks.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="text-xs sm:text-sm font-light text-neutral-600 hover:text-neutral-900 transition relative group"
            >
              {item.name}
              <span className="absolute left-0 -bottom-1 h-px w-0 bg-neutral-900 transition-all group-hover:w-full" />
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
