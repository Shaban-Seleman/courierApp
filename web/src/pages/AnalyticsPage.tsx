import { useEffect, useState } from 'react';
import { analyticsService } from '../services/analyticsService';
import { TrendingUp, Star, DollarSign, Package } from 'lucide-react';

interface CourierStats {
  id: string;
  driverId: string;
  totalDeliveries: number;
  averageRating: number | null;
  totalEarnings: number | null;
  lastUpdated: string;
}

const AnalyticsPage = () => {
  const [stats, setStats] = useState<CourierStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await analyticsService.getAllStats();
      setStats(data);
    } catch (err) {
      setError('Failed to fetch analytics data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading analytics...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  const totalSystemDeliveries = stats.reduce((acc, curr) => acc + (curr.totalDeliveries || 0), 0);
  const activeCouriers = stats.length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">System Analytics</h1>
        <div className="flex gap-2">
            <span className="text-sm text-slate-500">Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <Package size={24} />
            </div>
            <div>
                <p className="text-sm text-slate-500">Total Deliveries</p>
                <h3 className="text-2xl font-bold text-slate-800">{totalSystemDeliveries}</h3>
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                <TrendingUp size={24} />
            </div>
            <div>
                <p className="text-sm text-slate-500">Tracked Couriers</p>
                <h3 className="text-2xl font-bold text-slate-800">{activeCouriers}</h3>
            </div>
        </div>
        {/* Placeholder for Revenue */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
             <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                <DollarSign size={24} />
            </div>
            <div>
                <p className="text-sm text-slate-500">Total Earnings (Est.)</p>
                <h3 className="text-2xl font-bold text-slate-800">$0.00</h3>
            </div>
        </div>
      </div>

      {/* Detailed Stats Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800">Courier Performance</h2>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-medium">
                    <tr>
                        <th className="px-6 py-4">Driver ID</th>
                        <th className="px-6 py-4">Deliveries</th>
                        <th className="px-6 py-4">Rating</th>
                        <th className="px-6 py-4">Earnings</th>
                        <th className="px-6 py-4">Last Active</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {stats.map((stat) => (
                        <tr key={stat.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-mono text-slate-600">{stat.driverId}</td>
                            <td className="px-6 py-4 font-semibold text-slate-800">{stat.totalDeliveries}</td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-1 text-amber-500">
                                    <Star size={16} fill="currentColor" />
                                    <span className="text-slate-700">{stat.averageRating?.toFixed(1) || 'N/A'}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-slate-600">${stat.totalEarnings?.toFixed(2) || '0.00'}</td>
                            <td className="px-6 py-4 text-slate-500">
                                {new Date(stat.lastUpdated).toLocaleDateString()}
                            </td>
                        </tr>
                    ))}
                    {stats.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                No analytics data available yet.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
