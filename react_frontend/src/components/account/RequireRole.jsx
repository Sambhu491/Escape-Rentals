import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

// AccountPage already gates the whole /account/* tree behind authentication,
// but nothing previously enforced role — a plain USER could open an admin URL
// directly. Wrap admin-only routes with this to redirect non-matching roles
// back to the dashboard instead of rendering the page.
const RequireRole = ({ role, children }) => {
  const { user } = useSelector((state) => state.auth);
  const allowed = Array.isArray(role) ? role.includes(user?.role) : user?.role === role;

  if (!allowed) {
    return <Navigate to="/account/dashboard" replace />;
  }

  return children;
};

export default RequireRole;
