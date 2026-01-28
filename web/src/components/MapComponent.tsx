import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState, useMemo } from 'react';
import { trackingService } from '../services/trackingService';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Order, OrderStatus } from '../store/slices/orderSlice';
import { Package, Flag, Truck } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

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

// Custom Icons
const createDivIcon = (iconNode: React.ReactNode, bgColor: string) => {
    return L.divIcon({
        className: 'custom-marker-icon',
        html: `<div style="background-color: ${bgColor}; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">${renderToStaticMarkup(iconNode)}</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18]
    });
};

const DriverIcon = createDivIcon(<Truck size={20} color="white" />, '#0f172a'); // Slate 900
const PickupIcon = createDivIcon(<Package size={20} color="white" />, '#3b82f6'); // Blue 500
const DeliveryIcon = createDivIcon(<Flag size={20} color="white" />, '#ef4444'); // Red 500


// Component to handle map re-centering/fitting bounds
const MapController = ({ locations, pickup, delivery }: { locations: any[], pickup: L.LatLng | null, delivery: L.LatLng | null }) => {
    const map = useMap();
    
    useEffect(() => {
        const points: L.LatLng[] = [];
        
        if (locations.length > 0) {
            points.push(L.latLng(locations[0].latitude, locations[0].longitude));
        }
        if (pickup) points.push(pickup);
        if (delivery) points.push(delivery);

        if (points.length > 0) {
            const bounds = L.latLngBounds(points);
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        } else if (locations.length > 0) {
             map.setView([locations[0].latitude, locations[0].longitude], 13);
        }
    }, [locations, pickup, delivery, map]);
    return null;
};

const MapComponent = ({ orderId }: MapComponentProps) => {
  const [trackedLocations, setTrackedLocations] = useState<any[]>([]);
  const { user } = useSelector((state: RootState) => state.auth);
  const { ordersList, driverOrders } = useSelector((state: RootState) => state.orders);
  
  const [pickupCoords, setPickupCoords] = useState<L.LatLng | null>(null);
  const [deliveryCoords, setDeliveryCoords] = useState<L.LatLng | null>(null);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  // Find the order if orderId is provided
  useEffect(() => {
    if (orderId) {
        const order = ordersList.find(o => o.id === orderId) || driverOrders.find(o => o.id === orderId);
        setCurrentOrder(order || null);
    }
  }, [orderId, ordersList, driverOrders]);

  // Geocode Addresses
  useEffect(() => {
    const geocode = async (address: string) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
            const data = await res.json();
            if (data && data.length > 0) {
                return L.latLng(parseFloat(data[0].lat), parseFloat(data[0].lon));
            }
        } catch (error) {
            console.error("Geocoding error:", error);
        }
        return null;
    };

    if (currentOrder) {
        if (!pickupCoords) geocode(currentOrder.pickupAddress).then(setPickupCoords);
        if (!deliveryCoords) geocode(currentOrder.deliveryAddress).then(setDeliveryCoords);
    }
  }, [currentOrder]);


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    let unsubscribe: (() => void) | undefined;

    const connectAndSubscribe = async () => {
      try {
        await trackingService.connect(token);

        const handleUpdate = (update: any) => {
            if (orderId) {
                // For specific order, match strict orderID if available, or driverID if assigned
                if (update.orderId === orderId) {
                     setTrackedLocations([update]);
                } else if (currentOrder?.driverId && update.driverId === currentOrder.driverId) {
                    // Fallback: if update doesn't have orderId but matches driver
                    setTrackedLocations([update]);
                }
            } else {
                // Admin mode
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
        } else {
            unsubscribe = trackingService.subscribeToAdminMap(handleUpdate);
        }
      } catch (error) {
        console.error("Tracking connection failed:", error);
      }
    };

    connectAndSubscribe();

    return () => {
        if (unsubscribe) unsubscribe();
    };
  }, [orderId, currentOrder, user]);

  // Use user's default location if available, otherwise default to Tanzania
  const defaultCenter: [number, number] = 
    (user?.defaultLatitude && user?.defaultLongitude) 
        ? [user.defaultLatitude, user.defaultLongitude] 
        : [-6.369, 34.888]; 

  // Calculate route line
  const routeLine = useMemo(() => {
    if (!currentOrder || trackedLocations.length === 0) return null;
    const driverLoc = L.latLng(trackedLocations[0].latitude, trackedLocations[0].longitude);
    
    // Draw line to Pickup if PENDING/ASSIGNED, or Delivery if PICKED_UP
    if (currentOrder.status === OrderStatus.ASSIGNED && pickupCoords) {
        return [driverLoc, pickupCoords];
    } else if (currentOrder.status === OrderStatus.PICKED_UP && deliveryCoords) {
        return [driverLoc, deliveryCoords];
    }
    return null;
  }, [currentOrder, trackedLocations, pickupCoords, deliveryCoords]);

  return (
    <div className="h-full w-full rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700 relative transition-colors">
      <MapContainer
        center={defaultCenter}
        zoom={user?.defaultLatitude ? 12 : 6} // Zoom in closer if using a specific city location
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController locations={trackedLocations} pickup={pickupCoords} delivery={deliveryCoords} />

        {/* Pickup Marker */}
        {pickupCoords && (
            <Marker position={pickupCoords} icon={PickupIcon}>
                <Popup>
                    <div className="font-semibold">Pickup Location</div>
                    <div className="text-sm text-gray-600">{currentOrder?.pickupAddress}</div>
                </Popup>
            </Marker>
        )}

        {/* Delivery Marker */}
        {deliveryCoords && (
            <Marker position={deliveryCoords} icon={DeliveryIcon}>
                <Popup>
                    <div className="font-semibold">Delivery Location</div>
                    <div className="text-sm text-gray-600">{currentOrder?.deliveryAddress}</div>
                </Popup>
            </Marker>
        )}

        {/* Driver Markers */}
        {trackedLocations.map((location) => (
            <Marker key={location.driverId} position={[location.latitude, location.longitude]} icon={DriverIcon}>
                <Popup>
                    <div className="font-semibold">Courier</div>
                    <div className="text-xs text-gray-500">ID: {location.driverId?.substring(0, 8)}</div>
                </Popup>
            </Marker>
        ))}

        {/* Connection Line */}
        {routeLine && (
            <Polyline 
                positions={routeLine} 
                pathOptions={{ color: '#3b82f6', weight: 4, dashArray: '10, 10', opacity: 0.7 }} 
            />
        )}
      </MapContainer>
      
      {/* Legend / Status Overlay for specific order */}
      {orderId && (
        <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-4 rounded-xl shadow-lg z-[1000] border border-slate-100 dark:border-slate-700 max-w-xs transition-colors">
            <h4 className="font-bold text-slate-800 dark:text-white mb-2">Tracking Shipment</h4>
            <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500 border border-white dark:border-slate-600 shadow-sm"></div>
                    <span className="text-slate-600 dark:text-slate-300">Pickup</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-900 dark:bg-slate-700 border border-white dark:border-slate-600 shadow-sm"></div>
                    <span className="text-slate-600 dark:text-slate-300">Driver</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 border border-white dark:border-slate-600 shadow-sm"></div>
                    <span className="text-slate-600 dark:text-slate-300">Destination</span>
                </div>
            </div>
            {currentOrder && (
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Status</span>
                    <div className="text-slate-800 dark:text-white font-medium">{currentOrder.status.replace('_', ' ')}</div>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default MapComponent;