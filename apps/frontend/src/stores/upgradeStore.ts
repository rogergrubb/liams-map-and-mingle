import { create } from 'zustand';

interface UpgradeState {
  isOpen: boolean;
  limitType: 'pin' | 'mingle' | 'message' | null;
  limitReached: number;
  currentPlan: 'free' | 'basic' | 'trial' | 'premium';
  showUpgradeModal: (params: {
    limitType: 'pin' | 'mingle' | 'message';
    limitReached: number;
    currentPlan: 'free' | 'basic' | 'trial' | 'premium';
  }) => void;
  hideUpgradeModal: () => void;
}

export const useUpgradeStore = create<UpgradeState>((set) => ({
  isOpen: false,
  limitType: null,
  limitReached: 0,
  currentPlan: 'free',
  
  showUpgradeModal: ({ limitType, limitReached, currentPlan }) => {
    set({ isOpen: true, limitType, limitReached, currentPlan });
  },
  
  hideUpgradeModal: () => {
    set({ isOpen: false, limitType: null, limitReached: 0 });
  },
}));

// Helper function to parse limit error and show modal
export function handleLimitError(error: any, defaultPlan: 'free' | 'basic' | 'trial' | 'premium' = 'free') {
  if (error?.response?.status === 429 && error?.response?.data?.action) {
    const { action, message } = error.response.data;
    
    // Extract number from message like "Daily pin limit reached (3)"
    const match = message?.match(/\((\d+)\)/);
    const limitReached = match ? parseInt(match[1]) : 0;
    
    useUpgradeStore.getState().showUpgradeModal({
      limitType: action,
      limitReached,
      currentPlan: defaultPlan,
    });
    
    return true; // Handled
  }
  return false; // Not a limit error
}
