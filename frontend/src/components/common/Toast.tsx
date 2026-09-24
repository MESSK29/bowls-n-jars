import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertCircle, Info, X } from 'lucide-react';
import { ceramicAudio } from '../../utils/sound';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `${Date.now()}-${Math.random()}`;
    const newToast: ToastMessage = { ...toast, id, duration: toast.duration || 3500 };

    setToasts((prev) => [...prev, newToast]);

    // Play subtle ceramic sound
    if (toast.type === 'success') {
      ceramicAudio.playClink();
    } else {
      ceramicAudio.playTap();
    }

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, newToast.duration);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Notification Container */}
      <div className="fixed top-24 right-4 sm:right-6 z-[70] flex flex-col space-y-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-warm-lg border border-sand-300 relative overflow-hidden"
            >
              <div className="flex items-start space-x-3">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    toast.type === 'success'
                      ? 'bg-sage-100 text-sage-700'
                      : toast.type === 'error'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-terracotta-100 text-terracotta-700'
                  }`}
                >
                  {toast.type === 'success' ? (
                    <Check className="w-4 h-4" />
                  ) : toast.type === 'error' ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : (
                    <Info className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0 pr-2">
                  <h4 className="font-heading text-xs font-bold text-clay-900 leading-tight">
                    {toast.title}
                  </h4>
                  {toast.description && (
                    <p className="text-[11px] text-clay-600 mt-0.5 leading-snug">
                      {toast.description}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-clay-400 hover:text-clay-700 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Progress bar line */}
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: (toast.duration || 3500) / 1000, ease: 'linear' }}
                className={`absolute bottom-0 left-0 h-0.5 ${
                  toast.type === 'success'
                    ? 'bg-sage-600'
                    : toast.type === 'error'
                    ? 'bg-red-500'
                    : 'bg-terracotta-500'
                }`}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
