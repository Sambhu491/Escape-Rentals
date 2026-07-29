
import { useState } from "react";
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import AccountSidebar from '../components/account/AccountSidebar';
import AccountMobileNav from '../components/account/AccountMobileNav';
import { logout } from "../redux/auth/authSlice";
import Navbar from "../components/landing/Navbar";

const AccountLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/', {
        replace:true
    });
  };

  return (
    <div className="flex min-h-screen bg-white">
      <AccountSidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onLogout={handleLogout}
      />

      <div
        className={`flex-1 flex flex-col min-w-0 
          transition-all duration-300 ${
          isSidebarCollapsed ? 'md:ml-20' : 'md:ml-44'
        }`}
      >
        <Navbar
        accountPage={true}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-20 md:pb-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <AccountMobileNav />
    </div>
  );
};

export default AccountLayout;