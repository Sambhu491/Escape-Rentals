import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="
        inline-flex
        items-center
        text-sm
        text-neutral-600
        hover:text-neutral-900
        transition-colors
        group cursor-pointer
      "
    >
      <FiArrowLeft
        className="transition-transform 
        group-hover:-translate-x-1"
        size={18}
      />

      <span className="font-medium cursor-pointer">Back</span>
    </button>
  );
};

export default BackButton;
