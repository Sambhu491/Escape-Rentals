import { useSelector } from "react-redux";
import UserReviewsView from "../../components/account/reviews/UserReviewsView";
import HostReviewsView from "../../components/account/reviews/HostReviewsView";
import AdminReviewsView from "../../components/account/reviews/AdminReviewsView";

const ReviewsSection = () => {
  const { user } = useSelector((state) => state.auth);
  const role = user?.role;

  return (
    <div className="space-y-5">
      <h1 className="text-[20px] font-semibold tracking-tight text-neutral-900">Reviews</h1>

      {role === "ROLE_ADMIN" && <AdminReviewsView />}
      {role === "ROLE_HOST" && <HostReviewsView />}
      {role === "ROLE_USER" && <UserReviewsView />}
    </div>
  );
};

export default ReviewsSection;
