"use client";

export default function LoadingSection() {
  return (
    <div className="mt-8 flex flex-col items-center justify-center py-20 animate-fade-in">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
      <p className="mt-4 text-slate-400">Carregando...</p>
    </div>
  );
}

