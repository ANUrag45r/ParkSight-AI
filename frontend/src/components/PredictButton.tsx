import React from 'react';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';

interface PredictButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

const PredictButton: React.FC<PredictButtonProps> = ({ onClick, isLoading }) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`predict-btn w-full py-3.5 px-6 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 mt-4 ${
        isLoading ? 'opacity-90 cursor-not-allowed' : ''
      }`}
      style={{
        boxShadow: '0 0 30px rgba(100,70,255,0.4), 0 4px 15px rgba(0,0,0,0.3)'
      }}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-white/80" />
          Predicting...
        </>
      ) : (
        <>
          <Sparkles className="w-3.5 h-3.5 text-white/80" />
          Predict Violations
          <ArrowRight className="w-4 h-4 text-white/80" />
        </>
      )}
    </button>
  );
};

export default PredictButton;
