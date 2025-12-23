"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

type Cliente = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  status: string;
  anotacoes: string;
  grupo: string;
  celular: string;
  cpf: string;
  rg: string;
  dataNascimento: string;
  genero: string;
  nomeSocial: boolean;
  planoFinanceiro: string;
  valorSessao: string;
  observacoes: string;
  endereco: string;
  adicionais: string;
  responsavel: string;
  humor?: string;
  tipo: "completo" | "rapido";
};

export default function Inicio() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [form, setForm] = useState({
    nome: "",
    grupo: "",
    email: "",
    celular: "",
    telefone: "",
    status: "Ativo",
    anotacoes: "",
    cpf: "",
    rg: "",
    dataNascimento: "",
    genero: "",
    nomeSocial: false,
    planoFinanceiro: "",
    valorSessao: "",
    observacoes: "",
    endereco: "",
    adicionais: "",
    responsavel: "",
  });
  const [filterStatus, setFilterStatus] = useState<string>("Todos");
  const [search, setSearch] = useState<string>("");
  const [activeSection, setActiveSection] = useState<string>("Clientes");
  const [activeTab, setActiveTab] = useState<string>("Cadastros");
  const [formRapido, setFormRapido] = useState({
    nome: "",
    idade: "",
    genero: "",
    humor: "",
  });
  const [perfil, setPerfil] = useState({
    nome: "Usuário Ordenate",
    idade: "",
    genero: "",
    pronomes: "",
    foto: null as string | null,
  });
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  
  // Filtros interativos para gráficos
  const [filtrosAtivos, setFiltrosAtivos] = useState<{
    tipo?: "completo" | "rapido";
    status?: string;
    genero?: string;
    humor?: string;
  }>({});

  // Função para aplicar filtros
  const aplicarFiltro = (campo: "tipo" | "status" | "genero" | "humor", valor: string | undefined) => {
    setFiltrosAtivos((prev) => {
      const novo = { ...prev };
      if (valor === undefined || valor === null) {
        delete novo[campo];
      } else {
        novo[campo] = valor as any;
      }
      return novo;
    });
  };

  // Função para limpar todos os filtros
  const limparFiltros = () => {
    setFiltrosAtivos({});
  };

  // Filtrar clientes baseado nos filtros ativos
  const clientesFiltradosParaGraficos = useMemo(() => {
    return clientes.filter((c) => {
      if (filtrosAtivos.tipo && c.tipo !== filtrosAtivos.tipo) return false;
      if (filtrosAtivos.status && c.status !== filtrosAtivos.status) return false;
      if (filtrosAtivos.genero && c.genero !== filtrosAtivos.genero) return false;
      if (filtrosAtivos.humor && c.humor !== filtrosAtivos.humor) return false;
      return true;
    });
  }, [clientes, filtrosAtivos]);

  // Carregar clientes do localStorage ao iniciar
  useEffect(() => {
    const clientesSalvos = localStorage.getItem("clientes_ordenate");
    if (clientesSalvos) {
      try {
        const parsed = JSON.parse(clientesSalvos);
        setClientes(parsed);
      } catch (e) {
        console.error("Erro ao carregar clientes:", e);
      }
    }
  }, []);

  // Salvar clientes no localStorage sempre que mudarem
  useEffect(() => {
    if (clientes.length > 0 || localStorage.getItem("clientes_ordenate")) {
      localStorage.setItem("clientes_ordenate", JSON.stringify(clientes));
    }
  }, [clientes]);

  useEffect(() => {
    const dadosSalvos = localStorage.getItem("perfil_ordenate");
    if (dadosSalvos) {
      try {
        const parsed = JSON.parse(dadosSalvos);
        setPerfil({
          nome: parsed.nome || "Usuário Ordenate",
          idade: parsed.idade || "",
          genero: parsed.genero || "",
          pronomes: parsed.pronomes || "",
          foto: parsed.foto || null,
        });
      } catch (e) {
        console.error("Erro ao carregar perfil:", e);
      }
    }
  }, []);

  // Escutar mudanças no localStorage (quando o perfil é salvo em outra aba)
  useEffect(() => {
    const handleStorageChange = () => {
      const dadosSalvos = localStorage.getItem("perfil_ordenate");
      if (dadosSalvos) {
        try {
          const parsed = JSON.parse(dadosSalvos);
          setPerfil({
            nome: parsed.nome || "Usuário Ordenate",
            idade: parsed.idade || "",
            genero: parsed.genero || "",
            pronomes: parsed.pronomes || "",
            foto: parsed.foto || null,
          });
        } catch (e) {
          console.error("Erro ao carregar perfil:", e);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    // Também escutar eventos customizados (quando salva na mesma aba)
    window.addEventListener("perfilAtualizado", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("perfilAtualizado", handleStorageChange);
    };
  }, []);

  // Filtrar clientes por tipo (completo ou rápido) baseado na aba ativa
  const clientesPorTipo = clientes.filter((c) => {
    if (activeTab === "Cadastros") {
      return c.tipo === "completo";
    } else {
      return c.tipo === "rapido";
    }
  });

  const clientesFiltrados = clientesPorTipo.filter((c) => {
    const matchStatus = filterStatus === "Todos" ? true : c.status === filterStatus;
    const termo = search.trim().toLowerCase();
    const matchSearch = termo
      ? [c.nome, c.email, c.telefone, c.celular, c.anotacoes, c.genero].some((field) =>
          (field || "").toLowerCase().includes(termo)
        )
      : true;
    return matchStatus && matchSearch;
  });

  // Função para exportar para Excel
  const exportarParaExcel = (tipo: "completo" | "rapido") => {
    const clientesParaExportar = clientes.filter((c) => c.tipo === tipo);
    
    if (clientesParaExportar.length === 0) {
      alert(`Nenhum ${tipo === "completo" ? "cliente completo" : "atendimento rápido"} para exportar.`);
      return;
    }

    // Preparar dados para Excel
    const dadosParaExcel = clientesParaExportar.map((c) => {
      if (tipo === "completo") {
        return {
          Nome: c.nome || "",
          Grupo: c.grupo || "",
          Email: c.email || "",
          Celular: c.celular || "",
          Telefone: c.telefone || "",
          CPF: c.cpf || "",
          RG: c.rg || "",
          "Data de Nascimento": c.dataNascimento || "",
          Gênero: c.genero || "",
          "Nome Social": c.nomeSocial ? "Sim" : "Não",
          Status: c.status || "",
          "Plano Financeiro": c.planoFinanceiro || "",
          "Valor da Sessão": c.valorSessao || "",
          Endereço: c.endereco || "",
          "Dados Adicionais": c.adicionais || "",
          Responsável: c.responsavel || "",
          Observações: c.observacoes || "",
          Anotações: c.anotacoes || "",
        };
      } else {
        return {
          Nome: c.nome || "",
          Idade: c.observacoes.replace("Idade: ", "") || "",
          Gênero: c.genero || "",
          "Humor no Atendimento": c.humor || "",
          Status: c.status || "",
          Anotações: c.anotacoes || "",
        };
      }
    });

    // Criar workbook e worksheet
    const ws = XLSX.utils.json_to_sheet(dadosParaExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, tipo === "completo" ? "Clientes Completos" : "Atendimentos Rápidos");

    // Gerar nome do arquivo com data
    const dataAtual = new Date().toISOString().split("T")[0];
    const nomeArquivo = tipo === "completo" 
      ? `clientes_completos_${dataAtual}.xlsx`
      : `atendimentos_rapidos_${dataAtual}.xlsx`;

    // Baixar arquivo
    XLSX.writeFile(wb, nomeArquivo);
  };

  return (
    <div className="min-h-screen bg-[#0b0416] text-slate-50">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-20 shrink-0 bg-[#0f0a1f] border-r border-white/10 flex flex-col items-center py-6 gap-4">
          {[
            { label: "Painel", icon: "🏠", image: "/icon-painel.png" },
            { label: "Clientes", icon: "👥", image: "/icon-clientes.png" },
            { label: "Agenda", icon: "📅", image: "/icon-agenda.png" },
            { label: "Financeiro", icon: "💳", image: "/icon-financeiro.png" },
            { label: "Relatórios", icon: "📊", image: "/icon-relatorio.png" },
            { label: "Marketing", icon: "📣", image: "/icon-marketing.png" },
          ].map((item) => {
            const isActive = activeSection === item.label;
            return (
              <button
                key={item.label}
                onClick={() => setActiveSection(item.label)}
                className={`flex h-12 w-12 items-center justify-center rounded-xl text-lg transition ${
                  isActive
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-900/50"
                    : "bg-white/5 text-slate-200 hover:bg-white/10"
                }`}
                title={item.label}
              >
                {item.image && !imageErrors[item.label] ? (
                  <Image
                    src={item.image}
                    alt={item.label}
                    width={24}
                    height={24}
                    className="object-contain brightness-0 invert"
                    onError={() => setImageErrors((prev) => ({ ...prev, [item.label]: true }))}
                  />
                ) : (
                  <span aria-hidden>{item.icon}</span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Main area */}
        <div className="flex-1 px-8 py-8">
          <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-white">
                {activeSection === "Clientes" ? "Cadastros" : activeSection}
              </h1>
              <p className="text-sm text-slate-400">
                {activeSection === "Clientes"
                  ? "Gerencie clientes, filas e grupos."
                  : "Em breve você poderá configurar esta área."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-purple-500/15 px-4 py-2 text-xs font-semibold text-purple-100 border border-purple-300/30">
                Ambiente: Desenvolvimento
              </span>
              <Link
                href="/inicio/perfil"
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-100 hover:bg-white/10 transition"
              >
                <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-purple-600 text-white">
                  {perfil.foto ? (
                    <Image
                      src={perfil.foto}
                      alt="Foto de perfil"
                      width={36}
                      height={36}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>👤</span>
                  )}
                </div>
                <div className="text-left leading-tight">
                  <p className="text-xs text-slate-300">Meu perfil</p>
                  <p className="text-sm font-semibold text-white">{perfil.nome}</p>
                </div>
              </Link>
            </div>
          </header>

          {activeSection === "Clientes" && (
            <>
              {/* Tabs */}
              <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold">
                {[
                  { name: "Cadastros", key: "Cadastros" },
                  { name: "Cadastro rápido", key: "Cadastro rápido" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`rounded-xl px-4 py-2 transition ${
                      activeTab === tab.key
                        ? "bg-white text-purple-700 shadow"
                        : "text-slate-200 hover:bg-white/5"
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </div>

              {/* Filters */}
              <div className="mt-6 space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-purple-900/30">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <label className="text-sm text-slate-200">Status:</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full max-w-xs rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-slate-100 outline-none focus:border-purple-400"
                  >
                    <option>Todos</option>
                    <option>Ativo</option>
                    <option>Inativo</option>
                    <option>Em avaliação</option>
                  </select>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <label className="text-sm text-slate-200">Pesquisar cliente:</label>
                  <div className="flex w-full max-w-lg items-center rounded-xl border border-white/10 bg-white/10 px-3 py-2">
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-400 outline-none"
                      placeholder="Comece a digitar..."
                    />
                    <span className="text-slate-300">🔍</span>
                  </div>
                </div>
              </div>

              {/* Form principal + lista */}
              {activeTab === "Cadastros" ? (
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                {/* Form lado esquerdo */}
                <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-purple-900/30 text-sm text-slate-200">
                  <h3 className="text-base font-semibold text-white">Cadastro completo</h3>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.15em] text-slate-400">Informações pessoais</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    placeholder="Nome completo *"
                    className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-slate-100 outline-none focus:border-purple-400"
                  />
                  <input
                    value={form.grupo}
                    onChange={(e) => setForm({ ...form, grupo: e.target.value })}
                    placeholder="Grupo (ex.: Equipe A)"
                    className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-slate-100 outline-none focus:border-purple-400"
                  />
                  <input
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="E-mail"
                    className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-slate-100 outline-none focus:border-purple-400"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={form.celular}
                      onChange={(e) => setForm({ ...form, celular: e.target.value })}
                      placeholder="Celular"
                      className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-slate-100 outline-none focus:border-purple-400"
                    />
                    <input
                      value={form.telefone}
                      onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                      placeholder="Telefone"
                      className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-slate-100 outline-none focus:border-purple-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={form.cpf}
                      onChange={(e) => setForm({ ...form, cpf: e.target.value })}
                      placeholder="CPF"
                      className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-slate-100 outline-none focus:border-purple-400"
                    />
                    <input
                      value={form.rg}
                      onChange={(e) => setForm({ ...form, rg: e.target.value })}
                      placeholder="RG"
                      className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-slate-100 outline-none focus:border-purple-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={form.dataNascimento}
                      onChange={(e) => setForm({ ...form, dataNascimento: e.target.value })}
                      placeholder="Data de nascimento"
                      className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-slate-100 outline-none focus:border-purple-400"
                    />
                    <input
                      value={form.genero}
                      onChange={(e) => setForm({ ...form, genero: e.target.value })}
                      placeholder="Gênero"
                      className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-slate-100 outline-none focus:border-purple-400"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-300">Cliente possui nome social?</label>
                    <button
                      onClick={() => setForm({ ...form, nomeSocial: !form.nomeSocial })}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        form.nomeSocial
                          ? "bg-purple-500/30 text-purple-100"
                          : "bg-white/10 text-slate-200"
                      }`}
                    >
                      {form.nomeSocial ? "Sim" : "Não"}
                    </button>
                  </div>
                  <textarea
                    value={form.observacoes}
                    onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                    placeholder="Observações"
                    className="md:col-span-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-slate-100 outline-none focus:border-purple-400"
                    rows={2}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.15em] text-slate-400">Informações financeiras</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    value={form.planoFinanceiro}
                    onChange={(e) => setForm({ ...form, planoFinanceiro: e.target.value })}
                    placeholder="Plano financeiro (ex.: por sessão)"
                    className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-slate-100 outline-none focus:border-purple-400"
                  />
                  <input
                    value={form.valorSessao}
                    onChange={(e) => setForm({ ...form, valorSessao: e.target.value })}
                    placeholder="Valor da sessão (R$)"
                    className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-slate-100 outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.15em] text-slate-400">Endereço</p>
                <textarea
                  value={form.endereco}
                  onChange={(e) => setForm({ ...form, endereco: e.target.value })}
                  placeholder="Endereço completo"
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-slate-100 outline-none focus:border-purple-400"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.15em] text-slate-400">Dados adicionais</p>
                <textarea
                  value={form.adicionais}
                  onChange={(e) => setForm({ ...form, adicionais: e.target.value })}
                  placeholder="Dados adicionais, preferências ou acordos"
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-slate-100 outline-none focus:border-purple-400"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.15em] text-slate-400">Responsável</p>
                <textarea
                  value={form.responsavel}
                  onChange={(e) => setForm({ ...form, responsavel: e.target.value })}
                  placeholder="Responsável financeiro ou legal (se aplicável)"
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-slate-100 outline-none focus:border-purple-400"
                  rows={2}
                />
              </div>

              <textarea
                value={form.anotacoes}
                onChange={(e) => setForm({ ...form, anotacoes: e.target.value })}
                placeholder="Anotações gerais"
                className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-slate-100 outline-none focus:border-purple-400"
                rows={2}
              />

              <button
                onClick={() => {
                  if (!form.nome.trim()) return;
                  const novo: Cliente = {
                    id: crypto.randomUUID(),
                    ...form,
                    tipo: "completo",
                  };
                  setClientes((c) => [novo, ...c]);
                  setForm({
                    nome: "",
                    grupo: "",
                    email: "",
                    celular: "",
                    telefone: "",
                    status: "Ativo",
                    anotacoes: "",
                    cpf: "",
                    rg: "",
                    dataNascimento: "",
                    genero: "",
                    nomeSocial: false,
                    planoFinanceiro: "",
                    valorSessao: "",
                    observacoes: "",
                    endereco: "",
                    adicionais: "",
                    responsavel: "",
                  });
                }}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-900/40 hover:brightness-110 transition"
              >
                Cadastrar cliente
              </button>
                </div>

                {/* Lista lado direito */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-purple-900/30 text-sm text-slate-200">
                  <h3 className="text-base font-semibold text-white">Clientes completos</h3>
                  <p className="text-xs text-slate-400 mt-1">Pessoas fixas em organizações</p>
                  {clientesFiltrados.length === 0 ? (
                    <p className="mt-3 text-slate-400 text-sm">
                      {activeTab === "Cadastros" 
                        ? "Nenhum cliente completo cadastrado ainda." 
                        : "Nenhum atendimento rápido cadastrado ainda."}
                    </p>
                  ) : (
                    <div className="mt-3 space-y-3">
                      {clientesFiltrados.map((c) => (
                        <div
                          key={c.id}
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 space-y-3"
                        >
                          <div className="flex items-start justify-between gap-2 text-slate-100">
                            <div className="space-y-1">
                              <p className="font-semibold">{c.nome}</p>
                              {c.grupo && <p className="text-slate-300 text-xs">{c.grupo}</p>}
                              {(c.email || c.telefone || c.celular) && (
                                <p className="text-slate-300 text-xs">
                                  {[c.email, c.telefone || c.celular].filter(Boolean).join(" • ")}
                                </p>
                              )}
                              {[c.cpf, c.rg, c.dataNascimento].some(Boolean) && (
                                <p className="text-slate-400 text-xs">
                                  {[
                                    c.cpf && `CPF: ${c.cpf}`,
                                    c.rg && `RG: ${c.rg}`,
                                    c.dataNascimento && `Nasc: ${c.dataNascimento}`,
                                  ]
                                    .filter(Boolean)
                                    .join(" | ")}
                                </p>
                              )}
                              {c.genero && <p className="text-slate-400 text-xs">Gênero: {c.genero}</p>}
                              {c.nomeSocial && <p className="text-slate-400 text-xs">Nome social: Sim</p>}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs text-purple-100">
                                {c.status}
                              </span>
                              <button
                                onClick={() => setClientes((list) => list.filter((x) => x.id !== c.id))}
                                className="rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-xs font-semibold text-rose-200 hover:bg-white/10"
                              >
                                Excluir
                              </button>
                            </div>
                          </div>

                          {(c.planoFinanceiro || c.valorSessao || c.endereco || c.adicionais || c.responsavel || c.observacoes) && (
                            <div className="grid gap-2 text-xs text-slate-300">
                              {(c.planoFinanceiro || c.valorSessao) && (
                                <p>
                                  {[
                                    c.planoFinanceiro && `Plano financeiro: ${c.planoFinanceiro}`,
                                    c.valorSessao && `Valor sessão: ${c.valorSessao}`,
                                  ]
                                    .filter(Boolean)
                                    .join(" | ")}
                                </p>
                              )}
                              {c.endereco && <p>Endereço: {c.endereco}</p>}
                              {c.adicionais && <p>Dados adicionais: {c.adicionais}</p>}
                              {c.responsavel && <p>Responsável: {c.responsavel}</p>}
                              {c.observacoes && <p>Observações: {c.observacoes}</p>}
                            </div>
                          )}

                          {c.humor && (
                            <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 px-3 py-2">
                              <p className="text-xs font-semibold text-purple-200 mb-1">Humor no atendimento</p>
                              <p className="text-sm text-purple-100">{c.humor}</p>
                            </div>
                          )}

                          <div className="space-y-2">
                            <label className="text-xs text-slate-300">Anotações</label>
                            <textarea
                              value={c.anotacoes}
                              onChange={(e) =>
                                setClientes((list) =>
                                  list.map((x) =>
                                    x.id === c.id ? { ...x, anotacoes: e.target.value } : x
                                  )
                                )
                              }
                              placeholder="Inclua histórico, próximos passos ou alertas."
                              className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-slate-100 outline-none focus:border-purple-400"
                              rows={2}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              ) : (
                /* Cadastro rápido */
                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-purple-900/30 text-sm text-slate-200">
                    <h3 className="text-base font-semibold text-white">Cadastro rápido</h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm text-slate-200">Nome completo *</label>
                        <input
                          value={formRapido.nome}
                          onChange={(e) => setFormRapido({ ...formRapido, nome: e.target.value })}
                          placeholder="Digite o nome completo"
                          className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-slate-100 outline-none focus:border-purple-400"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm text-slate-200">Idade</label>
                        <input
                          value={formRapido.idade}
                          onChange={(e) => setFormRapido({ ...formRapido, idade: e.target.value })}
                          type="number"
                          placeholder="Digite a idade"
                          className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-slate-100 outline-none focus:border-purple-400"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm text-slate-200">Gênero</label>
                        <input
                          value={formRapido.genero}
                          onChange={(e) => setFormRapido({ ...formRapido, genero: e.target.value })}
                          placeholder="Ex.: Feminino, Masculino, Não-binário"
                          className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-slate-100 outline-none focus:border-purple-400"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm text-slate-200">Humor no momento do atendimento *</label>
                        <div className="space-y-3">
                          {[
                            {
                              value: "Colaborativo",
                              descricao: "Indica um usuário receptivo, comunicativo e disposto ao diálogo. Demonstra abertura para orientações e mantém postura respeitosa durante o atendimento.",
                            },
                            {
                              value: "Neutro",
                              descricao: "Caracteriza um comportamento objetivo e contido. O usuário busca resolução direta da demanda, com pouca expressão emocional, sem sinais claros de satisfação ou insatisfação.",
                            },
                            {
                              value: "Tensionado",
                              descricao: "Reflete um estado de irritação, ansiedade ou frustração. Pode envolver impaciência, tom elevado ou cobrança insistente, geralmente associada a experiências prévias negativas ou demora na solução.",
                            },
                          ].map((humor) => (
                            <label
                              key={humor.value}
                              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                                formRapido.humor === humor.value
                                  ? "border-purple-400 bg-purple-500/20"
                                  : "border-white/10 bg-white/5 hover:bg-white/10"
                              }`}
                            >
                              <input
                                type="radio"
                                name="humor"
                                value={humor.value}
                                checked={formRapido.humor === humor.value}
                                onChange={(e) => setFormRapido({ ...formRapido, humor: e.target.value })}
                                className="mt-1 h-4 w-4 text-purple-500 focus:ring-purple-400"
                              />
                              <div className="flex-1">
                                <p className="font-semibold text-slate-100">{humor.value}</p>
                                <p className="mt-1 text-xs text-slate-300">{humor.descricao}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (!formRapido.nome.trim() || !formRapido.humor) return;
                          const novo: Cliente = {
                            id: crypto.randomUUID(),
                            nome: formRapido.nome,
                            email: "",
                            telefone: "",
                            status: "Ativo",
                            anotacoes: "",
                            grupo: "",
                            celular: "",
                            cpf: "",
                            rg: "",
                            dataNascimento: "",
                            genero: formRapido.genero,
                            nomeSocial: false,
                            planoFinanceiro: "",
                            valorSessao: "",
                            observacoes: formRapido.idade ? `Idade: ${formRapido.idade}` : "",
                            endereco: "",
                            adicionais: "",
                            responsavel: "",
                            humor: formRapido.humor,
                            tipo: "rapido",
                          };
                          setClientes((c) => [novo, ...c]);
                          setFormRapido({ nome: "", idade: "", genero: "", humor: "" });
                        }}
                        disabled={!formRapido.nome.trim() || !formRapido.humor}
                        className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-900/40 hover:brightness-110 transition disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Cadastrar cliente
                      </button>
                    </div>
                  </div>

                  {/* Lista lado direito */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-purple-900/30 text-sm text-slate-200">
                    <h3 className="text-base font-semibold text-white">Atendimentos rápidos</h3>
                    <p className="text-xs text-slate-400 mt-1">Atendimentos curtos em órgãos públicos</p>
                    {clientesFiltrados.length === 0 ? (
                      <p className="mt-3 text-slate-400 text-sm">Nenhum cliente cadastrado ainda.</p>
                    ) : (
                      <div className="mt-3 space-y-3">
                        {clientesFiltrados.map((c) => (
                          <div
                            key={c.id}
                            className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 space-y-3"
                          >
                            <div className="flex items-start justify-between gap-2 text-slate-100">
                              <div className="space-y-1">
                                <p className="font-semibold">{c.nome}</p>
                                {c.grupo && <p className="text-slate-300 text-xs">{c.grupo}</p>}
                                {(c.email || c.telefone || c.celular) && (
                                  <p className="text-slate-300 text-xs">
                                    {[c.email, c.telefone || c.celular].filter(Boolean).join(" • ")}
                                  </p>
                                )}
                                {[c.cpf, c.rg, c.dataNascimento].some(Boolean) && (
                                  <p className="text-slate-400 text-xs">
                                    {[
                                      c.cpf && `CPF: ${c.cpf}`,
                                      c.rg && `RG: ${c.rg}`,
                                      c.dataNascimento && `Nasc: ${c.dataNascimento}`,
                                    ]
                                      .filter(Boolean)
                                      .join(" | ")}
                                  </p>
                                )}
                                {c.genero && <p className="text-slate-400 text-xs">Gênero: {c.genero}</p>}
                                {c.nomeSocial && <p className="text-slate-400 text-xs">Nome social: Sim</p>}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs text-purple-100">
                                  {c.status}
                                </span>
                                <button
                                  onClick={() => setClientes((list) => list.filter((x) => x.id !== c.id))}
                                  className="rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-xs font-semibold text-rose-200 hover:bg-white/10"
                                >
                                  Excluir
                                </button>
                              </div>
                            </div>

                            {(c.planoFinanceiro || c.valorSessao || c.endereco || c.adicionais || c.responsavel || c.observacoes) && (
                              <div className="grid gap-2 text-xs text-slate-300">
                                {(c.planoFinanceiro || c.valorSessao) && (
                                  <p>
                                    {[
                                      c.planoFinanceiro && `Plano financeiro: ${c.planoFinanceiro}`,
                                      c.valorSessao && `Valor sessão: ${c.valorSessao}`,
                                    ]
                                      .filter(Boolean)
                                      .join(" | ")}
                                  </p>
                                )}
                                {c.endereco && <p>Endereço: {c.endereco}</p>}
                                {c.adicionais && <p>Dados adicionais: {c.adicionais}</p>}
                                {c.responsavel && <p>Responsável: {c.responsavel}</p>}
                                {c.observacoes && <p>Observações: {c.observacoes}</p>}
                              </div>
                            )}

                            {c.humor && (
                              <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 px-3 py-2">
                                <p className="text-xs font-semibold text-purple-200 mb-1">Humor no atendimento</p>
                                <p className="text-sm text-purple-100">{c.humor}</p>
                              </div>
                            )}

                            <div className="space-y-2">
                              <label className="text-xs text-slate-300">Anotações</label>
                              <textarea
                                value={c.anotacoes}
                                onChange={(e) =>
                                  setClientes((list) =>
                                    list.map((x) =>
                                      x.id === c.id ? { ...x, anotacoes: e.target.value } : x
                                    )
                                  )
                                }
                                placeholder="Inclua histórico, próximos passos ou alertas."
                                className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-slate-100 outline-none focus:border-purple-400"
                                rows={2}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {activeSection === "Painel" && (
            <div className="mt-8 space-y-6">
              {/* Indicador de Filtros Ativos */}
              {(Object.keys(filtrosAtivos).length > 0) && (
                <div className="rounded-2xl bg-purple-500/20 p-4 border border-purple-500/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-purple-200 font-semibold">Filtros ativos:</span>
                      {filtrosAtivos.tipo && (
                        <span className="rounded-full bg-purple-500/30 px-3 py-1 text-xs text-purple-100">
                          Tipo: {filtrosAtivos.tipo === "completo" ? "Completos" : "Rápidos"}
                        </span>
                      )}
                      {filtrosAtivos.status && (
                        <span className="rounded-full bg-purple-500/30 px-3 py-1 text-xs text-purple-100">
                          Status: {filtrosAtivos.status}
                        </span>
                      )}
                      {filtrosAtivos.genero && (
                        <span className="rounded-full bg-purple-500/30 px-3 py-1 text-xs text-purple-100">
                          Gênero: {filtrosAtivos.genero}
                        </span>
                      )}
                      {filtrosAtivos.humor && (
                        <span className="rounded-full bg-purple-500/30 px-3 py-1 text-xs text-purple-100">
                          Humor: {filtrosAtivos.humor}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={limparFiltros}
                      className="rounded-lg bg-purple-500/30 hover:bg-purple-500/40 px-4 py-2 text-sm font-semibold text-purple-100 transition"
                    >
                      Limpar Filtros
                    </button>
                  </div>
                </div>
              )}

              {/* Cards de Estatísticas */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-900/20 p-5 shadow-lg shadow-purple-900/30">
                  <p className="text-sm text-purple-200 mb-1">Total de Clientes</p>
                  <p className="text-3xl font-bold text-white">{clientesFiltradosParaGraficos.length}</p>
                  <p className="text-xs text-purple-300 mt-1">
                    {clientesFiltradosParaGraficos.filter((c) => c.tipo === "completo").length} completos +{" "}
                    {clientesFiltradosParaGraficos.filter((c) => c.tipo === "rapido").length} rápidos
                  </p>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-fuchsia-500/20 to-fuchsia-900/20 p-5 shadow-lg shadow-fuchsia-900/30">
                  <p className="text-sm text-fuchsia-200 mb-1">Clientes Ativos</p>
                  <p className="text-3xl font-bold text-white">
                    {clientesFiltradosParaGraficos.filter((c) => c.status === "Ativo").length}
                  </p>
                  <p className="text-xs text-fuchsia-300 mt-1">
                    {clientesFiltradosParaGraficos.length > 0
                      ? Math.round(
                          (clientesFiltradosParaGraficos.filter((c) => c.status === "Ativo").length / clientesFiltradosParaGraficos.length) * 100
                        )
                      : 0}
                    % do total
                  </p>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-indigo-500/20 to-indigo-900/20 p-5 shadow-lg shadow-indigo-900/30">
                  <p className="text-sm text-indigo-200 mb-1">Em Avaliação</p>
                  <p className="text-3xl font-bold text-white">
                    {clientesFiltradosParaGraficos.filter((c) => c.status === "Em avaliação").length}
                  </p>
                  <p className="text-xs text-indigo-300 mt-1">Requerem atenção</p>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-900/20 p-5 shadow-lg shadow-emerald-900/30">
                  <p className="text-sm text-emerald-200 mb-1">Atendimentos Rápidos</p>
                  <p className="text-3xl font-bold text-white">
                    {clientesFiltradosParaGraficos.filter((c) => c.tipo === "rapido").length}
                  </p>
                  <p className="text-xs text-emerald-300 mt-1">Este mês</p>
                </div>
              </div>

              {/* Gráficos */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Gráfico de Pizza - Distribuição por Tipo */}
                <div className="rounded-2xl bg-white/5 p-6 shadow-lg shadow-purple-900/30">
                  <h3 className="text-lg font-semibold text-white mb-4">Distribuição por Tipo</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: "Completos",
                            value: clientesFiltradosParaGraficos.filter((c) => c.tipo === "completo").length,
                          },
                          {
                            name: "Rápidos",
                            value: clientesFiltradosParaGraficos.filter((c) => c.tipo === "rapido").length,
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }: { name?: string; percent?: number }) => `${name || ""}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={800}
                        animationEasing="ease-out"
                        isAnimationActive={true}
                        onClick={(data: any) => {
                          if (!data || !data.name) return;
                          const tipoMap: Record<string, "completo" | "rapido"> = {
                            "Completos": "completo",
                            "Rápidos": "rapido"
                          };
                          const tipoSelecionado = tipoMap[data.name];
                          if (!tipoSelecionado) return;
                          if (filtrosAtivos.tipo === tipoSelecionado) {
                            aplicarFiltro("tipo", undefined);
                          } else {
                            aplicarFiltro("tipo", tipoSelecionado);
                          }
                        }}
                      >
                        <Cell 
                          fill={filtrosAtivos.tipo === "completo" ? "#a855f7" : "#9333ea"} 
                          stroke="none"
                          style={{ cursor: "pointer", opacity: filtrosAtivos.tipo && filtrosAtivos.tipo !== "completo" ? 0.5 : 1 }} 
                        />
                        <Cell 
                          fill={filtrosAtivos.tipo === "rapido" ? "#f472b6" : "#ec4899"} 
                          stroke="none"
                          style={{ cursor: "pointer", opacity: filtrosAtivos.tipo && filtrosAtivos.tipo !== "rapido" ? 0.5 : 1 }} 
                        />
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(15, 23, 42, 0.95)",
                          border: "none",
                          borderRadius: "8px",
                          color: "#fff",
                          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
                        }}
                        cursor={{ fill: "rgba(147, 51, 234, 0.1)" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Gráfico de Barras - Status */}
                <div className="rounded-2xl bg-white/5 p-6 shadow-lg shadow-purple-900/30">
                  <h3 className="text-lg font-semibold text-white mb-4">Distribuição por Status</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[
                        {
                          name: "Ativo",
                          valor: clientesFiltradosParaGraficos.filter((c) => c.status === "Ativo").length,
                        },
                        {
                          name: "Inativo",
                          valor: clientesFiltradosParaGraficos.filter((c) => c.status === "Inativo").length,
                        },
                        {
                          name: "Em avaliação",
                          valor: clientesFiltradosParaGraficos.filter((c) => c.status === "Em avaliação").length,
                        },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(15, 23, 42, 0.95)",
                          border: "none",
                          borderRadius: "8px",
                          color: "#fff",
                          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
                        }}
                        cursor={{ fill: "rgba(147, 51, 234, 0.1)" }}
                      />
                      <Bar
                        dataKey="valor"
                        fill="#9333ea"
                        radius={[8, 8, 0, 0]}
                        animationBegin={0}
                        animationDuration={800}
                        animationEasing="ease-out"
                        isAnimationActive={true}
                        onClick={(data: any, index: number) => {
                          const statuses = ["Ativo", "Inativo", "Em avaliação"];
                          const statusSelecionado = statuses[index];
                          if (!statusSelecionado) return;
                          if (filtrosAtivos.status === statusSelecionado) {
                            aplicarFiltro("status", undefined);
                          } else {
                            aplicarFiltro("status", statusSelecionado);
                          }
                        }}
                        style={{ cursor: "pointer" }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Gráfico de Humor (Atendimentos Rápidos) */}
                {clientesFiltradosParaGraficos.filter((c) => c.tipo === "rapido" && c.humor).length > 0 && (
                  <div className="rounded-2xl bg-white/5 p-6 shadow-lg shadow-purple-900/30">
                    <h3 className="text-lg font-semibold text-white mb-4">Humor nos Atendimentos</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={[
                          {
                            name: "Colaborativo",
                            quantidade:
                              clientesFiltradosParaGraficos.filter((c) => c.tipo === "rapido" && c.humor === "Colaborativo").length,
                          },
                          {
                            name: "Neutro",
                            quantidade:
                              clientesFiltradosParaGraficos.filter((c) => c.tipo === "rapido" && c.humor === "Neutro").length,
                          },
                          {
                            name: "Tensionado",
                            quantidade:
                              clientesFiltradosParaGraficos.filter((c) => c.tipo === "rapido" && c.humor === "Tensionado").length,
                          },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(15, 23, 42, 0.95)",
                            border: "none",
                            borderRadius: "8px",
                            color: "#fff",
                            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
                          }}
                          cursor={{ fill: "rgba(236, 72, 153, 0.1)" }}
                        />
                        <Bar
                          dataKey="quantidade"
                          fill="#ec4899"
                          radius={[8, 8, 0, 0]}
                          animationBegin={0}
                          animationDuration={800}
                          animationEasing="ease-out"
                          isAnimationActive={true}
                          onClick={(data: any, index: number) => {
                            const humores = ["Colaborativo", "Neutro", "Tensionado"];
                            const humorSelecionado = humores[index];
                            if (!humorSelecionado) return;
                            if (filtrosAtivos.humor === humorSelecionado) {
                              aplicarFiltro("humor", undefined);
                            } else {
                              aplicarFiltro("humor", humorSelecionado);
                            }
                          }}
                          style={{ cursor: "pointer" }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Gráfico de Gênero */}
                {clientesFiltradosParaGraficos.filter((c) => c.genero).length > 0 && (
                  <div className="rounded-2xl bg-white/5 p-6 shadow-lg shadow-purple-900/30">
                    <h3 className="text-lg font-semibold text-white mb-4">Distribuição por Gênero</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={(() => {
                            const generos = clientesFiltradosParaGraficos
                              .filter((c) => c.genero)
                              .reduce((acc: Record<string, number>, c) => {
                                acc[c.genero] = (acc[c.genero] || 0) + 1;
                                return acc;
                              }, {});
                            return Object.entries(generos).map(([name, value]) => ({ name, value }));
                          })()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }: { name?: string; percent?: number }) => `${name || ""}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          animationBegin={0}
                          animationDuration={800}
                          animationEasing="ease-out"
                          isAnimationActive={true}
                          onClick={(data: any) => {
                            if (!data || !data.name) return;
                            const generoSelecionado = data.name;
                            if (filtrosAtivos.genero === generoSelecionado) {
                              aplicarFiltro("genero", undefined);
                            } else {
                              aplicarFiltro("genero", generoSelecionado);
                            }
                          }}
                        >
                          {(() => {
                            const generos = clientesFiltradosParaGraficos
                              .filter((c) => c.genero)
                              .reduce((acc: Record<string, number>, c) => {
                                acc[c.genero] = (acc[c.genero] || 0) + 1;
                                return acc;
                              }, {});
                            const cores = ["#9333ea", "#ec4899", "#6366f1", "#8b5cf6", "#a855f7"];
                            return Object.keys(generos).map((genero, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={filtrosAtivos.genero === genero ? cores[index % cores.length] : cores[index % cores.length]} 
                                stroke="none"
                                style={{ 
                                  cursor: "pointer", 
                                  opacity: filtrosAtivos.genero && filtrosAtivos.genero !== genero ? 0.5 : 1 
                                }} 
                              />
                            ));
                          })()}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(15, 23, 42, 0.95)",
                            border: "none",
                            borderRadius: "8px",
                            color: "#fff",
                            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
                          }}
                          cursor={{ fill: "rgba(147, 51, 234, 0.1)" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Tabela Resumo */}
              <div className="rounded-2xl bg-white/5 p-6 shadow-lg shadow-purple-900/30">
                <h3 className="text-lg font-semibold text-white mb-4">Resumo Detalhado</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-slate-300">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 font-semibold text-white">Categoria</th>
                        <th className="text-right py-3 px-4 font-semibold text-white">Quantidade</th>
                        <th className="text-right py-3 px-4 font-semibold text-white">Percentual</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-white/5">
                        <td className="py-3 px-4">Total de Clientes</td>
                        <td className="text-right py-3 px-4 font-semibold text-white">{clientesFiltradosParaGraficos.length}</td>
                        <td className="text-right py-3 px-4">100%</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-3 px-4">Clientes Completos</td>
                        <td className="text-right py-3 px-4 font-semibold text-purple-300">
                          {clientesFiltradosParaGraficos.filter((c) => c.tipo === "completo").length}
                        </td>
                        <td className="text-right py-3 px-4">
                          {clientesFiltradosParaGraficos.length > 0
                            ? Math.round(
                                (clientesFiltradosParaGraficos.filter((c) => c.tipo === "completo").length / clientesFiltradosParaGraficos.length) * 100
                              )
                            : 0}
                          %
                        </td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-3 px-4">Atendimentos Rápidos</td>
                        <td className="text-right py-3 px-4 font-semibold text-fuchsia-300">
                          {clientesFiltradosParaGraficos.filter((c) => c.tipo === "rapido").length}
                        </td>
                        <td className="text-right py-3 px-4">
                          {clientesFiltradosParaGraficos.length > 0
                            ? Math.round(
                                (clientesFiltradosParaGraficos.filter((c) => c.tipo === "rapido").length / clientesFiltradosParaGraficos.length) * 100
                              )
                            : 0}
                          %
                        </td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-3 px-4">Status: Ativo</td>
                        <td className="text-right py-3 px-4 font-semibold text-emerald-300">
                          {clientesFiltradosParaGraficos.filter((c) => c.status === "Ativo").length}
                        </td>
                        <td className="text-right py-3 px-4">
                          {clientesFiltradosParaGraficos.length > 0
                            ? Math.round(
                                (clientesFiltradosParaGraficos.filter((c) => c.status === "Ativo").length / clientesFiltradosParaGraficos.length) * 100
                              )
                            : 0}
                          %
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Status: Em avaliação</td>
                        <td className="text-right py-3 px-4 font-semibold text-amber-300">
                          {clientesFiltradosParaGraficos.filter((c) => c.status === "Em avaliação").length}
                        </td>
                        <td className="text-right py-3 px-4">
                          {clientesFiltradosParaGraficos.length > 0
                            ? Math.round(
                                (clientesFiltradosParaGraficos.filter((c) => c.status === "Em avaliação").length / clientesFiltradosParaGraficos.length) *
                                  100
                              )
                            : 0}
                          %
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeSection === "Relatórios" && (
            <div className="mt-8 space-y-6">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-purple-900/30">
                <h2 className="text-xl font-semibold text-white mb-2">Exportar Base de Dados</h2>
                <p className="text-sm text-slate-300 mb-6">
                  Baixe relatórios completos em formato Excel (.xlsx) separados por tipo de cadastro.
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Card Clientes Completos */}
                  <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">Clientes Completos</h3>
                        <p className="text-xs text-slate-400">Pessoas fixas em organizações</p>
                      </div>
                      <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-100">
                        {clientes.filter((c) => c.tipo === "completo").length} registros
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 mb-4">
                      Exporta todos os dados completos: informações pessoais, financeiras, endereço, etc.
                    </p>
                    <button
                      onClick={() => exportarParaExcel("completo")}
                      disabled={clientes.filter((c) => c.tipo === "completo").length === 0}
                      className="w-full rounded-xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-900/40 hover:brightness-110 transition disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      📥 Baixar Excel - Clientes Completos
                    </button>
                  </div>

                  {/* Card Atendimentos Rápidos */}
                  <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">Atendimentos Rápidos</h3>
                        <p className="text-xs text-slate-400">Atendimentos curtos em órgãos públicos</p>
                      </div>
                      <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-100">
                        {clientes.filter((c) => c.tipo === "rapido").length} registros
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 mb-4">
                      Exporta dados de atendimentos rápidos: nome, idade, gênero, humor, etc.
                    </p>
                    <button
                      onClick={() => exportarParaExcel("rapido")}
                      disabled={clientes.filter((c) => c.tipo === "rapido").length === 0}
                      className="w-full rounded-xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-900/40 hover:brightness-110 transition disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      📥 Baixar Excel - Atendimentos Rápidos
                    </button>
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-purple-500/30 bg-purple-500/10 p-4">
                  <p className="text-xs text-purple-200">
                    💡 <strong>Dica:</strong> Os arquivos são salvos automaticamente na pasta de Downloads com a data atual no nome.
                    Você pode abrir os arquivos .xlsx no Excel, Google Sheets ou qualquer planilha compatível.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection !== "Clientes" && activeSection !== "Relatórios" && activeSection !== "Painel" && (
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200 shadow-lg shadow-purple-900/30">
              <p className="text-base font-semibold text-white">{activeSection}</p>
              <p className="mt-2 text-slate-300">
                Esta área ainda não foi configurada. Clique à vontade — em breve adicionaremos conteúdo aqui.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

