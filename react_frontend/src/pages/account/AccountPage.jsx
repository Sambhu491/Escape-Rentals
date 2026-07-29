
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

import {
  selectAuthUser,
  selectAuthToken,
  selectIsAuthenticated,
} from "../../redux/auth/authSlice";

const AccountPage = () => {
  const user = useSelector(selectAuthUser);
  const token = useSelector(selectAuthToken);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (!isAuthenticated || !token || !user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AccountPage;



// import { useSelector } from 'react-redux';
// import { Navigate, Outlet } from 'react-router-dom';

// const AccountPage = () => {
//   const { user, token } = useSelector((state) => state.auth);
//   const isAuthenticated = !!token && !!user;

//   if (!isAuthenticated) return <Navigate to="/" replace />;
//   return <Outlet />;
// };

// export default AccountPage;