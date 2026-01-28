import { useEffect, useState } from 'react';
import { Package, Truck, CheckCircle, BarChart } from 'lucide-react';
import { orderService } from '../services/orderService';

const StatsCards = () => {
  const [stats, setStats] = useState({
    pending: 0,
    inTransit: 0,
    delivered: 0,
    systemTotal: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const orderStats = await orderService.getOrderStats();
        
        const pending = (orderStats.pending || 0) + (orderStats.assigned || 0);
        const inTransit = orderStats.pickedUp || 0;
        const delivered = orderStats.delivered || 0;
        const systemTotal = orderStats.total || 0;

        setStats({ pending, inTransit, delivered, systemTotal });
      } catch (error) {
        console.error("Failed to load stats", error);
      }
    };

    loadStats();
  }, []);

  const statItems = [
    { label: 'Pending', value: stats.pending, icon: Package, color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { label: 'In Transit', value: stats.inTransit, icon: Truck, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Delivered', value: stats.delivered, icon: CheckCircle, color: 'text-green-500 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'System Total', value: stats.systemTotal, icon: BarChart, color: 'text-purple-500 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {statItems.map((stat) => (
        <div key={stat.label} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center space-x-4 transition-colors">
          <div className={`p-3 rounded-lg ${stat.bg}`}>
            <stat.icon className={`w-6 h-6 ${stat.color}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stat.value}</h3>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
