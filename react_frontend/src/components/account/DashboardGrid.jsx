import StatCard from './StatCard';

const DashboardGrid = ({ 
  stats, 
  columns = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
}) => {
  return (
    <div className={`grid ${columns} gap-1`}>
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default DashboardGrid;