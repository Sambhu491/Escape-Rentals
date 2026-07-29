
const PlaceholderCard = ({ title, 
    description = 'This section will connect to the backend later.', 
    icon: Icon }) => {
  return (
    <div className="flex flex-col items-center 
    justify-center py-16 px-6 bg-white rounded-xl 
    border border-gray-100 shadow-sm border-dashed">
      <div className="w-16 h-16 rounded-full 
      bg-gray-100 flex items-center justify-center mb-4">
        {Icon && <Icon size={28} className="
        text-gray-400" />}
      </div>
      <h3 className="text-lg font-semibold 
      text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 
      text-center max-w-sm">{description}</p>
    </div>
  );
};

export default PlaceholderCard;