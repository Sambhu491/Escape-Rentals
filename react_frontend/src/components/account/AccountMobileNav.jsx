import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { getMainNavItems } from "../../dataFile/accountNavConfig";

const AccountMobileNav = () => {
  const { user } = useSelector((state) => state.auth);
  const role = user?.role;
  const items = getMainNavItems(role);

  return (
    <div className="
      md:hidden fixed bottom-0 left-0 right-0 z-50 
      bg-linear-to-t from-white to-gray-100 
      backdrop-blur-xl 
      border-t border-zinc-700 
      shadow-[0_-1px_3px_rgba(0,0,0,0.03)] 
      flex items-center gap-2 
      px-2 pt-1 pb-safe
      overflow-x-auto
      /* Hide native scrollbars while preserving 
      touch functionality */
      scrollbar-none [-ms-overflow-style:none] 
      [scrollbar-width:none] 
      [&::-webkit-scrollbar]:hidden
    ">
      {items.map((item) => (
        <NavLink
          key={item.id}
          to={item.path}
          className={({ isActive }) =>
            `relative flex flex-col items-center 
            gap-1 px-2 py-1.5 shrink-0
            transition-colors duration-150 ease-out ${
              isActive ? 'text-zinc-800' : 'text-neutral-500'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <item.icon 
                size={22} 
                strokeWidth={isActive ? 1.8 : 1.3} 
              />
              <span 
              className={`text-[10px] leading-none 
              ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
};

export default AccountMobileNav;