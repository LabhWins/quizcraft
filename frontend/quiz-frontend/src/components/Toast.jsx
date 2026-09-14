import { useEffect, useRef } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

function Toast({ message, type, onClose, duration = 3500 }) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const timer = setTimeout(() => {
      onCloseRef.current?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration]);

  const isSuccess = type === 'success';

  return (
    <div
      className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium backdrop-blur-md transition-all animate-in slide-in-from-top-2 duration-200 ${
        isSuccess
          ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200 shadow-emerald-950/40'
          : 'bg-rose-950/90 border-rose-500/40 text-rose-200 shadow-rose-950/40'
      }`}
    >
      <div className="flex items-center gap-2.5">
        {isSuccess ? (
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
        ) : (
          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
        )}
        <span>{message}</span>
      </div>
      <button
        onClick={onClose}
        className="text-zinc-400 hover:text-white p-0.5 rounded-lg transition-colors cursor-pointer shrink-0"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default Toast;