import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { trackingService } from '../services/trackingService';

// Fix for default marker icon in React-Leaflet
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapComponent = () => {
  const [couriers, setCouriers] = useState<any[]>([]);

  useEffect(() => {
    trackingService.connect((update) => {
        setCouriers(prev => {
            // Update existing or add new
            const existing = prev.find(c => c.driverId === update.driverId);
            if (existing) {
                return prev.map(c => c.driverId === update.driverId ? update : c);
            }
            return [...prev, update];
        });
    });

    return () => trackingService.disconnect();
  }, []);

  return (
    <div className="h-full w-full rounded-xl overflow-hidden shadow-lg border border-slate-200">
      <MapContainer 
        center={[51.505, -0.09]} 
        zoom={13} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {couriers.map((courier) => (
            <Marker key={courier.driverId} position={[courier.latitude, courier.longitude]}>
                <Popup>
                    Driver: {courier.driverId} <br /> 
                    Order: {courier.orderId || 'Idle'}
                </Popup>
            </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;