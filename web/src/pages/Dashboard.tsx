import MapComponent from '../components/MapComponent';
import StatsCards from '../components/StatsCards';
import ActivityList from '../components/ActivityList';

const Dashboard = () => {
  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500">Real-time overview of your courier operations</p>
      </div>

      {/* Top Row: Stats */}
      <StatsCards />

      {/* Main Grid: Map & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Map Module (Takes up 2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-1">
          <MapComponent />
        </div>

        {/* Activity Module (Takes up 1 column) */}
        <div className="lg:col-span-1">
          <ActivityList />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;