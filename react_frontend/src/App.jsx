import { BrowserRouter, Routes, Route, Navigate  } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import Footer from "./components/landing/Footer";
import PropertyPage from "./pages/PropertyPage";
import PropertyDetailPage from "./pages/PropertyDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VerifyOtpPage from "./pages/VerifyOtpPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsPage from "./pages/TermsPage";

import PublicLayout from "./layouts/PublicLayout";

import AccountLayout from './layouts/AccountLayout';
import AccountPage from './pages/account/AccountPage';
import DashboardSection from './pages/account/DashboardSection';
import ProfileSection from './pages/account/ProfileSection';
import BookingsSection from './pages/account/BookingsSection';
import PropertiesSection from './pages/account/PropertiesSection';
import PaymentsSection from './pages/account/PaymentsSection';
import ReviewsSection from './pages/account/ReviewsSection';
import SavedSection from './pages/account/SavedSection';
import NotificationsSection from './pages/account/NotificationsSection';
import AdminUsersSection from './pages/account/AdminUsersSection';
import AdminUserDetailPage from './pages/account/AdminUserDetailPage';
import AdminReportsSection from './pages/account/AdminReportsSection';
import AdminCategoriesSection from './pages/account/AdminCategoriesSection';
import AdminCommentsSection from './pages/account/AdminCommentsSection';
import RequireRole from './components/account/RequireRole';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <>
    <BrowserRouter>
    <ScrollToTop />
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage/>} />
        <Route path="/properties" element={<PropertyPage/>} />
        <Route path="/properties/:id" element={<PropertyDetailPage/>} />
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/register" element={<RegisterPage/>} />
        <Route path="/verify-otp" element={<VerifyOtpPage/>} />
        <Route path="/forgot-password" element={<ForgotPasswordPage/>} />
        <Route path="/reset-password" element={<ResetPasswordPage/>} />
        <Route path="/about" element={<AboutPage/>} />
        <Route path="/contact" element={<ContactPage/>} />
        <Route path="/privacy" element={<PrivacyPolicyPage/>} />
        <Route path="/terms" element={<TermsPage/>} />
      </Route>

      <Route path="/account" element={<AccountPage />}>
        <Route element={<AccountLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardSection />} />
          <Route path="profile" element={<ProfileSection />} />
          <Route path="bookings" element={<BookingsSection />} />
          <Route path="properties" element={<PropertiesSection />} />
          <Route path="payments" element={<PaymentsSection />} />
          <Route path="reviews" element={<ReviewsSection />} />
          <Route path="saved" element={<SavedSection />} />
          <Route path="notifications" element={<NotificationsSection />} />
          <Route
            path="admin/users"
            element={
              <RequireRole role="ROLE_ADMIN">
                <AdminUsersSection />
              </RequireRole>
            }
          />
          <Route
            path="admin/users/:id"
            element={
              <RequireRole role="ROLE_ADMIN">
                <AdminUserDetailPage />
              </RequireRole>
            }
          />
          <Route
            path="admin/reports"
            element={
              <RequireRole role="ROLE_ADMIN">
                <AdminReportsSection />
              </RequireRole>
            }
          />
          <Route
            path="admin/categories"
            element={
              <RequireRole role="ROLE_ADMIN">
                <AdminCategoriesSection />
              </RequireRole>
            }
          />
          <Route
            path="admin/comments"
            element={
              <RequireRole role="ROLE_ADMIN">
                <AdminCommentsSection />
              </RequireRole>
            }
          />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage/>} />

    </Routes>

    </BrowserRouter>
    </>
  )
}

export default App
