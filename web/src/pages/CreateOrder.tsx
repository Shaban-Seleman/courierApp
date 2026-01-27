import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';
import { createOrder } from '../store/slices/orderSlice';
import { MapPin, Package, Map } from 'lucide-react';
import LocationPickerModal from '../components/LocationPickerModal';

const CreateOrder = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const [loading, setLoading] = useState(false);
    
    // Map State
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [activeLocationField, setActiveLocationField] = useState<'pickupAddress' | 'deliveryAddress' | null>(null);

    const [formData, setFormData] = useState({
        pickupAddress: '',
        deliveryAddress: '',
        packageDescription: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            await dispatch(createOrder(formData)).unwrap();
            navigate('/'); // Redirect to dashboard
        } catch (error) {
            console.error('Failed to create order', error);
            alert('Failed to create order');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const openMap = (field: 'pickupAddress' | 'deliveryAddress') => {
        setActiveLocationField(field);
        setIsMapOpen(true);
    };

    const handleLocationSelect = (address: string) => {
        if (activeLocationField) {
            setFormData(prev => ({ ...prev, [activeLocationField]: address }));
        }
    };

    return (
        <div className="max-w-3xl mx-auto relative">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">New Shipment</h1>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Package Info */}
                    <div>
                        <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                            <Package size={20} className="text-blue-500"/> Package Details
                        </h3>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Package Name & Description</label>
                            <textarea
                                name="packageDescription"
                                value={formData.packageDescription}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                rows={3}
                                placeholder="e.g., Box of Electronics, Document Envelope"
                                required
                            />
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
                                <label className="block text-sm font-medium text-slate-600 mb-1">Pickup Address</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        name="pickupAddress"
                                        value={formData.pickupAddress}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="123 Start St"
                                        required
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => openMap('pickupAddress')}
                                        className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                                        title="Pick on Map"
                                    >
                                        <Map size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-slate-600 mb-1">Delivery Address</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        name="deliveryAddress"
                                        value={formData.deliveryAddress}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="456 End Ave"
                                        required
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => openMap('deliveryAddress')}
                                        className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                                        title="Pick on Map"
                                    >
                                        <Map size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Creating...' : 'Create Shipment'}
                        </button>
                    </div>
                </form>
            </div>

            <LocationPickerModal 
                isOpen={isMapOpen}
                onClose={() => setIsMapOpen(false)}
                onSelectLocation={handleLocationSelect}
                title={activeLocationField === 'pickupAddress' ? 'Select Pickup Location' : 'Select Delivery Location'}
            />
        </div>
    );
};

export default CreateOrder;