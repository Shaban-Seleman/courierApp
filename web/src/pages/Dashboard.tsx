import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import StatsCards from '../components/StatsCards';
import ActivityList from '../components/ActivityList';
import OrderList from '../components/OrderList';
import MapComponent from '../components/MapComponent';
import DriverDashboard from './DriverDashboard';

const Dashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isDriver = user?.role === 'DRIVER';
  const [orderIdToTrack, setOrderIdToTrack] = useState<string | undefined>(undefined);

  if (isDriver) {
    return (
        <div className="space-y-6">
            <DriverDashboard />
        </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Welcome back, {user?.fullName || 'User'}</p>
        </div>
        <Link
          to="/orders/new"
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm shadow-blue-500/20"
        >
          <Plus size={20} />
          New Shipment
        </Link>
      </div>

      {/* Stats Overview */}
      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          <OrderList setOrderIdToTrack={setOrderIdToTrack} />
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm h-[500px] transition-colors"> {/* Adjusted height for better visibility */}
             <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Live Tracking {orderIdToTrack && `for Order: ${orderIdToTrack.substring(0,8)}`}</h2>
             <div className="h-[calc(100%-40px)] rounded-lg overflow-hidden"> {/* Adjust inner div to take remaining height, accounting for h2 and mb-4 */}
                <MapComponent orderId={orderIdToTrack} />
             </div>
          </div>
        </div>

        {/* Sidebar Area - 1/3 width */}
        <div className="space-y-6">
          <ActivityList />

          {/* Quick Actions or Promo */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <h3 className="font-bold text-lg mb-2">Premium Delivery</h3>
            <p className="text-indigo-100 text-sm mb-4">Get 20% off on your next international shipment.</p>
            <button className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-50 transition-colors w-full">
              Upgrade Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

