import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message = 'Loading platform telemetry...', size = 'md' }) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="p-3 rounded-full bg-sky-50 border border-sky-100 mb-3">
        <Loader2 className={`${sizeMap[size] || sizeMap.md} text-sky-600 animate-spin`} />
      </div>
      {message && <p className="text-xs font-semibold text-slate-600 animate-pulse">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
