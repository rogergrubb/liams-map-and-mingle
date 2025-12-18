import { useState } from 'react';
import { X, Zap, Crown, Check } from 'lucide-react';
import api from '../../lib/api';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: 'free' | 'basic' | 'trial' | 'premium';
  limitType: 'pin' | 'mingle' | 'message';
  limitReached: number;
}

const planDetails = {
  free: { name: 'Free', pins: 3, mingles: 2, messages: 20 },
  trial: { name: 'Trial', pins: 50, mingles: 20, messages: 1000 },
  basic: { name: 'Basic', pins: 10, mingles: 5, messages: 100, price: '$2.99/mo' },
  premium: { name: 'Premium', pins: 'Unlimited', mingles: 'Unlimited', messages: 'Unlimited', price: '$4.99/mo' },
};

const limitLabels = {
  pin: 'pins',
  mingle: 'mingles', 
  message: 'messages',
};

export function UpgradeModal({ isOpen, onClose, currentPlan, limitType, limitReached }: UpgradeModalProps) {
  const [loading, setLoading] = useState<'basic' | 'premium' | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const current = planDetails[currentPlan];
  const limitLabel = limitLabels[limitType];

  const handleUpgrade = async (tier: 'basic' | 'premium') => {
    setLoading(tier);
    setError(null);
    
    try {
      const response = await api.post('/api/subscription/create-checkout', { tier });
      
      if (response?.url) {
        window.location.href = response.url;
      } else {
        setError('Failed to start checkout. Please try again.');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const showBasicOption = currentPlan === 'free' || currentPlan === 'trial';
  const showPremiumOption = currentPlan !== 'premium';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-5 text-white">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Zap size={22} className="text-yellow-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold">You've hit your limit!</h2>
              <p className="text-white/80 text-sm">
                {limitReached} {limitLabel} today on {current.name} plan
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-5">
            Upgrade now to keep connecting with your community.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {/* Basic Option */}
            {showBasicOption && (
              <button
                onClick={() => handleUpgrade('basic')}
                disabled={loading !== null}
                className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50/50 transition-all text-left group disabled:opacity-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <Zap size={20} className="text-purple-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Basic</div>
                      <div className="text-sm text-gray-500">10 pins • 5 mingles • 100 msgs/day</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-purple-600">$2.99</div>
                    <div className="text-xs text-gray-400">/month</div>
                  </div>
                </div>
                {loading === 'basic' && (
                  <div className="mt-2 text-center text-sm text-purple-600">Redirecting to checkout...</div>
                )}
              </button>
            )}

            {/* Premium Option */}
            {showPremiumOption && (
              <button
                onClick={() => handleUpgrade('premium')}
                disabled={loading !== null}
                className="w-full p-4 border-2 border-purple-400 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-all text-left group relative overflow-hidden disabled:opacity-50"
              >
                <div className="absolute top-0 right-0 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  BEST VALUE
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Crown size={20} className="text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Premium</div>
                      <div className="text-sm text-gray-500">Unlimited everything</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-purple-600">$4.99</div>
                    <div className="text-xs text-gray-400">/month</div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {['Unlimited pins', 'Unlimited mingles', 'Unlimited messages', 'Priority support'].map((feature) => (
                    <span key={feature} className="inline-flex items-center gap-1 text-xs bg-white/80 text-purple-700 px-2 py-1 rounded-full">
                      <Check size={12} /> {feature}
                    </span>
                  ))}
                </div>
                {loading === 'premium' && (
                  <div className="mt-2 text-center text-sm text-purple-600">Redirecting to checkout...</div>
                )}
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="mt-5 text-center">
            <button 
              onClick={onClose}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpgradeModal;
