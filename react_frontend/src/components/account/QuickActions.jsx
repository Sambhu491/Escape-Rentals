import { Link } from 'react-router-dom';
import { quickActionsByRole } from "../../dataFile/accountNavConfig";

const QuickActions = ({ role }) => {
  const actions = quickActionsByRole[role] || [];

  return (
    <div className="grid grid-cols-2 
    sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.label}
            to={action.path}
            className="flex items-center gap-3 p-3.5 
            rounded-sm 
            bg-white border border-neutral-400 
            shadow-[0_1px_2px_rgba(0,0,0,0.02)] 
            hover:border-neutral-300 
            hover:bg-neutral-50/50 
            active:bg-neutral-100/60 
            transition-all duration-150 
            ease-out group"
          >
            {/* Minimalist standalone icon presentation */}
            <Icon 
              size={15} 
              className="text-neutral-400 group-hover:text-neutral-900 
                transition-colors duration-150 flex-shrink-0" 
            />
            
            {/* Sophisticated, lightweight typography */}
            <span className="text-xs font-light tracking-wide text-neutral-600 
              group-hover:text-neutral-900 transition-colors duration-150 
              truncate select-none">
              {action.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
};

export default QuickActions;