import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { fetchDriverProfile, createDriverProfile, toggleDriverStatus, DriverStatus } from '../store/slices/driverSlice';
import { fetchAvailableOrders, fetchDriverOrders, assignDriver, updateOrderStatus, OrderStatus, PaginationInfo } from '../store/slices/orderSlice';
import { fetchDriverStats } from '../store/slices/analyticsSlice';
import { MapPin, Truck, TrendingUp, DollarSign, Package, ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ pagination, onPageChange }: { pagination: PaginationInfo, onPageChange: (p: number) => void }) => (
    <div className="col-span-full flex justify-between items-center p-4 border-t border-slate-100 bg-slate-50 mt-4 rounded-xl">
        <div className="text-sm text-slate-500">
            Page <span className="font-medium">{pagination.page + 1}</span> of <span className="font-medium">{pagination.totalPages || 1}</span>
             <span className="ml-2 text-xs text-slate-400">({pagination.totalElements} items)</span>
        </div>
        <div className="flex gap-2">
            <button 
                disabled={pagination.page === 0}
                onClick={() => onPageChange(pagination.page - 1)}
                className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600"
            >
                <ChevronLeft size={16} />
            </button>
            <button 
                disabled={pagination.page >= (pagination.totalPages - 1)}
                onClick={() => onPageChange(pagination.page + 1)}
                className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600"
            >
                <ChevronRight size={16} />
            </button>
        </div>
    </div>
);

