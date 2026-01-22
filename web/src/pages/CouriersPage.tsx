import { useEffect, useState } from 'react';
import { driverService } from '../services/driverService';
import { Truck, User, CircleDot } from 'lucide-react';

interface Driver {
  id: string;
  userId: string;
  fullName: string;
  vehicleType: string;
  licensePlate: string;
  status: 'ONLINE' | 'OFFLINE';
}

const CouriersPage = () => {
  const [couriers, setCouriers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCouriers();
  }, []);

  const fetchCouriers = async () => {
    try {
      const data = await driverService.getAllDrivers();
      setCouriers(data);
    } catch (err) {
      setError('Failed to fetch couriers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading couriers...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Courier Management</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {couriers.map((courier) => (
          <div key={courier.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{courier.fullName || `Driver ${courier.id.slice(0, 8)}`}</h3>
                  <p className="text-sm text-slate-500">ID: {courier.userId}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                courier.status === 'ONLINE' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-slate-100 text-slate-600'
              }`}>
                <CircleDot size={8} className={courier.status === 'ONLINE' ? 'fill-green-500' : 'fill-slate-500'} />
                {courier.status}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-600">
                <Truck size={18} />
                <span>{courier.vehicleType}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <span className="font-mono bg-slate-100 px-2 py-1 rounded text-sm">
                  {courier.licensePlate}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {couriers.length === 0 && (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <p className="text-slate-500">No couriers found.</p>
        </div>
      )}
    </div>
  );
};

export default CouriersPage;
