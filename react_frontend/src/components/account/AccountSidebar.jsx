import { useSelector } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import { getMainNavItems, getBottomNavItems } from '../../dataFile/accountNavConfig';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const AccountSidebar = ({ isCollapsed, onToggle, isMobileOpen, onLogout }) => {
  const { user } = useSelector((state) => state.auth);
  const role = user?.role;
  const location = useLocation();

  const mainItems = getMainNavItems(role);
  const bottomItems = getBottomNavItems(role);

  return (
    <aside
      className={`fixed top-0 left-0 h-full z-40 
        hidden md:flex flex-col transition-[width] 
        duration-200 ease-out 
        bg-linear-to-b from-slate-50 via-zinc-200 
        to-neutral-100
        backdrop-blur-xl border-r 
        border-black/[0.2] ${
        isCollapsed ? 'w-[72px]' : 'w-[170px]'
      }`}
    >
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between 
      h-14 px-4 flex-shrink-0 mb-6">
        {!isCollapsed && (
          <span className="text-[18px] font-semibold 
          text-neutral-800 select-none">
            Account
          </span>
        )}
        <button
          onClick={onToggle}
          className={`flex items-center justify-center 
            w-7 h-7 rounded text-white 
            bg-black
            transition-all duration-150 
            ease-out cursor-pointer ${
            isCollapsed ? 'mx-auto' : ''
          }`}
          aria-label={
            isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed 
          ? <FiChevronRight size={19} strokeWidth={2.5} /> 
          : <FiChevronLeft size={19} strokeWidth={2.5} />}
        </button>
      </div>

      {/* ─── Main Navigation ─── */}
      <nav className="flex-1 overflow-y-auto px-3 pt-2 
      pb-4 space-y-px">
        {mainItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
       <NavLink
  key={item.id}
  to={item.path}
  className={`relative flex items-center gap-2.5 h-9 
    rounded-lg text-[13px] transition-colors 
    duration-150 ease-out group ${
    isActive
      ? 'text-neutral-900 underline underline-offset-3'
      : 'text-neutral-900'
  } ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}
>
  {isActive && (
    <span
      className="
        absolute left-0
        h-5 w-[4px]
        rounded-full
        bg-neutral-900
      "
    />
  )}

  <item.icon 
    size={17} 
    strokeWidth={isActive ? 2.2 : 1.8}
    className={`flex-shrink-0 ${
      isActive
        ? 'text-neutral-900'
        : 'text-neutral-900'
    }`} 
  />

  {!isCollapsed && (
    <span className="truncate">
      {item.label}
    </span>
  )}
</NavLink>
          );
        })}
      </nav>

      {/* ─── Bottom Actions ─── */}
      <div className="px-3 pb-10 pt-2 space-y-px">
        {bottomItems.map((item) => {
          if (item.action === 'logout') {
            return (
              <button
                key={item.id}
                onClick={onLogout}
                className={`w-full flex items-center 
                  gap-2.5 h-9 
                  rounded text-[13px] 
                  font-normal cursor-pointer
                  hover:text-red-500
                  transition-colors duration-150 ease-out 
                  ${
                  isCollapsed ? 'justify-center px-0' : 'px-3'
                }`}
              >
                <item.icon size={17} strokeWidth={1.8} 
                className="flex-shrink-0" />
                {!isCollapsed && <span className="break-words">
                  {item.label}</span>}
              </button>
            );
          }

          return null;
        })}
      </div>
    </aside>
  );
};

export default AccountSidebar;