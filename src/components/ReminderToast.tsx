import { BellRing, X } from 'lucide-react';

export interface ActiveToast {
  id: string;
  title: string;
  body: string;
}

interface ReminderToastProps {
  toast: ActiveToast | null;
  onDismiss: () => void;
}

export function ReminderToast({ toast, onDismiss }: ReminderToastProps) {
  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 md:bottom-6 right-4 left-4 sm:left-auto sm:w-96 z-50 rounded-2xl border border-[#0E5A46]/30 dark:border-[#34D399]/30 bg-white dark:bg-[#121B19] shadow-lg p-4 flex items-start gap-3"
    >
      <div className="w-9 h-9 rounded-xl bg-[#0E5A46]/10 dark:bg-[#34D399]/15 text-[#0E5A46] dark:text-[#34D399] flex items-center justify-center shrink-0">
        <BellRing className="w-5 h-5" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#171B1A] dark:text-[#EEF2F0]">
          {toast.title}
        </p>
        <p className="text-xs text-[#5A6360] dark:text-[#98A6A1] mt-0.5">
          {toast.body}
        </p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Скрыть уведомление"
        className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-[#6A7370] hover:text-[#171B1A] dark:hover:text-white cursor-pointer"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}
