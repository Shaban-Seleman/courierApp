import { useState } from 'react';
import { X, Star } from 'lucide-react';
import api from '../services/api';

interface RatingModalProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
}

const RatingModal = ({ orderId, isOpen, onClose }: RatingModalProps) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setSubmitting(true);
    try {
      await api.post(`/orders/${orderId}/rate`, { rating, feedback });
      onClose();
    } catch (error) {
      console.error('Failed to submit rating', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">Rate Driver</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none transition-transform hover:scale-110"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
              >
                <Star
                  size={32}
                  fill={(hoveredStar || rating) >= star ? "#fbbf24" : "none"}
                  className={(hoveredStar || rating) >= star ? "text-amber-400" : "text-slate-300"}
                />
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Feedback (Optional)</label>
            <textarea
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 placeholder:text-slate-400"
              rows={3}
              placeholder="How was the delivery experience?"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={submitting || rating === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Rating'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;