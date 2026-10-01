import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertTriangle, AlertCircle, ShieldAlert } from 'lucide-react';

const StatusBadge = ({ status }) => {
  if (!status) return null;

  const normalized = String(status).toUpperCase();

  let style = 'bg-slate-100 text-slate-700 border-slate-200';
  let Icon = null;

  switch (normalized) {
    case 'APPROVED':
    case 'ACTIVE':
    case 'FINALIZED':
    case 'PAID':
    case 'INSTALLED':
    case 'SUCCESS':
    case 'RESOLVED':
    case 'ACKNOWLEDGED':
      style = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      Icon = CheckCircle2;
      break;

    case 'PENDING':
    case 'UNPAID':
    case 'MUNICIPAL_SUPPLY':
      style = 'bg-amber-50 text-amber-700 border-amber-200/80';
      Icon = Clock;
      break;

    case 'OPEN':
    case 'PROCESSING':
      style = 'bg-sky-50 text-sky-700 border-sky-200/80';
      Icon = Clock;
      break;

    case 'REJECTED':
    case 'ARCHIVED':
    case 'INACTIVE':
    case 'NOT_CONFIGURED':
    case 'FAILED':
    case 'OVERDUE':
    case 'CLOSED':
    case 'UNRESOLVED':
      style = 'bg-rose-50 text-rose-700 border-rose-200/80';
      Icon = XCircle;
      break;

    case 'OVERUSE':
    case 'TANKER':
      style = 'bg-amber-50 text-amber-800 border-amber-300';
      Icon = AlertTriangle;
      break;

    case 'ANOMALY':
      style = 'bg-rose-50 text-rose-800 border-rose-300 font-bold';
      Icon = ShieldAlert;
      break;

    default:
      style = 'bg-slate-100 text-slate-700 border-slate-200';
      Icon = AlertCircle;
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold rounded-full border shadow-2xs ${style}`}>
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      <span>{normalized.replace('_', ' ')}</span>
    </span>
  );
};

export default StatusBadge;
