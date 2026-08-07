import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { useToastStore, type ToastType } from "@/store/toast";
import { cn } from "@/utils/cn";

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-success" />,
  error: <AlertCircle className="h-5 w-5 text-error" />,
  info: <Info className="h-5 w-5 text-primary" />,
  warning: <AlertTriangle className="h-5 w-5 text-warning" />,
};

const colorClasses: Record<ToastType, string> = {
  success: "border-success/30",
  error: "border-error/30",
  info: "border-primary/30",
  warning: "border-warning/30",
};

export function Toaster() {
  const { toasts, dismissToast } = useToastStore();

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[200] flex w-full max-w-sm flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-xl border bg-card/95 p-4 shadow-xl backdrop-blur-xl",
              colorClasses[toast.type],
            )}
            role="alert"
          >
            <div className="mt-0.5 shrink-0">{icons[toast.type]}</div>
            <div className="min-w-0 flex-1">
              {toast.title && (
                <p className="text-sm font-semibold text-foreground">
                  {toast.title}
                </p>
              )}
              <p className="text-sm text-secondary-text">{toast.message}</p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="shrink-0 rounded-md p-1 text-muted transition-colors hover:bg-border/40 hover:text-foreground"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
