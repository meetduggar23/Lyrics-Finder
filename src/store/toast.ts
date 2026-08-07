import { create } from "zustand";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
}

interface ToastState {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
}

let toastCounter = 0;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  showToast: (toast) => {
    const id = `toast-${++toastCounter}-${Date.now()}`;
    const newToast = { ...toast, id };
    set({ toasts: [...get().toasts, newToast] });

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      get().dismissToast(id);
    }, 4000);
  },

  dismissToast: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },

  clearToasts: () => set({ toasts: [] }),
}));

// Convenience helpers
export function toastSuccess(message: string, title?: string) {
  useToastStore.getState().showToast({ type: "success", message, title });
}

export function toastError(message: string, title?: string) {
  useToastStore.getState().showToast({ type: "error", message, title });
}

export function toastInfo(message: string, title?: string) {
  useToastStore.getState().showToast({ type: "info", message, title });
}

export function toastWarning(message: string, title?: string) {
  useToastStore.getState().showToast({ type: "warning", message, title });
}
