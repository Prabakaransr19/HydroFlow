import React from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';

const Alert = ({ type = 'error', message }) => {
  if (!message) return null;

  const styles = {
    error: 'bg-rose-50 border-rose-200 text-rose-800',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    info: 'bg-sky-50 border-sky-200 text-sky-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
  };

  const icons = {
    error: XCircle,
    success: CheckCircle2,
    info: Info,
    warning: AlertTriangle,
  };

  const Icon = icons[type] || icons.error;

  return (
    <div className={`p-3.5 rounded-xl border text-xs font-semibold flex items-start gap-2.5 shadow-2xs ${styles[type] || styles.error}`} role="alert">
      <Icon className="w-4 h-4 shrink-0 mt-0.5" />
      <span className="leading-relaxed">{message}</span>
    </div>
  );
};

export default Alert;
