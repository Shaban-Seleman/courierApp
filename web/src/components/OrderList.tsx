import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { fetchOrders, OrderStatus, Order } from '../store/slices/orderSlice';
import { MapPin, LocateFixed, XCircle, CreditCard, FileText, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import PaymentModal from './PaymentModal';
import PoDModal from './PoDModal';
import RatingModal from './RatingModal';

interface OrderListProps {
  setOrderIdToTrack: (orderId: string | undefined) => void;
}

const OrderList = ({ setOrderIdToTrack }: OrderListProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { ordersList, ordersPagination, loading, error } = useSelector((state: RootState) => state.orders);
  
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<string | null>(null);
  const [selectedOrderForPoD, setSelectedOrderForPoD] = useState<Order | null>(null);
  const [selectedOrderForRating, setSelectedOrderForRating] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchOrders({ page: 0, size: 10 }));
  }, [dispatch]);

  const handlePageChange = (newPage: number) => {
    dispatch(fetchOrders({ page: newPage, size: ordersPagination.size }));
  };

  const handlePaymentSuccess = () => {
    dispatch(fetchOrders({ page: ordersPagination.page, size: ordersPagination.size })); // Refresh current page
    setSelectedOrderForPayment(null);
  };

  if (loading && ordersList.length === 0) return <div className="p-6 text-center text-slate-500 dark:text-slate-400">Loading orders...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
      <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">My Orders</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Pickup</th>
              <th className="px-6 py-4">Delivery</th>
              <th className="px-6 py-4">Driver</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {ordersList.length === 0 ? (
                <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                        No orders found. Start by creating a new shipment!
                    </td>
                </tr>
            ) : (
                ordersList.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-200">#{order.id.slice(0, 8)}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{order.packageDescription}</td>
                    <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${
                        order.status === OrderStatus.DELIVERED ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        order.status === OrderStatus.PENDING ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        order.status === OrderStatus.CANCELLED ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        }
                    `}>
                        {order.status}
                    </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">
                        ${order.deliveryFee ? order.deliveryFee.toFixed(2) : '0.00'}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 text-sm">
                        <div className="flex items-center gap-1"><MapPin size={14} className="text-blue-500"/> {order.pickupAddress}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 text-sm">
                        <div className="flex items-center gap-1"><MapPin size={14} className="text-red-500"/> {order.deliveryAddress}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 text-sm">
                        {order.driverName ? (
                            <span className="font-medium text-slate-700 dark:text-slate-200">{order.driverName}</span>
                        ) : order.driverId ? (
                            <span className="font-mono text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded" title={order.driverId}>
                                {order.driverId.slice(0, 8)}...
                            </span>
                        ) : (
                            <span className="text-slate-400 italic">Pending</span>
                        )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">
                    {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setOrderIdToTrack(order.id)}
                        className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 rounded flex items-center gap-1"
                        title="Track Order"
                      >
                        <LocateFixed size={20} />
                      </button>
                      <button
                        onClick={() => setOrderIdToTrack(undefined)}
                        className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 rounded flex items-center gap-1"
                        title="Stop Tracking"
                      >
                        <XCircle size={20} />
                      </button>
                      
                      {/* Payment Button */}
                      {order.status === OrderStatus.PENDING && (
                        <button
                          onClick={() => setSelectedOrderForPayment(order.id)}
                          className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 rounded flex items-center gap-1"
                          title="Pay for Order"
                        >
                          <CreditCard size={20} />
                        </button>
                      )}

                      {/* PoD Button */}
                      {order.status === OrderStatus.DELIVERED && (
                        <button
                          onClick={() => setSelectedOrderForPoD(order)}
                          className="p-1 text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 rounded flex items-center gap-1"
                          title="View Proof of Delivery"
                        >
                          <FileText size={20} />
                        </button>
                      )}

                      {/* Rating Button */}
                      {order.status === OrderStatus.DELIVERED && (
                        <button
                          onClick={() => setSelectedOrderForRating(order.id)}
                          className="p-1 text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 rounded flex items-center gap-1"
                          title="Rate Driver"
                        >
                          <Star size={20} />
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
      
      {/* Pagination Footer */}
      <div className="flex justify-between items-center p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
        <div className="text-sm text-slate-500 dark:text-slate-400">
            Page <span className="font-medium">{ordersPagination.page + 1}</span> of <span className="font-medium">{ordersPagination.totalPages || 1}</span>
            <span className="ml-2 text-xs text-slate-400">({ordersPagination.totalElements} items)</span>
        </div>
        <div className="flex gap-2">
            <button 
                disabled={ordersPagination.page === 0}
                onClick={() => handlePageChange(ordersPagination.page - 1)}
                className="p-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300"
            >
                <ChevronLeft size={16} />
            </button>
            <button 
                disabled={ordersPagination.page >= (ordersPagination.totalPages - 1)}
                onClick={() => handlePageChange(ordersPagination.page + 1)}
                className="p-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300"
            >
                <ChevronRight size={16} />
            </button>
        </div>
      </div>

      {selectedOrderForPayment && (
        <PaymentModal 
            orderId={selectedOrderForPayment}
            amount={ordersList.find(o => o.id === selectedOrderForPayment)?.deliveryFee ? ordersList.find(o => o.id === selectedOrderForPayment)!.deliveryFee! * 100 : 5000}
            isOpen={!!selectedOrderForPayment}
            onClose={() => setSelectedOrderForPayment(null)}
            onSuccess={handlePaymentSuccess}
        />
      )}

      {selectedOrderForPoD && (
        <PoDModal 
            order={selectedOrderForPoD}
            isOpen={!!selectedOrderForPoD}
            onClose={() => setSelectedOrderForPoD(null)}
        />
      )}

      {selectedOrderForRating && (
        <RatingModal 
            orderId={selectedOrderForRating}
            isOpen={!!selectedOrderForRating}
            onClose={() => setSelectedOrderForRating(null)}
        />
      )}
    </div>
  );
};

export default OrderList;