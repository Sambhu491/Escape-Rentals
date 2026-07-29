
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchUserDashboard,
  fetchHostDashboard,
  fetchAdminDashboard,
  selectUserDashboard,
  selectHostDashboard,
  selectAdminDashboard,
  selectIsFetchingUserDashboard,
  selectIsFetchingHostDashboard,
  selectIsFetchingAdminDashboard
} from '../redux/dashboard/dashboardSlice';

const useRoleDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const role = user?.role;

  const userDashboard = useSelector(selectUserDashboard);
  const hostDashboard = useSelector(selectHostDashboard);
  const adminDashboard = useSelector(selectAdminDashboard);

  const isLoadingUser = useSelector(selectIsFetchingUserDashboard);
  const isLoadingHost = useSelector(selectIsFetchingHostDashboard);
  const isLoadingAdmin = useSelector(selectIsFetchingAdminDashboard);

  useEffect(() => {
    if (role === 'ROLE_USER') dispatch(fetchUserDashboard());
    else if (role === 'ROLE_HOST') dispatch(fetchHostDashboard());
    else if (role === 'ROLE_ADMIN') dispatch(fetchAdminDashboard());
  }, [dispatch, role]);

  // Return the appropriate data based on role
  const dataMap = { ROLE_USER: userDashboard, ROLE_HOST: hostDashboard, ROLE_ADMIN: adminDashboard };
  const loadingMap = { ROLE_USER: isLoadingUser, ROLE_HOST: isLoadingHost, ROLE_ADMIN: isLoadingAdmin };

  return { data: dataMap[role] || null, isLoading: loadingMap[role] || false, role };
};

export default useRoleDashboard;