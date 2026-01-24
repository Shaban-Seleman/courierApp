import MapComponent from '../components/MapComponent';

const MapPage = () => {
  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Live Map</h1>
          <p className="text-slate-500 text-sm">Real-time tracking of all active couriers.</p>
        </div>
        <div className="flex gap-2">
            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Live Updates
            </span>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
        <MapComponent />
        
        {/* Overlay Legend */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-slate-200 z-[1000] text-sm space-y-2">
            <h4 className="font-semibold text-slate-800 mb-2">Map Legend</h4>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-slate-600">Active Driver</span>
            </div>
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                <span className="text-slate-600">Offline/Idle</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
