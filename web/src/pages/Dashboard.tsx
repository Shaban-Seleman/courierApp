import { Package, TrendingUp, Users, Clock } from 'lucide-react';
import StatCard from '../components/StatCard';
import MapComponent from '../components/MapComponent';
import OrderList from '../components/OrderList';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Orders" 
          value="1,284" 
          icon={<Package size={24} />} 
          trend="+12.5%" 
          trendUp={true}
          color="blue"
        />
        <StatCard 
          title="Total Revenue" 
          value="$45,231.89" 
          icon={<TrendingUp size={24} />} 
          trend="+8.2%" 
          trendUp={true}
          color="green"
        />
        <StatCard 
          title="Active Drivers" 
          value="48" 
          icon={<Users size={24} />} 
          trend="-2.4%" 
          trendUp={false}
          color="indigo"
        />
        <StatCard 
          title="Avg. Delivery Time" 
          value="24 min" 
          icon={<Clock size={24} />} 
          trend="-1.5%" 
          trendUp={true}
          color="orange"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section - Takes up 2/3 on large screens */}
        <div className="lg:col-span-2 space-y-6">
             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Live Delivery Map</h3>
                <MapComponent />
             </div>
        </div>

        {/* Side Panel / Notifications or Quick Actions (Placeholder) */}
        <div className="lg:col-span-1 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg">
           <h3 className="text-xl font-bold mb-4">Driver Status</h3>
           <div className="space-y-4">
              <div className="flex items-center justify-between bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                 <span>Online</span>
                 <span className="font-bold text-lg">32</span>
              </div>
              <div className="flex items-center justify-between bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                 <span>Busy</span>
                 <span className="font-bold text-lg">16</span>
              </div>
              <div className="flex items-center justify-between bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                 <span>Offline</span>
                 <span className="font-bold text-lg">8</span>
              </div>
           </div>
           
           <button className="w-full mt-8 bg-white text-blue-600 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors shadow-md">
             Broadcast Message
           </button>
        </div>
      </div>

      {/* Recent Orders Table */}
      <OrderList />
    </div>
  );
};

export default Dashboard;
