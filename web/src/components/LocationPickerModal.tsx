import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, LayersControl } from 'react-leaflet';
import { X, Check } from 'lucide-react';
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

interface LocationPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectLocation: (address: string) => void;
    title?: string;
}

const LocationMarker = ({ setPosition }: { setPosition: (latlng: L.LatLng) => void }) => {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });
    return null;
};

const LocationPickerModal = ({ isOpen, onClose, onSelectLocation, title = "Select Location" }: LocationPickerModalProps) => {
    const [position, setPosition] = useState<L.LatLng | null>(null);
    const [address, setAddress] = useState<string>('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (position) {
            // Reverse Geocoding
            setLoading(true);
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}`, {
                headers: {
                    'User-Agent': 'CourierApp/1.0'
                }
            })
            .then(res => res.json())
            .then(data => {
                setAddress(data.display_name || `${position.lat}, ${position.lng}`);
            })
            .catch(err => {
                console.error("Geocoding failed", err);
                setAddress(`${position.lat}, ${position.lng}`);
            })
            .finally(() => setLoading(false));
        }
    }, [position]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (address) {
            onSelectLocation(address);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
             <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col h-[80vh]">
                <div className="flex justify-between items-center p-4 border-b border-gray-100 shrink-0">
                    <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 relative">
                    <MapContainer center={[-6.7924, 39.2083]} zoom={13} style={{ height: '100%', width: '100%' }}>
                        <LayersControl position="topright">
                            <LayersControl.BaseLayer checked name="Street">
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; OpenStreetMap contributors'
                                    maxZoom={19}
                                />
                            </LayersControl.BaseLayer>
                            <LayersControl.BaseLayer name="Satellite">
                                <TileLayer
                                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                                    attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                                    maxZoom={19}
                                />
                            </LayersControl.BaseLayer>
                        </LayersControl>
                        
                        <LocationMarker setPosition={setPosition} />
                        {position && <Marker position={position} />}
                    </MapContainer>
                    
                    {/* Address Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 bg-white p-4 rounded-xl shadow-lg z-[1000] border border-gray-200">
                        <p className="text-sm text-gray-500 mb-1">Selected Address:</p>
                        <p className="font-medium text-gray-800 truncate">
                            {loading ? 'Fetching address...' : (address || 'Click on map to select location')}
                        </p>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
                     <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg">Cancel</button>
                     <button 
                        onClick={handleConfirm}
                        disabled={!address || loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                     >
                        <Check size={18} /> Confirm Location
                     </button>
                </div>
             </div>
        </div>
    );
};

export default LocationPickerModal;