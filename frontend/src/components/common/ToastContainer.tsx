import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-scout-neon flex-shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />,
          info: <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />,
        };

        const borderStyles = {
          success: 'border-scout-neon/50 shadow-neon-sm',
          warning: 'border-amber-500/50',
          error: 'border-rose-500/50',
          info: 'border-blue-500/50',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto bg-[#14171E] border ${borderStyles[toast.type]} p-3.5 shadow-2xl flex items-start gap-3 transition-all duration-200 animate-in slide-in-from-right`}
          >
            {icons[toast.type]}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                {toast.title}
              </h4>
              <p className="text-xs text-scout-muted mt-0.5 leading-snug">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-scout-dim hover:text-white p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
