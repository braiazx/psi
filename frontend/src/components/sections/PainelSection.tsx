"use client";

import { useMemo } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { Cliente, Anotacao, FiltrosAtivos, CORES_GRAFICO } from "@/types";

type Props = {
  clientes: Cliente[];
  anotacoes: Anotacao[];
  filtrosAtivos: FiltrosAtivos;
  setFiltrosAtivos: (f: FiltrosAtivos) => void;
};

export default function PainelSection({ clientes, anotacoes, filtrosAtivos, setFiltrosAtivos }: Props) {
  // Filtrar clientes baseado nos filtros ativos
  const clientesFiltrados = useMemo(() => {
    return clientes.filter((c) => {
      if (filtrosAtivos.status && c.status !== filtrosAtivos.status) return false;
      if (filtrosAtivos.genero && c.genero !== filtrosAtivos.genero) return false;
      return true;
    });
  }, [clientes, filtrosAtivos]);

  // Dados para gráficos
  const dadosStatus = useMemo(() => {
    const counts: Record<string, number> = {};
    clientesFiltrados.forEach((c) => {
      counts[c.status] = (counts[c.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [clientesFiltrados]);

  const dadosGenero = useMemo(() => {
    const counts: Record<string, number> = {};
    clientesFiltrados.forEach((c) => {
      if (c.genero) counts[c.genero] = (counts[c.genero] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [clientesFiltrados]);

  const dadosEstadosEmocionais = useMemo(() => {
    const counts: Record<string, number> = {};
    anotacoes.forEach((a) => {
      if (a.estadoEmocional) counts[a.estadoEmocional] = (counts[a.estadoEmocional] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [anotacoes]);

  const dadosTiposAcompanhamento = useMemo(() => {
    const counts: Record<string, number> = {};
    anotacoes.forEach((a) => {
      if (a.tipoAcompanhamento) counts[a.tipoAcompanhamento] = (counts[a.tipoAcompanhamento] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [anotacoes]);

  const aplicarFiltro = (campo: "status" | "genero", valor: string | undefined) => {
    setFiltrosAtivos((prev: FiltrosAtivos) => {
      const novo = { ...prev };
      if (novo[campo] === valor) {
        delete novo[campo];
      } else {
        novo[campo] = valor;
      }
      return novo;
    });
  };

  const temFiltrosAtivos = Object.keys(filtrosAtivos).length > 0;
  const totalClientes = clientes.length;
  const clientesAtivos = clientes.filter((c) => c.status === "Ativo").length;
  const clientesEmAvaliacao = clientes.filter((c) => c.status === "Em avaliação").length;

  return (
    <div className="mt-8 space-y-6 section-transition animate-fade-in">
      {/* Cards de estatísticas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/15 to-fuchsia-500/15 p-5 shadow-lg shadow-purple-900/30 animate-fade-in hover-lift">
          <p className="text-xs uppercase tracking-widest text-slate-400">Total de Clientes</p>
          <p className="mt-2 text-4xl font-bold text-purple-300">{totalClientes}</p>
          <p className="mt-1 text-xs text-slate-500">Cadastrados no sistema</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-green-500/15 to-emerald-500/15 p-5 shadow-lg shadow-green-900/30 animate-fade-in hover-lift" style={{ animationDelay: "0.1s" }}>
          <p className="text-xs uppercase tracking-widest text-slate-400">Clientes Ativos</p>
          <p className="mt-2 text-4xl font-bold text-green-400">{clientesAtivos}</p>
          <p className="mt-1 text-xs text-slate-500">{totalClientes > 0 ? ((clientesAtivos / totalClientes) * 100).toFixed(0) : 0}% do total</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-yellow-500/15 to-orange-500/15 p-5 shadow-lg shadow-yellow-900/30 animate-fade-in hover-lift" style={{ animationDelay: "0.2s" }}>
          <p className="text-xs uppercase tracking-widest text-slate-400">Em Avaliação</p>
          <p className="mt-2 text-4xl font-bold text-yellow-400">{clientesEmAvaliacao}</p>
          <p className="mt-1 text-xs text-slate-500">Aguardando análise</p>
        </div>
      </div>

      {/* Botão limpar filtros */}
      {temFiltrosAtivos && (
        <div className="flex items-center gap-2 animate-fade-in">
          <span className="text-xs text-slate-400">Filtros ativos:</span>
          {filtrosAtivos.status && (
            <span className="rounded-full bg-purple-500/30 px-2 py-1 text-xs text-purple-100">Status: {filtrosAtivos.status}</span>
          )}
          {filtrosAtivos.genero && (
            <span className="rounded-full bg-pink-500/30 px-2 py-1 text-xs text-pink-100">Gênero: {filtrosAtivos.genero}</span>
          )}
          <button
            onClick={() => setFiltrosAtivos({})}
            className="rounded-full bg-red-500/20 px-3 py-1 text-xs text-red-300 hover:bg-red-500/30 transition"
          >
            Limpar filtros
          </button>
        </div>
      )}

      {/* Gráficos */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Gráfico de Status */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-purple-900/30 animate-fade-in hover-lift">
          <h3 className="text-base font-semibold text-white mb-1">Distribuição por Status</h3>
          <p className="text-xs text-slate-400 mb-4">Status atual dos seus clientes</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} cursor="pointer" onClick={(data) => aplicarFiltro("status", data.name)}>
                  {dadosStatus.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CORES_GRAFICO[index % CORES_GRAFICO.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-500 text-center mt-2 italic">Clique nas barras para filtrar</p>
        </div>

        {/* Gráfico de Gênero */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-purple-900/30 animate-fade-in hover-lift" style={{ animationDelay: "0.1s" }}>
          <h3 className="text-base font-semibold text-white mb-1">Distribuição por Gênero</h3>
          <p className="text-xs text-slate-400 mb-4">Perfil demográfico dos clientes</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dadosGenero}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  cursor="pointer"
                  onClick={(data) => aplicarFiltro("genero", data.name)}
                >
                  {dadosGenero.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CORES_GRAFICO[index % CORES_GRAFICO.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Estados Emocionais */}
        {dadosEstadosEmocionais.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-purple-900/30 animate-fade-in hover-lift" style={{ animationDelay: "0.2s" }}>
            <h3 className="text-base font-semibold text-white mb-1">Estados Emocionais</h3>
            <p className="text-xs text-slate-400 mb-4">Baseado nas anotações registradas</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dadosEstadosEmocionais} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {dadosEstadosEmocionais.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CORES_GRAFICO[index % CORES_GRAFICO.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Gráfico de Tipos de Acompanhamento */}
        {dadosTiposAcompanhamento.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-purple-900/30 animate-fade-in hover-lift" style={{ animationDelay: "0.3s" }}>
            <h3 className="text-base font-semibold text-white mb-1">Tipos de Acompanhamento</h3>
            <p className="text-xs text-slate-400 mb-4">Distribuição por tipo de sessão</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dadosTiposAcompanhamento} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {dadosTiposAcompanhamento.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CORES_GRAFICO[index % CORES_GRAFICO.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Tabela Resumo */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-purple-900/30 animate-fade-in hover-lift">
        <h3 className="text-base font-semibold text-white mb-4">Resumo Detalhado</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-2 text-left text-slate-400 font-medium">Categoria</th>
                <th className="py-2 text-right text-slate-400 font-medium">Quantidade</th>
                <th className="py-2 text-right text-slate-400 font-medium">Percentual</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/5">
                <td className="py-2 text-slate-200">Total de Clientes</td>
                <td className="py-2 text-right text-slate-200">{totalClientes}</td>
                <td className="py-2 text-right text-slate-400">100%</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-2 text-slate-200">Status: Ativo</td>
                <td className="py-2 text-right text-green-400">{clientesAtivos}</td>
                <td className="py-2 text-right text-slate-400">{totalClientes > 0 ? ((clientesAtivos / totalClientes) * 100).toFixed(1) : 0}%</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-2 text-slate-200">Status: Em Avaliação</td>
                <td className="py-2 text-right text-yellow-400">{clientesEmAvaliacao}</td>
                <td className="py-2 text-right text-slate-400">{totalClientes > 0 ? ((clientesEmAvaliacao / totalClientes) * 100).toFixed(1) : 0}%</td>
              </tr>
              <tr>
                <td className="py-2 text-slate-200">Anotações Registradas</td>
                <td className="py-2 text-right text-purple-400">{anotacoes.length}</td>
                <td className="py-2 text-right text-slate-400">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

