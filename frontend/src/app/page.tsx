"use client";

import { useEffect, useMemo, useState } from "react";

type HealthStatus = "checking" | "online" | "offline";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState<HealthStatus>("checking");

  const apiUrl = useMemo(
    () => process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
    []
  );

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/health`, { cache: "no-store" });
        if (!res.ok) throw new Error("offline");
        setHealth("online");
      } catch (err) {
        setHealth("offline");
      }
    };
    checkHealth();
  }, [apiUrl]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setLoading(true);

    // Simula chamada ao backend
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (username.trim() === "adm" && password === "adm") {
      setMessage("Login bem-sucedido! Redirecionando...");
      setTimeout(() => {
        window.location.href = "/inicio";
      }, 600);
    } else {
      setMessage("Usuário ou senha inválidos. Dica: adm / adm");
    }

    setLoading(false);
  };

  const badgeColor =
    health === "online"
      ? "bg-purple-500/20 text-purple-200"
      : health === "offline"
        ? "bg-rose-500/15 text-rose-200"
        : "bg-slate-500/20 text-slate-200";

  const badgeText =
    health === "online"
      ? "Backend online"
      : health === "offline"
        ? "Backend offline"
        : "Verificando backend...";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b0416] text-slate-50">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(147,51,234,0.22),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(99,102,241,0.22),transparent_22%),radial-gradient(circle_at_65%_75%,rgba(192,132,252,0.2),transparent_28%)]" />
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-purple-500/30 via-fuchsia-500/25 to-indigo-500/25 blur-3xl" />
      </div>

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-12 sm:px-8">
        <div className="grid w-full grid-cols-1 overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_10px_120px_rgba(15,23,42,0.55)] backdrop-blur-xl lg:grid-cols-2">
          <div className="relative hidden h-full flex-col justify-between bg-gradient-to-br from-purple-700 via-purple-900 to-[#0b0416] p-10 text-white lg:flex">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-purple-100">
                Ordenate
              </p>
              <h1 className="mt-2 text-xl font-semibold leading-tight text-white">
                Psicologia Organizacional
              </h1>
            </div>

            <div className="mt-auto space-y-4">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 shadow-lg shadow-purple-900/50">
                <h2 className="text-lg font-semibold">Destaques</h2>
                <ul className="mt-3 space-y-2 text-sm text-purple-100/90">
                  <li className="flex items-center gap-2">
                    <span className="text-purple-200">●</span> Dashboard de
                    clima e engajamento
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-200">●</span> Acompanhamento
                    individual e por equipe
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-200">●</span> Questionários e
                    trilhas customizadas
                  </li>
                </ul>
              </div>
              <div className="flex items-center gap-3 text-sm text-purple-100/90">
                <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md" />
                <div>
                  <p className="font-semibold">Equipe dedicada</p>
                  <p>Pronta para apoiar RH, líderes e colaboradores.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative bg-[#0b0416]/80 p-8 sm:p-10">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Acesso restrito
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Login - Ordenate
                </h2>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeColor}`}>
                {badgeText}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">
                  Usuário
                </label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Digite seu usuário"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none transition focus:border-purple-400 focus:bg-white/10"
                  autoComplete="username"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-200">
                    Senha
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="text-xs font-semibold text-purple-200 hover:text-purple-100"
                  >
                    {showPassword ? "Ocultar" : "Mostrar"} senha
                  </button>
                </div>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none transition focus:border-purple-400 focus:bg-white/10"
                  autoComplete="current-password"
                  required
                />
              </div>

              <div className="flex items-center justify-between text-sm text-slate-300">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-white/10 text-purple-500 focus:ring-purple-400"
                  />
                  Lembrar acesso
                </label>
                <a
                  href="#"
                  className="font-semibold text-purple-200 hover:text-purple-100"
                >
                  Esqueci a senha
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-900/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white" />
                    Validando...
                  </>
                ) : (
                  <>
                    Entrar
                    <span className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </>
                )}
              </button>

              {message && (
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                  {message}
                </div>
              )}
            </form>

          </div>
        </div>
      </main>
    </div>
  );
}
