import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { fetchOrders, OrderStatus } from '../store/slices/orderSlice';
import { MapPin, LocateFixed, XCircle, CreditCard } from 'lucide-react';
import PaymentModal from './PaymentModal';

interface OrderListProps {
  setOrderIdToTrack: (orderId: string | undefined) => void;
}

const OrderList = ({ setOrderIdToTrack }: OrderListProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { ordersList, loading, error } = useSelector((state: RootState) => state.orders);
  
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const handlePaymentSuccess = () => {
    dispatch(fetchOrders()); // Refresh orders to update status if backend changes it
    setSelectedOrderForPayment(null);
  };

  if (loading) return <div className="p-6 text-center text-slate-500">Loading orders...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800">My Orders</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Pickup</th>
              <th className="px-6 py-4">Delivery</th>
              <th className="px-6 py-4">Driver</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ordersList.length === 0 ? (
                <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                        No orders found. Start by creating a new shipment!
                    </td>
                </tr>
            ) : (
                ordersList.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-700">#{order.id.slice(0, 8)}</td>
                    <td className="px-6 py-4 text-slate-600">{order.packageDescription}</td>
                    <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${
                        order.status === OrderStatus.DELIVERED ? 'bg-green-100 text-green-800' :
                        order.status === OrderStatus.PENDING ? 'bg-yellow-100 text-yellow-800' :
                        order.status === OrderStatus.CANCELLED ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                        }
                    `}>
                        {order.status}
                    </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                        <div className="flex items-center gap-1"><MapPin size={14} className="text-blue-500"/> {order.pickupAddress}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                        <div className="flex items-center gap-1"><MapPin size={14} className="text-red-500"/> {order.deliveryAddress}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                        {order.driverName ? (
                            <span className="font-medium text-slate-700">{order.driverName}</span>
                        ) : order.driverId ? (
                            <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded" title={order.driverId}>
                                {order.driverId.slice(0, 8)}...
                            </span>
                        ) : (
                            <span className="text-slate-400 italic">Pending</span>
                        )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">
                    {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setOrderIdToTrack(order.id)}
                        className="p-1 text-blue-600 hover:text-blue-800 rounded flex items-center gap-1"
                        title="Track Order"
                      >
                        <LocateFixed size={20} />
                      </button>
                      <button
                        onClick={() => setOrderIdToTrack(undefined)}
                        className="p-1 text-red-600 hover:text-red-800 rounded flex items-center gap-1"
                        title="Stop Tracking"
                      >
                        <XCircle size={20} />
                      </button>
                      
                      {/* Payment Button - Simple Logic: if PENDING, allow payment */}
                      {order.status === OrderStatus.PENDING && (
                        <button
                          onClick={() => setSelectedOrderForPayment(order.id)}
                          className="p-1 text-green-600 hover:text-green-800 rounded flex items-center gap-1"
                          title="Pay for Order"
                        >
                          <CreditCard size={20} />
                        </button>
                      )}
                    </div>
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {selectedOrderForPayment && (
        <PaymentModal 
            orderId={selectedOrderForPayment}
            isOpen={!!selectedOrderForPayment}
            onClose={() => setSelectedOrderForPayment(null)}
            onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default OrderList;