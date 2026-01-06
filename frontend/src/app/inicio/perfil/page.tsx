"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { savePerfil, loadPerfil } from "@/utils/localStorage";

export default function Perfil() {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [profile, setProfile] = useState({
    nome: "Usuário Ordenate",
    idade: "",
    genero: "",
    pronomes: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const carregarPerfil = async () => {
      const dados = await loadPerfil();
      if (dados) {
        setProfile({
          nome: dados.nome || "Usuário Ordenate",
          idade: dados.idade || "",
          genero: dados.genero || "",
          pronomes: dados.pronomes || "",
        });
        setPhotoPreview(dados.foto || null);
      }
    };
    carregarPerfil();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    const payload = {
      nome: profile.nome,
      idade: profile.idade,
      genero: profile.genero,
      pronomes: profile.pronomes,
      foto: photoPreview,
    };
    
    // Salvar na pasta local
    await savePerfil(payload);
    
    // Disparar evento customizado para atualizar outras abas/páginas
    window.dispatchEvent(new Event("perfilAtualizado"));
    
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#0b0416] text-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Perfil</p>
            <h1 className="text-2xl font-semibold text-white">Meu perfil</h1>
            <p className="text-sm text-slate-400">Edite nome, idade, gênero, pronomes e foto.</p>
          </div>
          <Link
            href="/inicio"
            className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-100 hover:bg-white/10 transition"
          >
            Voltar
          </Link>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm text-slate-200">Nome</label>
                <input
                  value={profile.nome}
                  onChange={(e) => setProfile((p) => ({ ...p, nome: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-slate-100 outline-none focus:border-purple-400"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-200">Idade</label>
                <input
                  value={profile.idade}
                  onChange={(e) => setProfile((p) => ({ ...p, idade: e.target.value }))}
                  type="number"
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-slate-100 outline-none focus:border-purple-400"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm text-slate-200">Gênero</label>
                <input
                  value={profile.genero}
                  onChange={(e) => setProfile((p) => ({ ...p, genero: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-slate-100 outline-none focus:border-purple-400"
                  placeholder="Ex.: Feminino, Masculino, Não-binário"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-200">Pronomes</label>
                <input
                  value={profile.pronomes}
                  onChange={(e) => setProfile((p) => ({ ...p, pronomes: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-slate-100 outline-none focus:border-purple-400"
                  placeholder="Ex.: ela/dela, ele/dele, elu/delu"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className={`mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-900/40 transition ${
                  saving ? "animate-pulse opacity-80" : "hover:brightness-110"
                } disabled:cursor-not-allowed disabled:opacity-70`}
              >
                {saving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Salvando...
                  </>
                ) : (
                  "Salvar perfil"
                )}
              </button>
              {saved && <span className="text-sm text-emerald-200">Salvo com sucesso!</span>}
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-white/10 bg-white/10 p-4">
            <p className="text-sm font-semibold text-white">Foto de perfil</p>
            <div className="flex items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-purple-600">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Foto de perfil"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xl">👤</span>
                )}
              </div>
              <label className="cursor-pointer rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-slate-100 hover:bg-white/15 transition">
                Selecionar foto
                <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
              </label>
            </div>
            <p className="text-xs text-slate-400">
              Formatos: PNG/JPG. A imagem não é enviada ao servidor nesta versão (apenas pré-visualização).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

