import { useNavigate } from 'react-router-dom';
import OrderList from '../components/OrderList';

const OrdersPage = () => {
    const navigate = useNavigate();

    // When a user clicks 'Track' on this page, we can navigate to the Dashboard (which has the map)
    // or a dedicated tracking page. For now, let's assume navigating to Dashboard is fine, 
    // but ideally we would pass the ID to highlight it. 
    // Since Dashboard doesn't read query params yet, we'll just log or todo it.
    // Or simpler: We can just have a read-only list here, or assume OrderList's tracking button works if we passed a handler.
    
    // We'll redirect to Dashboard for tracking for now.
    const handleTrack = (orderId: string | undefined) => {
        if (orderId) {
            // In a real app, use query param ?track=orderId and handle it in Dashboard
            navigate('/'); 
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">All Orders</h1>
            </div>
            
            <OrderList setOrderIdToTrack={handleTrack} />
        </div>
    );
};

export default OrdersPage;
