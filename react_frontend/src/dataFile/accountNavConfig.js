
import { HiOutlineViewGrid } from 'react-icons/hi';
import { FiUser, FiCalendar, FiHome, FiCreditCard, FiStar, FiHeart, FiBell, FiShield, FiSettings, FiLifeBuoy, FiTrash2, FiLogOut, FiSearch, FiEdit3, FiPlusCircle, FiUsers, FiFileText, FiGrid, FiMessageCircle } from 'react-icons/fi';

export const accountNavItems = [
  // main section
  { id: 'dashboard', label: 'Dashboard', path: '/account/dashboard', icon: HiOutlineViewGrid, roles: ['ROLE_USER', 'ROLE_HOST', 'ROLE_ADMIN'], section: 'main' },
  { id: 'profile', label: 'Profile', path: '/account/profile', icon: FiUser, roles: ['ROLE_USER', 'ROLE_HOST', 'ROLE_ADMIN'], section: 'main' },
  { id: 'bookings', label: 'Bookings', path: '/account/bookings', icon: FiCalendar, roles: ['ROLE_USER', 'ROLE_HOST', 'ROLE_ADMIN'], section: 'main' },
  { id: 'properties', label: 'Properties', path: '/account/properties', icon: FiHome, roles: ['ROLE_HOST', 'ROLE_ADMIN'], section: 'main' },
  { id: 'payments', label: 'Payments', path: '/account/payments', icon: FiCreditCard, roles: ['ROLE_USER', 'ROLE_HOST', 'ROLE_ADMIN'], section: 'main' },
  { id: 'reviews', label: 'Reviews', path: '/account/reviews', icon: FiStar, roles: ['ROLE_USER', 'ROLE_HOST', 'ROLE_ADMIN'], section: 'main' },
  { id: 'saved', label: 'Saved', path: '/account/saved', icon: FiHeart, roles: ['ROLE_USER', 'ROLE_HOST', 'ROLE_ADMIN'], section: 'main' },
  { id: 'notifications', label: 'Notifications', path: '/account/notifications', icon: FiBell, roles: ['ROLE_USER', 'ROLE_HOST', 'ROLE_ADMIN'], section: 'main' },
  { id: 'admin-users', label: 'Manage Users', path: '/account/admin/users', icon: FiUsers, roles: ['ROLE_ADMIN'], section: 'main' },
  { id: 'admin-reports', label: 'Reports', path: '/account/admin/reports', icon: FiFileText, roles: ['ROLE_ADMIN'], section: 'main' },
  { id: 'admin-categories', label: 'Categories', path: '/account/admin/categories', icon: FiGrid, roles: ['ROLE_ADMIN'], section: 'main' },
  { id: 'admin-comments', label: 'Comments', path: '/account/admin/comments', icon: FiMessageCircle, roles: ['ROLE_ADMIN'], section: 'main' },

  // bottom section
  { id: 'logout', label: 'Logout', icon: FiLogOut, roles: ['ROLE_USER', 'ROLE_HOST', 'ROLE_ADMIN'], section: 'bottom', action: 'logout' },
];

export const getNavItemsForRole = (role) => accountNavItems.filter(item => item.roles.includes(role));
export const getMainNavItems = (role) => accountNavItems.filter(item => item.roles.includes(role) && item.section !== 'bottom');
export const getBottomNavItems = (role) => accountNavItems.filter(item => item.roles.includes(role) && item.section === 'bottom');

export const quickActionsByRole = {
  ROLE_USER: [
    { label: 'Browse Properties', icon: FiSearch, path: '/properties', color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
    { label: 'View Bookings', icon: FiCalendar, path: '/account/bookings', color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' },
    { label: 'Edit Profile', icon: FiEdit3, path: '/account/profile', color: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
  ],
  ROLE_HOST: [
    // '/properties/new' never existed as a route — property creation happens via
    // the wizard modal on the Properties page, opened automatically with ?new=true.
    { label: 'Add Property', icon: FiPlusCircle, path: '/account/properties?new=true', color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' },
    { label: 'My Properties', icon: FiHome, path: '/account/properties', color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
    { label: 'View Bookings', icon: FiCalendar, path: '/account/bookings', color: 'bg-amber-50 text-amber-600 hover:bg-amber-100' },
  ],
  ROLE_ADMIN: [
    { label: 'Manage Users', icon: FiUsers, path: '/account/admin/users', color: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
    { label: 'Manage Properties', icon: FiHome, path: '/account/properties', color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
    { label: 'View Reports', icon: FiFileText, path: '/account/admin/reports', color: 'bg-rose-50 text-rose-600 hover:bg-rose-100' },
    { label: 'View Payments', icon: FiCreditCard, path: '/account/payments', color: 'bg-amber-50 text-amber-600 hover:bg-amber-100' },
    { label: 'Categories', icon: FiGrid, path: '/account/admin/categories', color: 'bg-teal-50 text-teal-600 hover:bg-teal-100' },
  ],
};