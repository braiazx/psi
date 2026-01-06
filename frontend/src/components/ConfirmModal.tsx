"use client";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: "danger" | "warning" | "info";
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  type = "danger",
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const colors = {
    danger: "bg-rose-500/20 border-rose-500/50 text-rose-200",
    warning: "bg-amber-500/20 border-amber-500/50 text-amber-200",
    info: "bg-blue-500/20 border-blue-500/50 text-blue-200",
  };

  const buttonColors = {
    danger: "bg-rose-500 hover:bg-rose-600",
    warning: "bg-amber-500 hover:bg-amber-600",
    info: "bg-blue-500 hover:bg-blue-600",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={onCancel}
    >
      <div
        className={`
          relative w-full max-w-md rounded-2xl border bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl
          animate-in fade-in zoom-in-95 duration-200
          ${colors[type]}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-2 text-lg font-bold text-white">{title}</h3>
        <p className="mb-6 text-sm text-slate-300">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`
              flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition
              ${buttonColors[type]}
            `}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}




