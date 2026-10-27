import React from 'react';
import { EligibilityStatus } from '../types/index.js';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';

interface EligibilityBadgeProps {
  status: EligibilityStatus;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const EligibilityBadge: React.FC<EligibilityBadgeProps> = ({ status, score, size = 'md' }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'Eligible':
        return {
          bg: 'bg-emerald-50 border-emerald-300 text-emerald-800',
          icon: <CheckCircle2 className={size === 'lg' ? 'w-5 h-5 text-emerald-600' : 'w-4 h-4 text-emerald-600'} />,
          label: 'Eligible'
        };
      case 'Potentially Eligible':
        return {
          bg: 'bg-amber-50 border-amber-300 text-amber-800',
          icon: <AlertTriangle className={size === 'lg' ? 'w-5 h-5 text-amber-600' : 'w-4 h-4 text-amber-600'} />,
          label: 'Potentially Eligible'
        };
      case 'Ineligible':
        return {
          bg: 'bg-rose-50 border-rose-300 text-rose-800',
          icon: <XCircle className={size === 'lg' ? 'w-5 h-5 text-rose-600' : 'w-4 h-4 text-rose-600'} />,
          label: 'Ineligible'
        };
      case 'Insufficient Information':
      default:
        return {
          bg: 'bg-slate-100 border-slate-300 text-slate-700',
          icon: <HelpCircle className={size === 'lg' ? 'w-5 h-5 text-slate-500' : 'w-4 h-4 text-slate-500'} />,
          label: 'Insufficient Info'
        };
    }
  };

  const config = getBadgeConfig();
  const paddingClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-3.5 py-1.5 text-sm font-semibold' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border shadow-xs ${config.bg} ${paddingClass}`}>
      {config.icon}
      <span>{config.label}</span>
      {score !== undefined && (
        <span className="ml-1 px-1.5 py-0.2 bg-white/70 rounded-full font-bold text-[10px]">
          {score}% Match
        </span>
      )}
    </span>
  );
};
