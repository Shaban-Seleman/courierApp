import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import { Order } from '../store/slices/orderSlice';

interface PoDModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

const PoDModal = ({ order, isOpen, onClose }: PoDModalProps) => {
  if (!isOpen || !order) return null;

  // Assuming MinIO URLs need a base if they are relative.
  // The backend might return a full URL or a relative path.
  // If local dev with Docker, 'minio:9000' is not reachable from browser.
  // We need to proxy or assume 'localhost:9000' for dev.
  const getPublicUrl = (url: string) => {
      if (!url) return '';
      if (url.startsWith('http')) return url;
      // Replace minio internal host with localhost for dev
      return `http://localhost:9000/courier-pod/${url}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-800">
            Proof of Delivery - #{order.id.substring(0, 8)}
          </h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[80vh]">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-700">Delivery Photo</h4>
              <div className="aspect-square bg-gray-50 rounded-xl border border-gray-200 overflow-hidden flex items-center justify-center relative group">
                {order.photoUrl ? (
                    <>
                      <img 
                        src={getPublicUrl(order.photoUrl)} 
                        alt="Delivery" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=Image+Not+Found';
                        }}
                      />
                      <a 
                        href={getPublicUrl(order.photoUrl)} 
                        target="_blank" 
                        rel="noreferrer"
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                         <ExternalLink className="text-white" />
                      </a>
                    </>
                ) : (
                    <span className="text-gray-400 text-sm">No Photo Available</span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-700">Recipient Signature</h4>
              <div className="aspect-video bg-gray-50 rounded-xl border border-gray-200 overflow-hidden flex items-center justify-center relative group">
                 {order.signatureUrl ? (
                    <>
                      <img 
                        src={getPublicUrl(order.signatureUrl)} 
                        alt="Signature" 
                        className="w-full h-full object-contain p-4"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/600x200?text=Signature+Not+Found';
                        }}
                      />
                      <a 
                        href={getPublicUrl(order.signatureUrl)} 
                        target="_blank" 
                        rel="noreferrer"
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                         <ExternalLink className="text-white" />
                      </a>
                    </>
                ) : (
                    <span className="text-gray-400 text-sm">No Signature Available</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-xl space-y-2">
            <div className="flex justify-between">
                <span className="text-gray-500">Delivered on:</span>
                <span className="font-medium text-gray-800">
                    {new Date(order.updatedAt).toLocaleString()}
                </span>
            </div>
             <div className="flex justify-between">
                <span className="text-gray-500">Driver:</span>
                <span className="font-medium text-gray-800">
                    {order.driverName || 'Unknown'}
                </span>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PoDModal;
