import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { OrderStatus } from '../store/slices/orderSlice';
import { MoreHorizontal, ArrowRight } from 'lucide-react';

const OrderList = () => {
  const orders = useSelector((state: RootState) => state.orders.orders);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800">Recent Orders</h2>
        <button className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-1">
          View All <ArrowRight size={16} />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-700">#{order.id}</td>
                <td className="px-6 py-4 text-slate-600">{order.customerName}</td>
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
                <td className="px-6 py-4 text-slate-600">${order.totalAmount.toFixed(2)}</td>
                <td className="px-6 py-4 text-slate-500 text-sm">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <button className="p-1 text-slate-400 hover:text-slate-600 rounded">
                    <MoreHorizontal size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderList;