const DriverDashboard = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { profile, loading: driverLoading } = useSelector((state: RootState) => state.driver);
    const { availableOrders, availablePagination, driverOrders, driverPagination, loading: ordersLoading } = useSelector((state: RootState) => state.orders);
    const { driverStats } = useSelector((state: RootState) => state.analytics);
    const { user } = useSelector((state: RootState) => state.auth);

    const [activeTab, setActiveTab] = useState<'assigned' | 'available'>('assigned');
    const [vehicleType, setVehicleType] = useState('Bike');
    const [licensePlate, setLicensePlate] = useState('');

    useEffect(() => {
        dispatch(fetchDriverProfile());
    }, [dispatch]);

    useEffect(() => {
        if (profile) {
            dispatch(fetchDriverOrders({ page: 0, size: 9 }));
            dispatch(fetchAvailableOrders({ page: 0, size: 9 }));
            dispatch(fetchDriverStats(profile.userId)); // Fetch stats using userId
        }
    }, [dispatch, profile]);

    const handleCreateProfile = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(createDriverProfile({ vehicleType, licensePlate }));
    };

    const handleStatusToggle = () => {
        if (!profile) return;
        const newStatus = profile.status === DriverStatus.ONLINE ? DriverStatus.OFFLINE : DriverStatus.ONLINE;
        dispatch(toggleDriverStatus(newStatus));
    };

    const handleAcceptOrder = (orderId: string) => {
        if (!profile) return;
        dispatch(assignDriver({ orderId, driverId: profile.userId }));
    };

    const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
        dispatch(updateOrderStatus({ id: orderId, status }));
    };

    const handleAssignedPageChange = (newPage: number) => {
        dispatch(fetchDriverOrders({ page: newPage, size: driverPagination.size }));
    };

    const handleAvailablePageChange = (newPage: number) => {
        dispatch(fetchAvailableOrders({ page: newPage, size: availablePagination.size }));
    };

    if (driverLoading && !profile) {
        return <div className="p-10 text-center">Loading driver profile...</div>;
    }

    if (!profile) {
        return (
            <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
                <h2 className="text-2xl font-bold mb-4 text-center">Complete Your Driver Profile</h2>
                <form onSubmit={handleCreateProfile} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Vehicle Type</label>
                        <select 
                            value={vehicleType} 
                            onChange={(e) => setVehicleType(e.target.value)}
                            className="w-full mt-1 p-2 border rounded-md"
                        >
                            <option value="Bike">Bike</option>
                            <option value="Car">Car</option>
                            <option value="Van">Van</option>
                            <option value="Scooter">Scooter</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">License Plate</label>
                        <input 
                            type="text" 
                            value={licensePlate} 
                            onChange={(e) => setLicensePlate(e.target.value)}
                            className="w-full mt-1 p-2 border rounded-md"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
                        Create Profile
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Status Header */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Welcome, {user?.fullName}</h2>
                    <p className="text-slate-500 text-sm">Vehicle: {profile.vehicleType} - {profile.licensePlate}</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                        profile.status === DriverStatus.ONLINE ? 'bg-green-100 text-green-700' : 
                        profile.status === DriverStatus.BUSY ? 'bg-orange-100 text-orange-700' :
                        'bg-slate-100 text-slate-600'
                    }`}>
                        {profile.status}
                    </span>
                    <button 
                        onClick={handleStatusToggle}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            profile.status === DriverStatus.ONLINE 
                            ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' 
                            : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
                        }`}
                    >
                        {profile.status === DriverStatus.ONLINE ? 'Go Offline' : 'Go Online'}
                    </button>
                </div>
            </div>

            {/* Analytics Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <Package size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Total Deliveries</p>
                        <h3 className="text-2xl font-bold text-slate-800">{driverStats?.totalDeliveries || 0}</h3>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Earnings</p>
                        <h3 className="text-2xl font-bold text-slate-800">${driverStats?.totalEarnings || 0}</h3>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Rating</p>
                        <h3 className="text-2xl font-bold text-slate-800">{driverStats?.averageRating || 'N/A'}</h3>
                    </div>
                </div>
            </div>

            {/* Orders Tabs */}
            <div>
                <div className="flex gap-4 border-b border-slate-200 mb-6">
                    <button 
                        onClick={() => setActiveTab('assigned')}
                        className={`pb-2 px-4 font-medium transition-colors relative ${
                            activeTab === 'assigned' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        My Assigned Orders
                        {activeTab === 'assigned' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>}
                    </button>
                    <button 
                        onClick={() => setActiveTab('available')}
                        className={`pb-2 px-4 font-medium transition-colors relative ${
                            activeTab === 'available' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        Available Orders
                        {activeTab === 'available' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>}
                    </button>
                </div>

                {ordersLoading && driverOrders.length === 0 && availableOrders.length === 0 ? (
                    <div className="text-center py-10">Loading orders...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeTab === 'assigned' && (
                            <>
                                {driverOrders.length === 0 ? (
                                    <div className="col-span-full text-center py-10 text-slate-500">No assigned orders. Check available orders!</div>
                                ) : (
                                    driverOrders.map(order => (
                                        <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">#{order.id.slice(0, 8)}</span>
                                                <span className="text-xs font-bold text-slate-500">{order.status}</span>
                                            </div>
                                            <p className="font-semibold text-slate-800 mb-2">{order.packageDescription}</p>
                                            
                                            <div className="space-y-3 mb-6 flex-1">
                                                <div className="flex gap-3 text-sm text-slate-600">
                                                    <MapPin size={16} className="text-blue-500 shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-xs text-slate-400 uppercase font-semibold">Pickup</p>
                                                        <p>{order.pickupAddress}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-3 text-sm text-slate-600">
                                                    <MapPin size={16} className="text-red-500 shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-xs text-slate-400 uppercase font-semibold">Delivery</p>
                                                        <p>{order.deliveryAddress}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 mt-auto">
                                                {order.status === OrderStatus.ASSIGNED && (
                                                    <button 
                                                        onClick={() => handleUpdateOrderStatus(order.id, OrderStatus.PICKED_UP)}
                                                        className="col-span-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                                                    >
                                                        Confirm Pickup
                                                    </button>
                                                )}
                                                {order.status === OrderStatus.PICKED_UP && (
                                                    <button 
                                                        onClick={() => handleUpdateOrderStatus(order.id, OrderStatus.DELIVERED)}
                                                        className="col-span-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
                                                    >
                                                        Confirm Delivery
                                                    </button>
                                                )}
                                                {order.status === OrderStatus.DELIVERED && (
                                                    <div className="col-span-2 text-center text-green-600 font-bold py-2 bg-green-50 rounded-lg">
                                                        Completed
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                                {driverOrders.length > 0 && <Pagination pagination={driverPagination} onPageChange={handleAssignedPageChange} />}
                            </>
                        )}

                        {activeTab === 'available' && (
                            <>
                                {availableOrders.length === 0 ? (
                                    <div className="col-span-full text-center py-10 text-slate-500">No orders available nearby.</div>
                                ) : (
                                    availableOrders.map(order => (
                                        <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">New</span>
                                                <span className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleTimeString()}</span>
                                            </div>
                                            <p className="font-semibold text-slate-800 mb-2">{order.packageDescription}</p>
                                            
                                            <div className="space-y-3 mb-6 flex-1">
                                                <div className="flex gap-3 text-sm text-slate-600">
                                                    <MapPin size={16} className="text-blue-500 shrink-0 mt-0.5" />
                                                    <p>{order.pickupAddress}</p>
                                                </div>
                                                <div className="flex gap-3 text-sm text-slate-600">
                                                    <MapPin size={16} className="text-red-500 shrink-0 mt-0.5" />
                                                    <p>{order.deliveryAddress}</p>
                                                </div>
                                            </div>

                                            <button 
                                                onClick={() => handleAcceptOrder(order.id)}
                                                className="w-full bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-800 text-sm font-medium flex items-center justify-center gap-2"
                                            >
                                                <Truck size={16} /> Accept Order
                                            </button>
                                        </div>
                                    ))
                                )}
                                {availableOrders.length > 0 && <Pagination pagination={availablePagination} onPageChange={handleAvailablePageChange} />}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DriverDashboard;
