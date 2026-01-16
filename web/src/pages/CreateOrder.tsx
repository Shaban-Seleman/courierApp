import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createOrder, Order } from '../store/slices/orderSlice';
import { AppDispatch } from '../store/store';
import { useNavigate } from 'react-router-dom';
import { MapPin, Package } from 'lucide-react';

const CreateOrder = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        customerName: '',
        description: '',
        pickupLat: '',
        pickupLng: '',
        deliveryLat: '',
        deliveryLng: '',
        amount: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const orderPayload: Partial<Order> = {
            customerName: formData.customerName,
            description: formData.description,
            pickupLocation: {
                latitude: parseFloat(formData.pickupLat),
                longitude: parseFloat(formData.pickupLng)
            },
            deliveryLocation: {
                latitude: parseFloat(formData.deliveryLat),
                longitude: parseFloat(formData.deliveryLng)
            },
            totalAmount: parseFloat(formData.amount)
        };

        const result = await dispatch(createOrder(orderPayload));
        if (createOrder.fulfilled.match(result)) {
            navigate('/orders');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Create New Order</h1>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Customer Info */}
                    <div>
                        <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                            <Package size={20} className="text-blue-500"/> Order Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Customer Name</label>
                                <input
                                    type="text"
                                    name="customerName"
                                    value={formData.customerName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Amount ($)</label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                    step="0.01"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-600 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-6"></div>

                    {/* Locations */}
                    <div>
                        <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                            <MapPin size={20} className="text-red-500"/> Locations
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h4 className="font-medium text-slate-600">Pickup Location</h4>
                                <input
                                    type="number"
                                    name="pickupLat"
                                    placeholder="Latitude"
                                    value={formData.pickupLat}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    step="any"
                                    required
                                />
                                <input
                                    type="number"
                                    name="pickupLng"
                                    placeholder="Longitude"
                                    value={formData.pickupLng}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    step="any"
                                    required
                                />
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-medium text-slate-600">Delivery Location</h4>
                                <input
                                    type="number"
                                    name="deliveryLat"
                                    placeholder="Latitude"
                                    value={formData.deliveryLat}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    step="any"
                                    required
                                />
                                <input
                                    type="number"
                                    name="deliveryLng"
                                    placeholder="Longitude"
                                    value={formData.deliveryLng}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    step="any"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
                        >
                            Create Order
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateOrder;
