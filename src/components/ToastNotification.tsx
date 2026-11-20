import { CheckCircle2, X } from 'lucide-react';
import { useEffect } from 'react';

interface ToastNotificationProps {
  message: string | null;
  title?: string;
  onClose: () => void;
  durationMs?: number;
}

export function ToastNotification({
  message,
  title = 'Confirmación',
  onClose,
  durationMs = 4200,
}: ToastNotificationProps) {
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(onClose, durationMs);
    return () => window.clearTimeout(timer);
  }, [message, durationMs, onClose]);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 max-w-sm w-[calc(100vw-2.5rem)] bg-[#0A0B0D] text-white border-2 border-[#F5B700] rounded-lg shadow-2xl p-4 flex items-start gap-3"
    >
      <CheckCircle2
        className="w-5 h-5 text-[#F5B700] shrink-0 mt-0.5"
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-[#F5B700] uppercase tracking-wide">
          {title}
        </p>
        <p className="text-xs sm:text-sm text-[#E8EAEF] mt-0.5 leading-snug">
          {message}
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar notificación"
        className="w-7 h-7 rounded flex items-center justify-center text-[#A6ACB5] hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
