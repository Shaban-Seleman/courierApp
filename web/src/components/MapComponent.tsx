import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { OrderStatus } from '../store/slices/orderSlice';

const MapComponent = () => {
  const orders = useSelector((state: RootState) => state.orders.orders);

  // Filter active orders for the map
  const activeOrders = orders.filter(o => o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.CANCELLED);
  
  // Default center (NYC)
  const center = { lat: 40.7128, lng: -74.0060 };

  return (
    <div className="h-[400px] w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
      <MapContainer center={[center.lat, center.lng]} zoom={12} scrollWheelZoom={true} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {activeOrders.map(order => (
          <Marker 
            key={order.id} 
            position={[order.pickupLocation.latitude, order.pickupLocation.longitude]}
          >
            <Popup>
              <div className="p-1">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  order.status === OrderStatus.PENDING ? 'bg-yellow-100 text-yellow-800' :
                  order.status === OrderStatus.ASSIGNED ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {order.status}
                </span>
                <p className="font-semibold text-sm mt-1">{order.id}</p>
                <p className="text-xs text-slate-500">{order.customerName}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
