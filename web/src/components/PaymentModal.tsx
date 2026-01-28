import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { createPaymentIntent, resetPaymentState } from '../store/slices/paymentSlice';
import { X, CreditCard, CheckCircle } from 'lucide-react';

interface PaymentModalProps {
  orderId: string;
  amount: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentModal = ({ orderId, amount, isOpen, onClose, onSuccess }: PaymentModalProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, success } = useSelector((state: RootState) => state.payment);

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        onSuccess();
        dispatch(resetPaymentState());
        onClose();
      }, 2000);
    }
  }, [success, onSuccess, dispatch, onClose]);

  const handlePayment = () => {
    dispatch(createPaymentIntent({
      orderId,
      amount,
      currency: 'usd'
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-6">
          <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="text-blue-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Complete Payment</h2>
          <p className="text-slate-500 mt-2">Order #{orderId.slice(0, 8)}</p>
        </div>

        {success ? (
          <div className="text-center py-6">
            <CheckCircle className="mx-auto text-green-500 mb-2" size={48} />
            <p className="text-green-600 font-bold text-lg">Payment Successful!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg flex justify-between items-center">
              <span className="text-slate-600 font-medium">Total Amount</span>
              <span className="text-slate-900 font-bold text-lg">${(amount / 100).toFixed(2)}</span>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                {error}
              </div>
            )}

            <button
              onClick={handlePayment}
              disabled={loading}
              className={`w-full py-3 rounded-lg font-bold text-white transition-colors ${
                loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Processing...' : 'Pay Now'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
