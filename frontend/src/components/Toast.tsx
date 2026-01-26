"use client";

import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastItem = ({ toast, onRemove }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Animação de entrada
    setTimeout(() => setIsVisible(true), 10);

    // Auto-remover após duração
    const timer = setTimeout(() => {
      handleRemove();
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 300);
  };

  const icons = {
    success: "✓",
    error: "✕",
    info: "ℹ",
    warning: "⚠",
  };

  const colors = {
    success: "bg-emerald-500/20 border-emerald-500/50 text-emerald-200",
    error: "bg-rose-500/20 border-rose-500/50 text-rose-200",
    info: "bg-blue-500/20 border-blue-500/50 text-blue-200",
    warning: "bg-amber-500/20 border-amber-500/50 text-amber-200",
  };

  return (
    <div
      className={`
        relative mb-3 flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm transition-all duration-300
        ${colors[toast.type]}
        ${isVisible && !isLeaving ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
      `}
    >
      <div className="flex-shrink-0 text-xl font-bold">{icons[toast.type]}</div>
      <div className="flex-1 text-sm font-medium">{toast.message}</div>
      <button
        onClick={handleRemove}
        className="flex-shrink-0 text-lg opacity-70 transition-opacity hover:opacity-100"
      >
        ×
      </button>
    </div>
  );
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handleToast = (event: CustomEvent<Toast>) => {
      const newToast: Toast = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        ...event.detail,
      };
      setToasts((prev) => [...prev, newToast]);
    };

    window.addEventListener("showToast" as any, handleToast as EventListener);
    return () => {
      window.removeEventListener("showToast" as any, handleToast as EventListener);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 top-4 z-50 w-full max-w-sm space-y-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}

// Função helper para mostrar toasts
export const showToast = (message: string, type: ToastType = "info", duration?: number) => {
  const event = new CustomEvent<Toast>("showToast", {
    detail: { message, type, duration },
  });
  window.dispatchEvent(event);
};















