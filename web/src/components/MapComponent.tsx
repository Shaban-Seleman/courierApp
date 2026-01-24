import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { trackingService } from '../services/trackingService';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

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

interface MapComponentProps {
    orderId?: string; // Optional orderId for customer-specific tracking
}

// Component to handle map re-centering when locations change
const RecenterMap = ({ locations }: { locations: any[] }) => {
    const map = useMap();
    useEffect(() => {
        if (locations.length > 0) {
            map.setView([locations[0].latitude, locations[0].longitude], 13);
        }
    }, [locations, map]);
    return null;
};

const MapComponent = ({ orderId }: MapComponentProps) => {
  const [trackedLocations, setTrackedLocations] = useState<any[]>([]);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error("No authentication token found for WebSocket connection.");
        return;
    }

    let unsubscribe: (() => void) | undefined;

    const connectAndSubscribe = async () => {
      try {
        await trackingService.connect(token);

        const handleUpdate = (update: any) => {
            // If tracking a specific order, ensure only that order's driver is shown
            if (orderId && update.orderId && update.orderId === orderId) {
                setTrackedLocations([update]); // Only show this one driver
            } else if (!orderId) { // Admin map shows all drivers
                setTrackedLocations(prev => {
                    const existing = prev.find(loc => loc.driverId === update.driverId);
                    if (existing) {
                        return prev.map(loc => loc.driverId === update.driverId ? update : loc);
                    }
                    return [...prev, update];
                });
            }
        };

        if (orderId) {
            unsubscribe = trackingService.subscribeToOrderTracking(orderId, handleUpdate);
            console.log(`Subscribing to order tracking for orderId: ${orderId}`);
        } else {
            // Assume admin map if no orderId is provided
            unsubscribe = trackingService.subscribeToAdminMap(handleUpdate);
            console.log('Subscribing to admin map for all drivers.');
        }
      } catch (error) {
        console.error("Failed to connect to WebSocket for tracking:", error);
      }
    };

    connectAndSubscribe();

    return () => {
        if (unsubscribe) {
            unsubscribe();
        }
        // trackingService.disconnect(); // Don't disconnect global service, only unsubscribe from specific topics
    };
  }, [orderId, user]); // Re-run effect if orderId or user (for role change) changes

  // Determine initial center and zoom based on tracked locations
  const initialCenter: [number, number] = trackedLocations.length > 0
    ? [trackedLocations[0].latitude, trackedLocations[0].longitude]
    : [51.505, -0.09]; // Default to London if no locations yet

  const zoomLevel = trackedLocations.length > 0 ? 13 : 2; // Zoom in if tracking a driver, otherwise world view

  return (
    <div className="h-full w-full rounded-xl overflow-hidden shadow-lg border border-slate-200">
      <MapContainer
        center={initialCenter}
        zoom={zoomLevel}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap locations={trackedLocations} />
        {trackedLocations.map((location) => (
            <Marker key={location.driverId} position={[location.latitude, location.longitude]}>
                <Popup>
                    Driver: {location.driverId?.substring(0, 8)} <br />
                    Order: {location.orderId?.substring(0, 8) || 'Idle'}
                </Popup>
            </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;