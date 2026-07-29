import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchCurrentUser,
  updateCurrentUser,
  deleteMyAccount,
  resetUserState,
  selectCurrentUser,
  selectIsFetchingCurrentUser,
  selectIsUpdatingUser,
  selectIsDeletingOwnAccount,
} from '../../redux/user/userSlice';
import { clearOtpState } from '../../redux/otp/otpSlice';

import SectionCard from '../../components/account/SectionCard';
import ProfileCard from '../../components/account/ProfileCard';
import ProfileEditor from '../../components/account/ProfileEditor';
import DeleteAccountCard from '../../components/account/DeleteAccountCard';
import { FiLoader } from 'react-icons/fi';

const ProfileSection = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user: authUser } = useSelector((state) => state.auth);
  const currentUser = useSelector(selectCurrentUser);
  const isLoading = useSelector(selectIsFetchingCurrentUser);
  const isUpdating = useSelector(selectIsUpdatingUser);
  const isDeleting = useSelector(selectIsDeletingOwnAccount);

  useEffect(() => {
    if (authUser?.id) {
      dispatch(fetchCurrentUser(authUser.id));
    }
  }, [dispatch, authUser?.id]);

  const handleProfileUpdate = (values) => {
    if (authUser?.id) {
      dispatch(updateCurrentUser({ id: authUser.id, data: values }));
    }
  };

  const handleDeleteAccount = async() => {
    const result = await dispatch(deleteMyAccount());

if(deleteMyAccount.fulfilled.match(result)){
    navigate("/", {
      replace:true
    });
}
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <FiLoader size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Profile</h1>

      <ProfileCard user={currentUser || authUser} />

      <SectionCard
        title="Edit Profile"
        subtitle="Update your personal information"
      >
        <ProfileEditor
          user={currentUser || authUser}
          onSubmit={handleProfileUpdate}
          isSubmitting={isUpdating}
        />
      </SectionCard>

      <DeleteAccountCard onDelete={handleDeleteAccount} isDeleting={isDeleting} />
    </div>
  );
};

export default ProfileSection;