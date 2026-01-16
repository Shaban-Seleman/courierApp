import { useEffect, useState } from 'react';
import { Package, Truck, CheckCircle } from 'lucide-react';
import { orderService } from '../services/orderService';

const StatsCards = () => {
  const [stats, setStats] = useState({
    pending: 0,
    inTransit: 0,
    delivered: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        // For admin dashboard, we might want 'all' orders, but currently we have 'getMyOrders' 
        // which returns orders for the logged-in user. 
        // Assuming the logged-in user is an Admin or we want to show their orders.
        // A real admin endpoint would be /orders/all or similar.
        // We'll use getMyOrders for now as a proxy or if the user is a manager.
        const orders = await orderService.getMyOrders(); 
        
        const pending = orders.filter((o: any) => o.status === 'PENDING' || o.status === 'ASSIGNED').length;
        const inTransit = orders.filter((o: any) => o.status === 'PICKED_UP').length;
        const delivered = orders.filter((o: any) => o.status === 'DELIVERED').length;

        setStats({ pending, inTransit, delivered });
      } catch (error) {
        console.error("Failed to load stats", error);
      }
    };

    loadStats();
    // In a real app, you'd set up a polling interval or websocket listener here
  }, []);

  const statItems = [
    { label: 'Pending', value: stats.pending, icon: Package, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'In Transit', value: stats.inTransit, icon: Truck, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Delivered', value: stats.delivered, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {statItems.map((stat) => (
        <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className={`p-3 rounded-lg ${stat.bg}`}>
            <stat.icon className={`w-6 h-6 ${stat.color}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
