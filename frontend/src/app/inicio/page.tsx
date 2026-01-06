"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import { showToast } from "@/components/Toast";
import ConfirmModal from "@/components/ConfirmModal";
import { jsPDF } from "jspdf";
import { saveClientes, loadClientes, savePerfil, loadPerfil } from "@/utils/localStorage";
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
  dataCriacao?: string; // Data/hora de criação
  dataAtualizacao?: string; // Data/hora da última atualização
  fotoUrl?: string; // URL da foto do cliente (base64 ou URL)
  linkedin?: string; // URL do perfil LinkedIn
};

type TipoTransacao = "receita" | "despesa";
type FormaPagamento = "Dinheiro" | "PIX" | "Cartão de Crédito" | "Cartão de Débito" | "Boleto" | "Transferência" | "Outro";
type CategoriaDespesa = "Aluguel" | "Equipamentos" | "Materiais" | "Marketing" | "Transporte" | "Alimentação" | "Outros" | "Impostos" | "Salários" | "Serviços";

type Transacao = {
  id: string;
  tipo: TipoTransacao;
  valor: number;
  descricao: string;
  data: string; // ISO string
  formaPagamento: FormaPagamento;
  clienteId?: string; // Para receitas vinculadas a clientes
  categoria?: CategoriaDespesa; // Para despesas
  observacoes?: string;
  pago: boolean; // Se foi recebido/pago
  dataCriacao: string;
};

type EstadoEmocional = "Colaborativo" | "Neutro" | "Ansioso" | "Motivado" | "Desmotivado" | "Estressado";
type TendenciaComportamental = "Engajado" | "Em adaptação" | "Resistente" | "Proativo" | "Reativo" | "Estável";
type NivelUrgencia = "Baixa" | "Média" | "Alta" | "Crítica";
type TipoAcompanhamento = "Desenvolvimento" | "Conflito" | "Orientação" | "Avaliação" | "Feedback" | "Crise" | "Rotina";

type Anotacao = {
  id: string;
  clienteId: string;
  texto: string;
  data: string; // ISO string
  dataCriacao: string;
  estadoEmocional?: EstadoEmocional;
  tendencia?: TendenciaComportamental;
  urgencia?: NivelUrgencia;
  tipoAcompanhamento?: TipoAcompanhamento;
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
    fotoUrl: "",
    linkedin: "",
  });
  const [activeSection, setActiveSection] = useState<string>("Painel");
  
  // Estados para Pesquisa
  const [searchPesquisa, setSearchPesquisa] = useState<string>("");
  const [filterStatusPesquisa, setFilterStatusPesquisa] = useState<string>("Todos");
  const [filterGeneroPesquisa, setFilterGeneroPesquisa] = useState<string>("Todos");
  const [sortByPesquisa, setSortByPesquisa] = useState<"nome" | "data" | "status">("data");
  const [sortOrderPesquisa, setSortOrderPesquisa] = useState<"asc" | "desc">("desc");
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
    status?: string;
    genero?: string;
  }>({});

  // Estados para confirmação e loading
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; clienteId: string | null; clienteNome: string }>({
    isOpen: false,
    clienteId: null,
    clienteNome: "",
  });
  const [loadingExport, setLoadingExport] = useState<"completo" | "rapido" | null>(null);
  const [savingClient, setSavingClient] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [tipoRelatorio, setTipoRelatorio] = useState<"semanal" | "mensal">("semanal");
  
  // Estados para Agenda/Google Calendar
  const [eventos, setEventos] = useState<any[]>([]);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [eventForm, setEventForm] = useState({
    id: "",
    titulo: "",
    descricao: "",
    dataInicio: "",
    horaInicio: "",
    dataFim: "",
    horaFim: "",
    clienteId: "",
    local: "",
    tipo: "Consulta",
    valor: "",
    realizado: false,
    receitaGerada: false,
  });
  const [confirmDeleteEvento, setConfirmDeleteEvento] = useState<{ isOpen: boolean; eventoId: string | null; eventoTitulo: string }>({
    isOpen: false,
    eventoId: null,
    eventoTitulo: "",
  });

  // Estados para Financeiro
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [showTransacaoModal, setShowTransacaoModal] = useState(false);
  const [transacaoForm, setTransacaoForm] = useState<{
    id: string;
    tipo: TipoTransacao;
    valor: string;
    descricao: string;
    data: string;
    formaPagamento: FormaPagamento;
    clienteId: string;
    categoria?: CategoriaDespesa;
    observacoes: string;
    pago: boolean;
  }>({
    id: "",
    tipo: "receita",
    valor: "",
    descricao: "",
    data: new Date().toISOString().split("T")[0],
    formaPagamento: "Dinheiro",
    clienteId: "",
    categoria: "Outros",
    observacoes: "",
    pago: true,
  });
  const [filtroPeriodo, setFiltroPeriodo] = useState<"hoje" | "semana" | "mes" | "ano" | "todos">("mes");
  const [filtroTipoTransacao, setFiltroTipoTransacao] = useState<"todos" | "receita" | "despesa">("todos");

  // Estados para Anotações
  const [anotacoes, setAnotacoes] = useState<Anotacao[]>([]);
  const [clienteSelecionadoAnotacao, setClienteSelecionadoAnotacao] = useState<string>("");
  const [novaAnotacao, setNovaAnotacao] = useState("");
  const [estadoEmocionalAnotacao, setEstadoEmocionalAnotacao] = useState<EstadoEmocional | "">("");
  const [tendenciaAnotacao, setTendenciaAnotacao] = useState<TendenciaComportamental | "">("");
  const [urgenciaAnotacao, setUrgenciaAnotacao] = useState<NivelUrgencia | "">("");
  const [tipoAcompanhamentoAnotacao, setTipoAcompanhamentoAnotacao] = useState<TipoAcompanhamento | "">("");
  const [showRelatorioClienteModal, setShowRelatorioClienteModal] = useState<string | null>(null);
  const [showPerfilClienteModal, setShowPerfilClienteModal] = useState<string | null>(null);

  // Função para aplicar filtros
  const aplicarFiltro = (campo: "status" | "genero", valor: string | undefined) => {
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
      if (filtrosAtivos.status && c.status !== filtrosAtivos.status) return false;
      if (filtrosAtivos.genero && c.genero !== filtrosAtivos.genero) return false;
      return true;
    });
  }, [clientes, filtrosAtivos]);

  // Carregar clientes da pasta local ao iniciar
  useEffect(() => {
    const carregarClientes = async () => {
      const dados = await loadClientes();
      if (dados && dados.length > 0) {
        setClientes(dados);
      }
    };
    carregarClientes();
  }, []);

  // Salvar clientes na pasta local sempre que mudarem
  useEffect(() => {
    if (clientes.length > 0) {
      saveClientes(clientes);
    }
  }, [clientes]);

  useEffect(() => {
    const carregarPerfil = async () => {
      const dados = await loadPerfil();
      if (dados) {
        setPerfil({
          nome: dados.nome || "Usuário Ordenate",
          idade: dados.idade || "",
          genero: dados.genero || "",
          pronomes: dados.pronomes || "",
          foto: dados.foto || null,
        });
      }
    };
    carregarPerfil();
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

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K ou Cmd+K: Focar na busca (apenas na aba Pesquisa)
      if ((e.ctrlKey || e.metaKey) && e.key === "k" && activeSection === "Pesquisa") {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Buscar por nome, email, telefone"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
      // Ctrl+N: Novo cliente (quando na seção de clientes)
      if ((e.ctrlKey || e.metaKey) && e.key === "n" && activeSection === "Clientes") {
        e.preventDefault();
          const nomeInput = document.querySelector('input[placeholder*="Nome completo"]') as HTMLInputElement;
          if (nomeInput) nomeInput.focus();
      }
      // Escape: Limpar busca (apenas na aba Pesquisa)
      if (e.key === "Escape" && activeSection === "Pesquisa" && searchPesquisa) {
        setSearchPesquisa("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeSection, searchPesquisa]);

  // Clientes filtrados para aba Clientes (ordenados por data)
  const clientesFiltrados = useMemo(() => {
    return clientes.sort((a, b) => {
      const dateA = a.dataCriacao ? new Date(a.dataCriacao).getTime() : 0;
      const dateB = b.dataCriacao ? new Date(b.dataCriacao).getTime() : 0;
      return dateB - dateA; // Mais recentes primeiro
    });
  }, [clientes]);

  // Clientes filtrados para aba Pesquisa (com todos os filtros)
  const clientesFiltradosPesquisa = useMemo(() => {
    let filtrados = clientes.filter((c) => {
      // Filtro por status
      const matchStatus = filterStatusPesquisa === "Todos" ? true : c.status === filterStatusPesquisa;
      
      // Filtro por gênero
      const matchGenero = filterGeneroPesquisa === "Todos" ? true : c.genero === filterGeneroPesquisa;
      
      // Busca por texto
      const termo = searchPesquisa.trim().toLowerCase();
      const matchSearch = termo
        ? [c.nome, c.email, c.telefone, c.celular, c.genero, c.grupo, c.cpf, c.rg].some((field) =>
            (field || "").toLowerCase().includes(termo)
          )
        : true;
      
      return matchStatus && matchGenero && matchSearch;
    });

    // Ordenação
    filtrados.sort((a, b) => {
      let comparison = 0;
      if (sortByPesquisa === "nome") {
        comparison = (a.nome || "").localeCompare(b.nome || "");
      } else if (sortByPesquisa === "data") {
        const dateA = a.dataCriacao ? new Date(a.dataCriacao).getTime() : 0;
        const dateB = b.dataCriacao ? new Date(b.dataCriacao).getTime() : 0;
        comparison = dateA - dateB;
      } else if (sortByPesquisa === "status") {
        comparison = (a.status || "").localeCompare(b.status || "");
      }
      return sortOrderPesquisa === "asc" ? comparison : -comparison;
    });

    return filtrados;
  }, [clientes, filterStatusPesquisa, filterGeneroPesquisa, searchPesquisa, sortByPesquisa, sortOrderPesquisa]);

  // Função para gerar dias do calendário
  const gerarDiasCalendario = (data: Date): (Date | null)[] => {
    const ano = data.getFullYear();
    const mes = data.getMonth();
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const diasNoMes = ultimoDia.getDate();
    const diaSemanaInicio = primeiroDia.getDay();
    
    const dias: (Date | null)[] = [];
    
    // Dias do mês anterior
    for (let i = 0; i < diaSemanaInicio; i++) {
      dias.push(null);
    }
    
    // Dias do mês atual
    for (let dia = 1; dia <= diasNoMes; dia++) {
      dias.push(new Date(ano, mes, dia));
    }
    
    // Completar até 42 células (6 semanas)
    while (dias.length < 42) {
      dias.push(null);
    }
    
    return dias;
  };

  // Função para carregar eventos do Google Calendar
  const carregarEventosGoogle = async () => {
    if (!googleConnected) return;
    
    setLoadingEvents(true);
    try {
      // Em produção, aqui faria a chamada real à API do Google Calendar
      // Por enquanto, simulamos com eventos locais salvos no localStorage
      const eventosSalvos = localStorage.getItem("eventos_ordenate");
      if (eventosSalvos) {
        const eventosParsed = JSON.parse(eventosSalvos);
        setEventos(eventosParsed);
      } else {
        setEventos([]);
      }
    } catch (error) {
      console.error("Erro ao carregar eventos:", error);
      showToast("Erro ao carregar eventos do Google Calendar", "error");
    } finally {
      setLoadingEvents(false);
    }
  };

  // Função para criar ou atualizar evento
  const criarEvento = async () => {
    try {
      const dataInicioCompleta = new Date(`${eventForm.dataInicio}T${eventForm.horaInicio}`);
      const dataFimCompleta = new Date(`${eventForm.dataFim}T${eventForm.horaFim}`);
      
      // Se tem ID, está editando
      if (eventForm.id) {
        const eventoAtual = eventos.find((e) => e.id === eventForm.id);
        const receitaGeradaAnteriormente = eventoAtual?.receitaGerada || false;
        let novaReceitaGerada = eventForm.receitaGerada;

        // Se marcar como realizado e ainda não gerou receita, criar receita automaticamente
        if (eventForm.realizado && eventForm.valor && !receitaGeradaAnteriormente && !eventForm.receitaGerada) {
          const valorNumero = parseFloat(eventForm.valor.replace(",", "."));
          if (!isNaN(valorNumero) && valorNumero > 0) {
            const novaReceita: Transacao = {
              id: crypto.randomUUID(),
              tipo: "receita",
              valor: valorNumero,
              descricao: `${eventForm.titulo} - ${eventForm.tipo}`,
              data: eventForm.dataInicio,
              formaPagamento: "Dinheiro",
              clienteId: eventForm.clienteId || undefined,
              observacoes: `Receita gerada automaticamente do evento: ${eventForm.titulo}`,
              pago: true,
              dataCriacao: new Date().toISOString(),
            };
            const novasTransacoes = [...transacoes, novaReceita];
            setTransacoes(novasTransacoes);
            localStorage.setItem("transacoes_ordenate", JSON.stringify(novasTransacoes));
            novaReceitaGerada = true;
            showToast("Receita gerada automaticamente!", "success");
          }
        }

        const novosEventos = eventos.map((e) => {
          if (e.id === eventForm.id) {
            return {
              ...e,
              titulo: eventForm.titulo,
              descricao: eventForm.descricao,
              dataInicio: dataInicioCompleta.toISOString(),
              dataFim: dataFimCompleta.toISOString(),
              horaInicio: eventForm.horaInicio,
              horaFim: eventForm.horaFim,
              clienteId: eventForm.clienteId || null,
              local: eventForm.local,
              tipo: eventForm.tipo || "Consulta",
              valor: eventForm.valor || "",
              realizado: eventForm.realizado,
              receitaGerada: novaReceitaGerada,
            };
          }
          return e;
        });
        setEventos(novosEventos);
        localStorage.setItem("eventos_ordenate", JSON.stringify(novosEventos));
        showToast("Evento atualizado com sucesso!", "success");
      } else {
        // Criar novo evento
        let receitaGerada = false;
        // Se criar evento já como realizado com valor, gerar receita automaticamente
        if (eventForm.realizado && eventForm.valor) {
          const valorNumero = parseFloat(eventForm.valor.replace(",", "."));
          if (!isNaN(valorNumero) && valorNumero > 0) {
            const novaReceita: Transacao = {
              id: crypto.randomUUID(),
              tipo: "receita",
              valor: valorNumero,
              descricao: `${eventForm.titulo} - ${eventForm.tipo}`,
              data: eventForm.dataInicio,
              formaPagamento: "Dinheiro",
              clienteId: eventForm.clienteId || undefined,
              observacoes: `Receita gerada automaticamente do evento: ${eventForm.titulo}`,
              pago: true,
              dataCriacao: new Date().toISOString(),
            };
            const novasTransacoes = [...transacoes, novaReceita];
            setTransacoes(novasTransacoes);
            localStorage.setItem("transacoes_ordenate", JSON.stringify(novasTransacoes));
            receitaGerada = true;
            showToast("Receita gerada automaticamente!", "success");
          }
        }
      
      const novoEvento = {
        id: crypto.randomUUID(),
        titulo: eventForm.titulo,
        descricao: eventForm.descricao,
        dataInicio: dataInicioCompleta.toISOString(),
        dataFim: dataFimCompleta.toISOString(),
        horaInicio: eventForm.horaInicio,
        horaFim: eventForm.horaFim,
        clienteId: eventForm.clienteId || null,
        local: eventForm.local,
          tipo: eventForm.tipo || "Consulta",
          valor: eventForm.valor || "",
          realizado: eventForm.realizado,
          receitaGerada: receitaGerada,
        criadoEm: new Date().toISOString(),
      };
      
      const novosEventos = [...eventos, novoEvento];
      setEventos(novosEventos);
      localStorage.setItem("eventos_ordenate", JSON.stringify(novosEventos));
      
      // Se estiver conectado ao Google, criar evento no Google Calendar também
      if (googleConnected) {
        // Em produção, aqui faria a chamada real à API do Google Calendar
        // Por enquanto, apenas salvamos localmente
        showToast("Evento criado com sucesso! (Salvo localmente)", "success");
      } else {
        showToast("Evento criado com sucesso!", "success");
        }
      }
      
      setShowEventModal(false);
      setEventForm({
        id: "",
        titulo: "",
        descricao: "",
        dataInicio: "",
        horaInicio: "",
        dataFim: "",
        horaFim: "",
        clienteId: "",
        local: "",
        tipo: "Consulta",
        valor: "",
        realizado: false,
        receitaGerada: false,
      });
    } catch (error) {
      console.error("Erro ao criar/atualizar evento:", error);
      showToast("Erro ao salvar evento", "error");
    }
  };

  // Função para confirmar exclusão de evento
  const handleConfirmDeleteEvento = () => {
    if (confirmDeleteEvento.eventoId) {
      const novosEventos = eventos.filter((e) => e.id !== confirmDeleteEvento.eventoId);
      setEventos(novosEventos);
      localStorage.setItem("eventos_ordenate", JSON.stringify(novosEventos));
      showToast(`Evento "${confirmDeleteEvento.eventoTitulo}" excluído com sucesso!`, "success");
      setConfirmDeleteEvento({ isOpen: false, eventoId: null, eventoTitulo: "" });
    }
  };

  // Funções para gerenciar transações financeiras
  const salvarTransacao = () => {
    if (!transacaoForm.valor || !transacaoForm.descricao || !transacaoForm.data) {
      showToast("Preencha valor, descrição e data", "warning");
      return;
    }

    const valorNumero = parseFloat(transacaoForm.valor.replace(",", "."));
    if (isNaN(valorNumero) || valorNumero <= 0) {
      showToast("Valor inválido", "warning");
      return;
    }

    if (transacaoForm.id) {
      // Editar transação existente
      const novasTransacoes = transacoes.map((t) => {
        if (t.id === transacaoForm.id) {
          return {
            ...t,
            tipo: transacaoForm.tipo,
            valor: valorNumero,
            descricao: transacaoForm.descricao,
            data: transacaoForm.data,
            formaPagamento: transacaoForm.formaPagamento,
            clienteId: transacaoForm.clienteId || undefined,
            categoria: transacaoForm.categoria,
            observacoes: transacaoForm.observacoes || undefined,
            pago: transacaoForm.pago,
          };
        }
        return t;
      });
      setTransacoes(novasTransacoes);
      localStorage.setItem("transacoes_ordenate", JSON.stringify(novasTransacoes));
      showToast("Transação atualizada com sucesso!", "success");
    } else {
      // Criar nova transação
      const novaTransacao: Transacao = {
        id: crypto.randomUUID(),
        tipo: transacaoForm.tipo,
        valor: valorNumero,
        descricao: transacaoForm.descricao,
        data: transacaoForm.data,
        formaPagamento: transacaoForm.formaPagamento,
        clienteId: transacaoForm.clienteId || undefined,
        categoria: transacaoForm.categoria,
        observacoes: transacaoForm.observacoes || undefined,
        pago: transacaoForm.pago,
        dataCriacao: new Date().toISOString(),
      };

      const novasTransacoes = [...transacoes, novaTransacao];
      setTransacoes(novasTransacoes);
      localStorage.setItem("transacoes_ordenate", JSON.stringify(novasTransacoes));
      showToast(`${transacaoForm.tipo === "receita" ? "Receita" : "Despesa"} cadastrada com sucesso!`, "success");
    }

    // Limpar formulário
    setTransacaoForm({
      id: "",
      tipo: "receita",
      valor: "",
      descricao: "",
      data: new Date().toISOString().split("T")[0],
      formaPagamento: "Dinheiro",
      clienteId: "",
      categoria: "Outros",
      observacoes: "",
      pago: true,
    });
    setShowTransacaoModal(false);
  };

  const excluirTransacao = (id: string) => {
    const novasTransacoes = transacoes.filter((t) => t.id !== id);
    setTransacoes(novasTransacoes);
    localStorage.setItem("transacoes_ordenate", JSON.stringify(novasTransacoes));
    showToast("Transação excluída com sucesso!", "success");
  };

  // Calcular totais financeiros
  const calcularTotais = () => {
    const hoje = new Date();
    let transacoesFiltradas = transacoes;

    // Filtrar por período
    switch (filtroPeriodo) {
      case "hoje":
        transacoesFiltradas = transacoesFiltradas.filter((t) => {
          const dataTransacao = new Date(t.data);
          return dataTransacao.toDateString() === hoje.toDateString();
        });
        break;
      case "semana":
        const inicioSemana = new Date(hoje);
        inicioSemana.setDate(hoje.getDate() - hoje.getDay());
        inicioSemana.setHours(0, 0, 0, 0);
        transacoesFiltradas = transacoesFiltradas.filter((t) => new Date(t.data) >= inicioSemana);
        break;
      case "mes":
        transacoesFiltradas = transacoesFiltradas.filter((t) => {
          const dataTransacao = new Date(t.data);
          return dataTransacao.getMonth() === hoje.getMonth() && dataTransacao.getFullYear() === hoje.getFullYear();
        });
        break;
      case "ano":
        transacoesFiltradas = transacoesFiltradas.filter((t) => {
          const dataTransacao = new Date(t.data);
          return dataTransacao.getFullYear() === hoje.getFullYear();
        });
        break;
    }

    // Filtrar por tipo
    if (filtroTipoTransacao !== "todos") {
      transacoesFiltradas = transacoesFiltradas.filter((t) => t.tipo === filtroTipoTransacao);
    }

    const receitas = transacoesFiltradas.filter((t) => t.tipo === "receita" && t.pago).reduce((acc, t) => acc + t.valor, 0);
    const despesas = transacoesFiltradas.filter((t) => t.tipo === "despesa" && t.pago).reduce((acc, t) => acc + t.valor, 0);
    const saldo = receitas - despesas;

    // Calcular totais gerais (todas as transações)
    const receitasTotal = transacoes.filter((t) => t.tipo === "receita").reduce((acc, t) => acc + t.valor, 0);
    const despesasTotal = transacoes.filter((t) => t.tipo === "despesa").reduce((acc, t) => acc + t.valor, 0);
    const saldoTotal = receitasTotal - despesasTotal;

    return {
      receitas: receitas,
      despesas: despesas,
      saldo: saldo,
      receitasTotal: receitasTotal,
      despesasTotal: despesasTotal,
      saldoTotal: saldoTotal,
      transacoesFiltradas: transacoesFiltradas,
    };
  };

  // Carregar transações ao iniciar
  useEffect(() => {
    const transacoesSalvas = localStorage.getItem("transacoes_ordenate");
    if (transacoesSalvas) {
      try {
        const transacoesParsed = JSON.parse(transacoesSalvas);
        setTransacoes(transacoesParsed);
      } catch (error) {
        console.error("Erro ao carregar transações:", error);
      }
    }
  }, []);

  // Salvar transações sempre que mudarem
  useEffect(() => {
    if (transacoes.length > 0) {
      localStorage.setItem("transacoes_ordenate", JSON.stringify(transacoes));
    }
  }, [transacoes]);

  // Carregar anotações ao iniciar
  useEffect(() => {
    const anotacoesSalvas = localStorage.getItem("anotacoes_ordenate");
    if (anotacoesSalvas) {
      try {
        const anotacoesParsed = JSON.parse(anotacoesSalvas);
        setAnotacoes(anotacoesParsed);
      } catch (error) {
        console.error("Erro ao carregar anotações:", error);
      }
    }
  }, []);

  // Salvar anotações sempre que mudarem
  useEffect(() => {
    if (anotacoes.length > 0) {
      localStorage.setItem("anotacoes_ordenate", JSON.stringify(anotacoes));
    }
  }, [anotacoes]);

  // Funções para gerenciar anotações
  const adicionarAnotacao = () => {
    if (!clienteSelecionadoAnotacao || !novaAnotacao.trim()) {
      showToast("Selecione um cliente e escreva uma anotação.", "warning");
      return;
    }
    
    const nova: Anotacao = {
      id: crypto.randomUUID(),
      clienteId: clienteSelecionadoAnotacao,
      texto: novaAnotacao.trim(),
      data: new Date().toISOString().split("T")[0],
      dataCriacao: new Date().toISOString(),
      estadoEmocional: estadoEmocionalAnotacao || undefined,
      tendencia: tendenciaAnotacao || undefined,
      urgencia: urgenciaAnotacao || undefined,
      tipoAcompanhamento: tipoAcompanhamentoAnotacao || undefined,
    };
    
    const novasAnotacoes = [nova, ...anotacoes];
    setAnotacoes(novasAnotacoes);
    localStorage.setItem("anotacoes_ordenate", JSON.stringify(novasAnotacoes));
    setNovaAnotacao("");
    setEstadoEmocionalAnotacao("");
    setTendenciaAnotacao("");
    setUrgenciaAnotacao("");
    setTipoAcompanhamentoAnotacao("");
    showToast("Anotação adicionada com sucesso!", "success");
  };

  const excluirAnotacao = (id: string) => {
    const novasAnotacoes = anotacoes.filter((a) => a.id !== id);
    setAnotacoes(novasAnotacoes);
    localStorage.setItem("anotacoes_ordenate", JSON.stringify(novasAnotacoes));
    showToast("Anotação excluída!", "success");
  };

  // Obter anotações de um cliente específico
  const getAnotacoesCliente = (clienteId: string) => {
    return anotacoes.filter((a) => a.clienteId === clienteId).sort((a, b) => 
      new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime()
    );
  };

  // Carregar eventos salvos ao iniciar
  useEffect(() => {
    const eventosSalvos = localStorage.getItem("eventos_ordenate");
    if (eventosSalvos) {
      try {
        const eventosParsed = JSON.parse(eventosSalvos);
        setEventos(eventosParsed);
      } catch (error) {
        console.error("Erro ao carregar eventos salvos:", error);
      }
    }
  }, []);

  // Carregar eventos ao conectar
  useEffect(() => {
    if (googleConnected) {
      carregarEventosGoogle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleConnected]);

  // Função para exportar dados em JSON
  const exportarJSON = () => {
    const dados = {
      clientes,
      perfil,
      exportadoEm: new Date().toISOString(),
      versao: "1.0.0",
    };
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ordenate_backup_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Dados exportados em JSON com sucesso!", "success");
  };

  // Função para importar dados de JSON
  const importarJSON = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const dados = JSON.parse(event.target?.result as string);
          if (dados.clientes && Array.isArray(dados.clientes)) {
            setClientes(dados.clientes);
            if (dados.perfil) {
              savePerfil(dados.perfil);
            }
            showToast("Dados importados com sucesso!", "success");
          } else {
            showToast("Arquivo JSON inválido. Verifique o formato.", "error");
          }
        } catch (error) {
          showToast("Erro ao importar arquivo JSON.", "error");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // Função para exportar para Excel
  const exportarParaExcel = async () => {
    if (clientes.length === 0) {
      showToast("Nenhum cliente para exportar.", "warning");
      return;
    }

    setLoadingExport("completo");
    
    // Simular processamento
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Preparar dados para Excel
    const dadosParaExcel = clientes.map((c) => {
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
      };
    });

    // Criar workbook e worksheet
    const ws = XLSX.utils.json_to_sheet(dadosParaExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Clientes");

    // Gerar nome do arquivo com data
    const dataAtual = new Date().toISOString().split("T")[0];
    const nomeArquivo = `clientes_${dataAtual}.xlsx`;

    // Baixar arquivo
    XLSX.writeFile(wb, nomeArquivo);
    setLoadingExport(null);
    showToast(
      `Arquivo ${nomeArquivo} exportado com sucesso!`,
      "success"
    );
  };

  // Função para deletar cliente com confirmação
  const handleDeleteClick = (clienteId: string, clienteNome: string) => {
    setConfirmDelete({
      isOpen: true,
      clienteId,
      clienteNome,
    });
  };

  const handleConfirmDelete = () => {
    if (confirmDelete.clienteId) {
      setClientes((list) => list.filter((x) => x.id !== confirmDelete.clienteId));
      showToast(`Cliente "${confirmDelete.clienteNome}" excluído com sucesso!`, "success");
      setConfirmDelete({ isOpen: false, clienteId: null, clienteNome: "" });
    }
  };

  // Função para gerar relatório PDF individual do cliente (estilo Persona Card)
  const gerarRelatorioCliente = async (clienteId: string) => {
    const cliente = clientes.find((c) => c.id === clienteId);
    if (!cliente) {
      showToast("Cliente não encontrado.", "error");
      return;
    }

    setLoadingPDF(true);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const doc = new jsPDF();
    const anotacoesCliente = getAnotacoesCliente(clienteId);
    const eventosCliente = eventos.filter((e) => e.clienteId === clienteId);
    const transacoesCliente = transacoes.filter((t) => t.clienteId === clienteId);
    const receitasCliente = transacoesCliente.filter((t) => t.tipo === "receita").reduce((acc, t) => acc + t.valor, 0);

    const pageWidth = doc.internal.pageSize.getWidth();
    const primaryColor: [number, number, number] = [155, 89, 182]; // Roxo
    const secondaryColor: [number, number, number] = [236, 72, 153]; // Rosa

    // Header com cor sólida
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 50, "F");
    
    // Nome do cliente (grande, no header)
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text(cliente.nome.toUpperCase(), 20, 35);

    // Coluna esquerda - Foto e Info básica
    let yPos = 60;
    
    // Área de foto (placeholder se não tiver foto)
    doc.setFillColor(240, 240, 245);
    doc.roundedRect(15, yPos, 50, 50, 3, 3, "F");
    
    if (cliente.fotoUrl) {
      try {
        doc.addImage(cliente.fotoUrl, "JPEG", 15, yPos, 50, 50);
      } catch (e) {
        // Se falhar, mostra placeholder
        doc.setTextColor(180, 180, 190);
        doc.setFontSize(8);
        doc.text("Foto", 35, yPos + 28);
      }
    } else {
      doc.setTextColor(180, 180, 190);
      doc.setFontSize(8);
      doc.text("Sem foto", 30, yPos + 28);
    }

    // Citação / Observação (abaixo da foto)
    if (cliente.observacoes) {
      doc.setFillColor(230, 230, 235);
      doc.roundedRect(15, yPos + 55, 50, 30, 3, 3, "F");
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFontSize(7);
      doc.setFont("helvetica", "italic");
      const obsTexto = cliente.observacoes.length > 80 ? cliente.observacoes.substring(0, 80) + "..." : cliente.observacoes;
      const linhasObs = doc.splitTextToSize(`"${obsTexto}"`, 45);
      doc.text(linhasObs, 17, yPos + 62);
    }

    // Dados pessoais abaixo da foto
    let leftY = yPos + 92;
    
    // Labels estilo persona card
    const labels = [
      { label: "STATUS", value: cliente.status || "Não definido" },
      { label: "GRUPO", value: cliente.grupo || "-" },
      { label: "GÊNERO", value: cliente.genero || "-" },
      { label: "IDADE", value: cliente.dataNascimento ? calcularIdade(cliente.dataNascimento) + " anos" : "-" },
      { label: "DESDE", value: cliente.dataCriacao ? new Date(cliente.dataCriacao).toLocaleDateString("pt-BR") : "-" },
    ];

    labels.forEach((item) => {
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.text(item.label, 15, leftY);
      doc.setTextColor(50, 50, 55);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(item.value, 15, leftY + 5);
      leftY += 14;
    });

    // LinkedIn (se disponível)
    if (cliente.linkedin) {
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.text("LINKEDIN", 15, leftY);
      doc.setTextColor(0, 119, 181); // Cor do LinkedIn
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      const linkedinDisplay = cliente.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, "");
      doc.text(linkedinDisplay.substring(0, 25), 15, leftY + 5);
      leftY += 14;
    }

    // Tags / Características (chips)
    leftY += 5;
    const tags = ["Psicologia Organizacional"];
    if (cliente.planoFinanceiro) tags.push(cliente.planoFinanceiro);
    doc.setFillColor(240, 235, 248);
    let tagX = 15;
    tags.forEach((tag) => {
      const tagWidth = doc.getTextWidth(tag) + 6;
      doc.roundedRect(tagX, leftY, tagWidth, 8, 2, 2, "F");
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFontSize(7);
      doc.text(tag, tagX + 3, leftY + 5.5);
      tagX += tagWidth + 3;
      if (tagX > 60) { tagX = 15; leftY += 10; }
    });

    // ===== COLUNA CENTRAL =====
    const centerX = 75;
    let centerY = yPos;

    // Bio Section
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Perfil", centerX, centerY);
    centerY += 8;
    
    doc.setTextColor(80, 80, 85);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const bioTexto = [
      `Cliente acompanhado pelo serviço de psicologia organizacional.`,
      cliente.endereco ? `Localizado em: ${cliente.endereco.substring(0, 50)}` : "",
      `Contato: ${cliente.email || cliente.celular || cliente.telefone || "Não informado"}`,
    ].filter(Boolean).join(" ");
    const bioLinhas = doc.splitTextToSize(bioTexto, 60);
    doc.text(bioLinhas, centerX, centerY);
    centerY += bioLinhas.length * 5 + 10;

    // Indicadores de Acompanhamento (baseados nas anotações)
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Indicadores de Acompanhamento", centerX, centerY);
    centerY += 10;

    // Contar estados emocionais das anotações
    const estadosCount: Record<string, number> = {};
    const tendenciasCount: Record<string, number> = {};
    const urgenciasCount: Record<string, number> = {};
    const tiposCount: Record<string, number> = {};
    
    anotacoesCliente.forEach((a) => {
      if (a.estadoEmocional) estadosCount[a.estadoEmocional] = (estadosCount[a.estadoEmocional] || 0) + 1;
      if (a.tendencia) tendenciasCount[a.tendencia] = (tendenciasCount[a.tendencia] || 0) + 1;
      if (a.urgencia) urgenciasCount[a.urgencia] = (urgenciasCount[a.urgencia] || 0) + 1;
      if (a.tipoAcompanhamento) tiposCount[a.tipoAcompanhamento] = (tiposCount[a.tipoAcompanhamento] || 0) + 1;
    });

    // Função para obter o mais frequente
    const getMaisFrequente = (obj: Record<string, number>): string => {
      const entries = Object.entries(obj);
      if (entries.length === 0) return "-";
      return entries.sort((a, b) => b[1] - a[1])[0][0];
    };

    // Labels dos indicadores reais
    const indicadoresReais = [
      { label: "Estado Emocional", value: getMaisFrequente(estadosCount) },
      { label: "Tendência", value: getMaisFrequente(tendenciasCount) },
      { label: "Nível de Urgência", value: getMaisFrequente(urgenciasCount) },
      { label: "Tipo Acompanhamento", value: getMaisFrequente(tiposCount) },
    ];

    // Cores por tipo de indicador
    const coresIndicador: Record<string, [number, number, number]> = {
      // Estados Emocionais
      "Colaborativo": [34, 197, 94], "Motivado": [16, 185, 129], "Neutro": [148, 163, 184],
      "Ansioso": [251, 191, 36], "Estressado": [249, 115, 22], "Desmotivado": [239, 68, 68],
      // Tendências
      "Proativo": [34, 197, 94], "Engajado": [16, 185, 129], "Estável": [148, 163, 184],
      "Em adaptação": [251, 191, 36], "Reativo": [249, 115, 22], "Resistente": [239, 68, 68],
      // Urgências
      "Baixa": [34, 197, 94], "Média": [251, 191, 36], "Alta": [249, 115, 22], "Crítica": [239, 68, 68],
      // Tipos
      "Rotina": [148, 163, 184], "Desenvolvimento": [59, 130, 246], "Orientação": [16, 185, 129],
      "Feedback": [251, 191, 36], "Avaliação": [139, 92, 246], "Conflito": [249, 115, 22], "Crise": [239, 68, 68],
    };

    indicadoresReais.forEach((ind) => {
      // Label
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text(ind.label, centerX, centerY);
      
      // Valor com cor adequada
      const cor = coresIndicador[ind.value] || [100, 100, 100];
      if (ind.value !== "-") {
        doc.setFillColor(cor[0], cor[1], cor[2]);
        const valorWidth = Math.min(doc.getTextWidth(ind.value) + 8, 55);
        doc.roundedRect(centerX, centerY + 3, valorWidth, 10, 2, 2, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(ind.value, centerX + 4, centerY + 10);
      } else {
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(8);
        doc.setFont("helvetica", "italic");
        doc.text("Não registrado", centerX, centerY + 10);
      }
      centerY += 18;
    });

    // ===== COLUNA DIREITA =====
    const rightX = 145;
    let rightY = yPos;

    // Estatísticas
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Estatísticas", rightX, rightY);
    rightY += 10;

    const stats = [
      { label: "Anotações", value: anotacoesCliente.length.toString() },
      { label: "Eventos", value: eventosCliente.length.toString() },
      { label: "Receitas", value: `R$ ${receitasCliente.toFixed(0)}` },
    ];

    stats.forEach((stat) => {
      doc.setTextColor(80, 80, 85);
      doc.setFontSize(8);
      doc.text(stat.label, rightX, rightY);
      doc.setTextColor(50, 50, 55);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(stat.value, rightX, rightY + 8);
      doc.setFont("helvetica", "normal");
      rightY += 18;
    });

    // Distribuição detalhada dos indicadores
    if (Object.keys(estadosCount).length > 0 || Object.keys(tendenciasCount).length > 0) {
      rightY += 10;
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Distribuição", rightX, rightY);
      rightY += 8;

      // Estados Emocionais
      if (Object.keys(estadosCount).length > 0) {
        doc.setTextColor(100, 100, 105);
        doc.setFontSize(7);
        doc.setFont("helvetica", "italic");
        doc.text("Estados:", rightX, rightY);
        rightY += 5;
        Object.entries(estadosCount).slice(0, 3).forEach(([estado, count]) => {
          doc.setTextColor(80, 80, 85);
          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          doc.text(`• ${estado}: ${count}x`, rightX, rightY);
          rightY += 5;
        });
        rightY += 3;
      }

      // Tendências
      if (Object.keys(tendenciasCount).length > 0) {
        doc.setTextColor(100, 100, 105);
        doc.setFontSize(7);
        doc.setFont("helvetica", "italic");
        doc.text("Tendências:", rightX, rightY);
        rightY += 5;
        Object.entries(tendenciasCount).slice(0, 3).forEach(([tendencia, count]) => {
          doc.setTextColor(80, 80, 85);
          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          doc.text(`• ${tendencia}: ${count}x`, rightX, rightY);
          rightY += 5;
        });
        rightY += 3;
      }

      // Urgências
      if (Object.keys(urgenciasCount).length > 0) {
        doc.setTextColor(100, 100, 105);
        doc.setFontSize(7);
        doc.setFont("helvetica", "italic");
        doc.text("Urgências:", rightX, rightY);
        rightY += 5;
        Object.entries(urgenciasCount).slice(0, 3).forEach(([urgencia, count]) => {
          doc.setTextColor(80, 80, 85);
          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          doc.text(`• ${urgencia}: ${count}x`, rightX, rightY);
          rightY += 5;
        });
      }
    }

    // Página 2: Anotações Recentes
    if (anotacoesCliente.length > 0) {
      doc.addPage();
      
      // Header secundário
      doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.rect(0, 0, pageWidth, 25, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Histórico de Acompanhamento", 20, 17);

      let yAnotacoes = 40;
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Últimas Anotações", 20, yAnotacoes);
      yAnotacoes += 12;

      anotacoesCliente.slice(0, 8).forEach((anot, index) => {
        // Card da anotação
        doc.setFillColor(248, 248, 252);
        doc.roundedRect(15, yAnotacoes - 4, pageWidth - 30, 28, 3, 3, "F");
        
        // Data
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text(new Date(anot.dataCriacao).toLocaleDateString("pt-BR"), 20, yAnotacoes);
        
        // Badges de indicadores
        let badgeX = 60;
        if (anot.estadoEmocional) {
          doc.setFillColor(230, 240, 230);
          const badgeWidth = doc.getTextWidth(anot.estadoEmocional) + 4;
          doc.roundedRect(badgeX, yAnotacoes - 3, badgeWidth, 6, 1, 1, "F");
          doc.setTextColor(60, 120, 60);
          doc.setFontSize(6);
          doc.text(anot.estadoEmocional, badgeX + 2, yAnotacoes);
          badgeX += badgeWidth + 3;
        }
        if (anot.tendencia) {
          doc.setFillColor(230, 235, 250);
          const badgeWidth = doc.getTextWidth(anot.tendencia) + 4;
          doc.roundedRect(badgeX, yAnotacoes - 3, badgeWidth, 6, 1, 1, "F");
          doc.setTextColor(70, 80, 150);
          doc.setFontSize(6);
          doc.text(anot.tendencia, badgeX + 2, yAnotacoes);
        }
        
        // Texto da anotação
        yAnotacoes += 8;
        doc.setTextColor(60, 60, 65);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        const textoTruncado = anot.texto.length > 150 ? anot.texto.substring(0, 150) + "..." : anot.texto;
        const linhas = doc.splitTextToSize(textoTruncado, pageWidth - 40);
        doc.text(linhas, 20, yAnotacoes);
        
        yAnotacoes += Math.max(linhas.length * 5, 10) + 12;

        if (yAnotacoes > 260 && index < anotacoesCliente.length - 1) {
          doc.addPage();
          yAnotacoes = 30;
        }
      });
    }

    // Rodapé em todas as páginas
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 155);
      doc.text(
        `Gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")} - Ordenate`,
        105,
        285,
        { align: "center" }
      );
      doc.text(`${i} / ${totalPages}`, pageWidth - 20, 285);
    }

    const nomeArquivo = `persona_${cliente.nome.replace(/\s+/g, "_").toLowerCase()}_${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(nomeArquivo);
    setLoadingPDF(false);
    showToast(`Relatório de ${cliente.nome} gerado com sucesso!`, "success");
  };

  // Função auxiliar para calcular idade
  const calcularIdade = (dataNascimento: string): number => {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  // Função para gerar relatório PDF semanal
  const gerarRelatorioPDF = async () => {
    if (clientes.length === 0) {
      showToast("Não há dados para gerar o relatório.", "warning");
      return;
    }

    setLoadingPDF(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;

      // Cores do tema
      const purple = [147, 51, 234];
      const fuchsia = [236, 72, 153];
      const indigo = [99, 102, 241];

      // Cabeçalho
      doc.setFillColor(purple[0], purple[1], purple[2]);
      doc.rect(0, 0, pageWidth, 50, "F");
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("ORDENATE", 20, 25);
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Relatório Semanal de Atendimentos", 20, 35);
      
      const dataAtual = new Date();
      const dataFormatada = dataAtual.toLocaleDateString("pt-BR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      doc.setFontSize(10);
      doc.text(`Gerado em: ${dataFormatada}`, pageWidth - 20, 35, { align: "right" });

      yPosition = 60;

      // Resumo Executivo
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Resumo Executivo", 20, yPosition);
      yPosition += 10;

      const totalClientes = clientes.length;
      const clientesAtivos = clientes.filter((c) => c.status === "Ativo").length;
      const emAvaliacao = clientes.filter((c) => c.status === "Em avaliação").length;
      const clientesInativos = clientes.filter((c) => c.status === "Inativo").length;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      const resumoTexto = [
        `Este relatório apresenta um panorama completo das atividades de atendimento da semana.`,
        `Durante o período analisado, foram registrados ${totalClientes} ${totalClientes === 1 ? "cliente" : "clientes"} no sistema.`,
        `Em relação ao status, ${clientesAtivos} ${clientesAtivos === 1 ? "cliente está ativo" : "clientes estão ativos"}, ${emAvaliacao} ${emAvaliacao === 1 ? "está em avaliação" : "estão em avaliação"} e ${clientesInativos} ${clientesInativos === 1 ? "está inativo" : "estão inativos"}.`,
      ];

      resumoTexto.forEach((linha) => {
        const lines = doc.splitTextToSize(linha, pageWidth - 40);
        lines.forEach((line: string) => {
          if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(line, 20, yPosition);
          yPosition += 6;
        });
        yPosition += 2;
      });

      yPosition += 10;

      // Estatísticas em Cards
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Estatísticas Principais", 20, yPosition);
      yPosition += 15;

      const cardWidth = (pageWidth - 50) / 3;
      const cardHeight = 30;
      const cardY = yPosition;

      // Card 1 - Total
      // Fundo com cor mais clara (simulando transparência)
      doc.setFillColor(200, 180, 250); // Roxo claro
      doc.roundedRect(20, cardY, cardWidth, cardHeight, 3, 3, "F");
      doc.setFillColor(purple[0], purple[1], purple[2]);
      doc.roundedRect(20, cardY, cardWidth, 5, 3, 3, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text("Total de Clientes", 25, cardY + 3.5);
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text(totalClientes.toString(), 25, cardY + 18);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("registros", 25, cardY + 25);

      // Card 2 - Ativos
      doc.setFillColor(250, 200, 220); // Rosa claro
      doc.roundedRect(25 + cardWidth, cardY, cardWidth, cardHeight, 3, 3, "F");
      doc.setFillColor(fuchsia[0], fuchsia[1], fuchsia[2]);
      doc.roundedRect(25 + cardWidth, cardY, cardWidth, 5, 3, 3, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text("Clientes Ativos", 30 + cardWidth, cardY + 3.5);
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text(clientesAtivos.toString(), 30 + cardWidth, cardY + 18);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      const percentAtivos = totalClientes > 0 ? Math.round((clientesAtivos / totalClientes) * 100) : 0;
      doc.text(`${percentAtivos}% do total`, 30 + cardWidth, cardY + 25);

      // Card 3 - Em Avaliação
      doc.setFillColor(200, 200, 250); // Azul claro
      doc.roundedRect(30 + cardWidth * 2, cardY, cardWidth, cardHeight, 3, 3, "F");
      doc.setFillColor(indigo[0], indigo[1], indigo[2]);
      doc.roundedRect(30 + cardWidth * 2, cardY, cardWidth, 5, 3, 3, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text("Em Avaliação", 35 + cardWidth * 2, cardY + 3.5);
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text(emAvaliacao.toString(), 35 + cardWidth * 2, cardY + 18);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("Requerem atenção", 35 + cardWidth * 2, cardY + 25);

      yPosition += cardHeight + 20;

      const tipoWidth = pageWidth - 40;
      const tipoBarHeight = 20;

      // Gráfico - Distribuição por Status
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Distribuição por Status", 20, yPosition);
      yPosition += 10;

      const maxStatus = Math.max(clientesAtivos, emAvaliacao, clientesInativos, 1);
      const statusColors = [
        [34, 197, 94], // Verde para Ativo
        [251, 191, 36], // Amarelo para Em avaliação
        [239, 68, 68], // Vermelho para Inativo
      ];
      const statusData = [
        { label: "Ativo", value: clientesAtivos, color: statusColors[0] },
        { label: "Em avaliação", value: emAvaliacao, color: statusColors[1] },
        { label: "Inativo", value: clientesInativos, color: statusColors[2] },
      ];

      statusData.forEach((status) => {
        if (status.value > 0) {
          const statusWidth = (status.value / maxStatus) * tipoWidth;
          doc.setFillColor(status.color[0], status.color[1], status.color[2]);
          doc.rect(20, yPosition, statusWidth, tipoBarHeight, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(10);
          doc.text(`${status.label}: ${status.value}`, 25, yPosition + 13);
          yPosition += tipoBarHeight + 5;
        }
      });

      yPosition += 15;

      // Análise e Observações
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Análise e Observações", 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      const analiseTexto = [
        `Com base nos dados apresentados, a distribuição de clientes demonstra o nível de atividade do serviço de psicologia organizacional.`,
        `A proporção de clientes ativos (${percentAtivos}%) indica um bom nível de engajamento e acompanhamento contínuo.`,
        emAvaliacao > 0
          ? `É importante dar atenção especial aos ${emAvaliacao} ${emAvaliacao === 1 ? "cliente em avaliação" : "clientes em avaliação"}, garantindo que recebam o suporte necessário.`
          : `Todos os clientes estão com status definido, o que facilita o acompanhamento e gestão.`,
      ];

      analiseTexto.forEach((linha) => {
        const lines = doc.splitTextToSize(linha, pageWidth - 40);
        lines.forEach((line: string) => {
          if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(line, 20, yPosition);
          yPosition += 6;
        });
        yPosition += 2;
      });

      // Rodapé
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Página ${i} de ${totalPages} | Ordenate - Sistema de Psicologia Organizacional`,
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" }
        );
      }

      // Salvar PDF
      const dataAtualStr = new Date().toISOString().split("T")[0];
      const nomeArquivo = `relatorio_semanal_${dataAtualStr}.pdf`;
      doc.save(nomeArquivo);

      showToast("Relatório PDF gerado com sucesso!", "success");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      showToast("Erro ao gerar o relatório PDF.", "error");
    } finally {
      setLoadingPDF(false);
    }
  };

  // Função para gerar relatório PDF mensal (mais elaborado)
  const gerarRelatorioPDFMensal = async () => {
    if (clientes.length === 0) {
      showToast("Não há dados para gerar o relatório.", "warning");
      return;
    }

    setLoadingPDF(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;

      // Cores do tema
      const purple = [147, 51, 234];
      const fuchsia = [236, 72, 153];
      const indigo = [99, 102, 241];
      const green = [34, 197, 94];

      // Cabeçalho mais elaborado
      doc.setFillColor(purple[0], purple[1], purple[2]);
      doc.rect(0, 0, pageWidth, 60, "F");
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.setFont("helvetica", "bold");
      doc.text("ORDENATE", 20, 30);
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      doc.text("Relatório Mensal de Atendimentos", 20, 42);
      
      const dataAtual = new Date();
      const mesAtual = dataAtual.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
      doc.setFontSize(12);
      doc.text(`Período: ${mesAtual}`, 20, 52);
      
      doc.setFontSize(10);
      doc.text(`Gerado em: ${dataAtual.toLocaleDateString("pt-BR")}`, pageWidth - 20, 52, { align: "right" });

      yPosition = 70;

      // Índice/Sumário
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Sumário Executivo", 20, yPosition);
      yPosition += 10;

      const totalClientes = clientes.length;
      const clientesAtivos = clientes.filter((c) => c.status === "Ativo").length;
      const emAvaliacao = clientes.filter((c) => c.status === "Em avaliação").length;
      const clientesInativos = clientes.filter((c) => c.status === "Inativo").length;
      
      // Análise de criação no mês
      const hoje = new Date();
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const clientesNovosNoMes = clientes.filter((c) => {
        if (c.dataCriacao) {
          const dataCriacao = new Date(c.dataCriacao);
          return dataCriacao >= inicioMes;
        }
        return false;
      }).length;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      const resumoExecutivo = [
        `Este relatório mensal apresenta uma análise completa e detalhada das atividades de atendimento realizadas durante o mês de ${mesAtual}.`,
        `Durante o período, foram gerenciados ${totalClientes} ${totalClientes === 1 ? "registro" : "registros"} no sistema, sendo ${clientesNovosNoMes} ${clientesNovosNoMes === 1 ? "novo registro adicionado" : "novos registros adicionados"} neste mês.`,
        `A taxa de ativos no mês foi de ${Math.round((clientesAtivos / totalClientes) * 100) || 0}%, com ${clientesAtivos} ${clientesAtivos === 1 ? "cliente ativo" : "clientes ativos"}, ${emAvaliacao} em avaliação e ${clientesInativos} ${clientesInativos === 1 ? "inativo" : "inativos"}.`,
      ];

      resumoExecutivo.forEach((linha) => {
        const lines = doc.splitTextToSize(linha, pageWidth - 40);
        lines.forEach((line: string) => {
          if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(line, 20, yPosition);
          yPosition += 6;
        });
        yPosition += 2;
      });

      yPosition += 10;

      // Dashboard de Métricas Mensais (mais cards)
      if (yPosition > pageHeight - 100) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Dashboard de Métricas Mensais", 20, yPosition);
      yPosition += 15;

      const cardWidth = (pageWidth - 50) / 4;
      const cardHeight = 35;
      const cardY = yPosition;

      // Card 1 - Total
      doc.setFillColor(200, 180, 250);
      doc.roundedRect(20, cardY, cardWidth, cardHeight, 3, 3, "F");
      doc.setFillColor(purple[0], purple[1], purple[2]);
      doc.roundedRect(20, cardY, cardWidth, 6, 3, 3, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.text("Total Registros", 25, cardY + 4);
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text(totalClientes.toString(), 25, cardY + 20);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("Base total", 25, cardY + 28);

      // Card 2 - Novos no Mês
      doc.setFillColor(200, 250, 200);
      doc.roundedRect(25 + cardWidth, cardY, cardWidth, cardHeight, 3, 3, "F");
      doc.setFillColor(green[0], green[1], green[2]);
      doc.roundedRect(25 + cardWidth, cardY, cardWidth, 6, 3, 3, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.text("Novos no Mês", 30 + cardWidth, cardY + 4);
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text(clientesNovosNoMes.toString(), 30 + cardWidth, cardY + 20);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      const percentNovos = totalClientes > 0 ? Math.round((clientesNovosNoMes / totalClientes) * 100) : 0;
      doc.text(`${percentNovos}% do total`, 30 + cardWidth, cardY + 28);

      // Card 3 - Ativos
      doc.setFillColor(250, 200, 220);
      doc.roundedRect(30 + cardWidth * 2, cardY, cardWidth, cardHeight, 3, 3, "F");
      doc.setFillColor(fuchsia[0], fuchsia[1], fuchsia[2]);
      doc.roundedRect(30 + cardWidth * 2, cardY, cardWidth, 6, 3, 3, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.text("Clientes Ativos", 35 + cardWidth * 2, cardY + 4);
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text(clientesAtivos.toString(), 35 + cardWidth * 2, cardY + 20);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      const percentAtivos = totalClientes > 0 ? Math.round((clientesAtivos / totalClientes) * 100) : 0;
      doc.text(`${percentAtivos}% de ativos`, 35 + cardWidth * 2, cardY + 28);

      // Card 4 - Em Avaliação
      doc.setFillColor(200, 200, 250);
      doc.roundedRect(35 + cardWidth * 3, cardY, cardWidth, cardHeight, 3, 3, "F");
      doc.setFillColor(indigo[0], indigo[1], indigo[2]);
      doc.roundedRect(35 + cardWidth * 3, cardY, cardWidth, 6, 3, 3, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.text("Em Avaliação", 40 + cardWidth * 3, cardY + 4);
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text(emAvaliacao.toString(), 40 + cardWidth * 3, cardY + 20);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("Requer atenção", 40 + cardWidth * 3, cardY + 28);

      yPosition += cardHeight + 20;

      // Análise Detalhada por Tipo
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Análise da Base de Clientes", 20, yPosition);
      yPosition += 10;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      
      const analiseTipo = [
        `A base atual possui ${totalClientes} ${totalClientes === 1 ? "cliente" : "clientes"} cadastrados no sistema de psicologia organizacional.`,
        `A taxa de clientes ativos é de ${Math.round((clientesAtivos / totalClientes) * 100) || 0}%, indicando o nível de engajamento e acompanhamento contínuo.`,
      ];

      analiseTipo.forEach((linha) => {
        const lines = doc.splitTextToSize(linha, pageWidth - 40);
        lines.forEach((line: string) => {
          if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(line, 20, yPosition);
          yPosition += 6;
        });
        yPosition += 2;
      });

      yPosition += 10;

      const tipoWidth = pageWidth - 40;
      const tipoBarHeight = 25;

      // Gráfico - Distribuição por Status (com percentuais)
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Distribuição por Status (Com Percentuais)", 20, yPosition);
      yPosition += 10;

      const maxStatus = Math.max(clientesAtivos, emAvaliacao, clientesInativos, 1);
      const statusColors = [
        [34, 197, 94], // Verde para Ativo
        [251, 191, 36], // Amarelo para Em avaliação
        [239, 68, 68], // Vermelho para Inativo
      ];
      const statusData = [
        { label: "Ativo", value: clientesAtivos, color: statusColors[0], percent: Math.round((clientesAtivos / totalClientes) * 100) },
        { label: "Em avaliação", value: emAvaliacao, color: statusColors[1], percent: Math.round((emAvaliacao / totalClientes) * 100) },
        { label: "Inativo", value: clientesInativos, color: statusColors[2], percent: Math.round((clientesInativos / totalClientes) * 100) },
      ];

      statusData.forEach((status) => {
        if (status.value > 0) {
          const statusWidth = (status.value / maxStatus) * tipoWidth;
          doc.setFillColor(status.color[0], status.color[1], status.color[2]);
          doc.rect(20, yPosition, statusWidth, tipoBarHeight, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.text(`${status.label}: ${status.value} (${status.percent}%)`, 25, yPosition + 16);
          yPosition += tipoBarHeight + 8;
        }
      });

      yPosition += 15;

      // Análise de Gênero (se houver dados)
      const generos = clientes.filter((c) => c.genero);
      if (generos.length > 0) {
        if (yPosition > pageHeight - 80) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Distribuição por Gênero", 20, yPosition);
        yPosition += 10;

        const generoCounts: Record<string, number> = {};
        generos.forEach((c) => {
          generoCounts[c.genero] = (generoCounts[c.genero] || 0) + 1;
        });

        const maxGenero = Math.max(...Object.values(generoCounts), 1);
        let generoColors: Record<string, number[]> = {};
        const coresGenero = [
          [147, 51, 234], // Roxo
          [236, 72, 153], // Rosa
          [99, 102, 241], // Azul
          [34, 197, 94], // Verde
        ];
        let corIndex = 0;
        Object.keys(generoCounts).forEach((genero) => {
          generoColors[genero] = coresGenero[corIndex % coresGenero.length];
          corIndex++;
        });

        Object.entries(generoCounts).forEach(([genero, count]) => {
          const generoWidth = (count / maxGenero) * tipoWidth;
          const generoPercent = Math.round((count / generos.length) * 100);
          const color = generoColors[genero];
          doc.setFillColor(color[0], color[1], color[2]);
          doc.rect(20, yPosition, generoWidth, tipoBarHeight, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.text(`${genero}: ${count} (${generoPercent}%)`, 25, yPosition + 16);
          yPosition += tipoBarHeight + 8;
        });

        yPosition += 15;
      }

      // Recomendações e Insights Estratégicos
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Recomendações e Insights Estratégicos", 20, yPosition);
      yPosition += 10;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);

      const recomendacoes = [
        clientesNovosNoMes > 0 
          ? `• Crescimento observado: ${clientesNovosNoMes} ${clientesNovosNoMes === 1 ? "novo registro" : "novos registros"} adicionado${clientesNovosNoMes === 1 ? "" : "s"} no mês. Mantenha o foco em qualidade de atendimento.`
          : `• Estabilidade na base: Nenhum novo registro no mês. Considere estratégias de captação se necessário.`,
        percentAtivos >= 70 
          ? `• Excelente taxa de ativos (${percentAtivos}%): A maioria dos clientes está ativa, indicando boa retenção e engajamento.`
          : percentAtivos >= 50
          ? `• Taxa de ativos moderada (${percentAtivos}%): Há espaço para melhorar a retenção e engajamento dos clientes.`
          : `• Atenção necessária: Taxa de ativos abaixo de 50% (${percentAtivos}%). Considere revisar estratégias de acompanhamento.`,
        emAvaliacao > 0
          ? `• ${emAvaliacao} ${emAvaliacao === 1 ? "cliente está" : "clientes estão"} em avaliação. Priorize o acompanhamento para definição de status.`
          : `• Todos os clientes têm status definido. Continue mantendo o acompanhamento regular.`,
        `• Mantenha o foco no acompanhamento contínuo e desenvolvimento organizacional dos clientes.`,
      ];

      recomendacoes.forEach((linha) => {
        const lines = doc.splitTextToSize(linha, pageWidth - 40);
        lines.forEach((line: string) => {
          if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(line, 20, yPosition);
          yPosition += 6;
        });
        yPosition += 2;
      });

      yPosition += 10;

      // Conclusão Mensal
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Conclusão Mensal", 20, yPosition);
      yPosition += 10;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");

      const conclusao = [
        `O mês de ${mesAtual} apresentou uma base total de ${totalClientes} ${totalClientes === 1 ? "registro" : "registros"}, com foco em ${clientesAtivos >= totalClientes * 0.7 ? "manter a alta taxa de ativos" : "melhorar o engajamento dos clientes"}.`,
        `O serviço de psicologia organizacional mantém uma estrutura sólida para atender às necessidades de desenvolvimento e acompanhamento dos clientes.`,
        `Recomenda-se manter o acompanhamento regular, especialmente dos ${emAvaliacao > 0 ? `${emAvaliacao} clientes em avaliação` : "clientes ativos"}, garantindo qualidade e continuidade do atendimento.`,
        `Para o próximo mês, sugere-se ${clientesNovosNoMes > 0 ? "manter o ritmo de crescimento observado" : "explorar estratégias de captação"}, sempre priorizando a qualidade do atendimento e a satisfação dos clientes.`,
      ];

      conclusao.forEach((linha) => {
        const lines = doc.splitTextToSize(linha, pageWidth - 40);
        lines.forEach((line: string) => {
          if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(line, 20, yPosition);
          yPosition += 6;
        });
        yPosition += 2;
      });

      // Rodapé em todas as páginas
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Página ${i} de ${totalPages} | Relatório Mensal - Ordenate - Sistema de Psicologia Organizacional`,
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" }
        );
      }

      // Salvar PDF
      const dataAtualStr = new Date().toISOString().split("T")[0];
      const nomeArquivo = `relatorio_mensal_${mesAtual.replace(/\s/g, "_").toLowerCase()}_${dataAtualStr}.pdf`;
      doc.save(nomeArquivo);

      showToast("Relatório mensal gerado com sucesso!", "success");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      showToast("Erro ao gerar o relatório PDF.", "error");
    } finally {
      setLoadingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0416] text-slate-50">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-20 shrink-0 bg-[#0f0a1f] border-r border-white/10 flex flex-col items-center py-6 gap-4">
          {[
            { label: "Painel", icon: "🏠", image: "/icon-painel.png" },
            { label: "Clientes", icon: "👥", image: "/icon-clientes.png" },
            { label: "Pesquisa", icon: "🔍", image: "/icon-pesquisar.png" },
            { label: "Agenda", icon: "📅", image: "/icon-agenda.png" },
            { label: "Financeiro", icon: "💳", image: "/icon-financeiro.png" },
            { label: "Relatórios", icon: "📊", image: "/icon-relatorio.png" },
            { label: "Anotações", icon: "📝", image: "/icon-anotação.png" },
          ].map((item) => {
            const isActive = activeSection === item.label;
            return (
              <button
                key={item.label}
                onClick={() => setActiveSection(item.label)}
                className={`flex h-12 w-12 items-center justify-center rounded-xl text-lg transition-all duration-200 ${
                  isActive
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-900/50 scale-110"
                    : "bg-white/5 text-slate-200 hover:bg-white/10 hover:scale-105"
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
                  : activeSection === "Pesquisa"
                  ? "Busque e filtre clientes com precisão. Gere relatórios individuais."
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
            <div className="section-transition animate-fade-in">
              {/* Form principal + lista */}
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                {/* Form lado esquerdo */}
                <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-purple-900/30 text-sm text-slate-200 animate-fade-in hover-lift">
                  <h3 className="text-base font-semibold text-white">Cadastro de Cliente</h3>

              {/* Upload de Foto */}
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.15em] text-slate-400">Foto do cliente</p>
                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20 rounded-full border-2 border-dashed border-purple-500/40 bg-white/5 flex items-center justify-center overflow-hidden">
                    {form.fotoUrl ? (
                      <img 
                        src={form.fotoUrl} 
                        alt="Foto do cliente" 
                        className="h-full w-full object-cover rounded-full"
                      />
                    ) : (
                      <svg className="h-8 w-8 text-purple-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="cursor-pointer rounded-xl bg-purple-500/20 px-4 py-2 text-xs font-semibold text-purple-200 hover:bg-purple-500/30 transition text-center">
                      Carregar foto
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 2 * 1024 * 1024) {
                              showToast("A imagem deve ter no máximo 2MB", "warning");
                              return;
                            }
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setForm({ ...form, fotoUrl: reader.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    {form.fotoUrl && (
                      <button
                        onClick={() => setForm({ ...form, fotoUrl: "" })}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Remover foto
                      </button>
                    )}
                    <p className="text-[10px] text-slate-500">JPG, PNG ou GIF. Máx. 2MB</p>
                  </div>
                </div>
              </div>

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
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-[#0077B5]/20 border border-[#0077B5]/30">
                      <svg className="h-5 w-5 text-[#0077B5]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </div>
                    <input
                      value={form.linkedin}
                      onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                      placeholder="URL do LinkedIn (ex.: linkedin.com/in/usuario)"
                      className="flex-1 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-slate-100 outline-none focus:border-[#0077B5]"
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
                    <select
                      value={form.genero}
                      onChange={(e) => setForm({ ...form, genero: e.target.value })}
                      className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-slate-100 outline-none focus:border-purple-400"
                    >
                      <option value="" className="bg-slate-800 text-slate-400">Selecione o gênero</option>
                      <option value="Masculino" className="bg-slate-800 text-slate-100">Masculino</option>
                      <option value="Feminino" className="bg-slate-800 text-slate-100">Feminino</option>
                      <option value="Não binário" className="bg-slate-800 text-slate-100">Não binário</option>
                    </select>
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

              <button
                onClick={async () => {
                  if (!form.nome.trim()) {
                    showToast("Por favor, preencha pelo menos o nome do cliente.", "warning");
                    return;
                  }
                  setSavingClient(true);
                  await new Promise((resolve) => setTimeout(resolve, 500));
                  const agora = new Date().toISOString();
                  const novo: Cliente = {
                    id: crypto.randomUUID(),
                    ...form,
                    dataCriacao: agora,
                    dataAtualizacao: agora,
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
                    fotoUrl: "",
                    linkedin: "",
                  });
                  setSavingClient(false);
                  showToast(`Cliente "${novo.nome}" cadastrado com sucesso!`, "success");
                }}
                disabled={savingClient}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-900/40 hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingClient ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white" />
                    Cadastrando...
                  </>
                ) : (
                  <>
                    Cadastrar cliente
                    <span className="transition-transform">✓</span>
                  </>
                )}
              </button>
                </div>

                {/* Lista lado direito */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-purple-900/30 text-sm text-slate-200 animate-fade-in">
                  <h3 className="text-base font-semibold text-white">Clientes Cadastrados</h3>
                  <p className="text-xs text-slate-400 mt-1">Lista de todos os clientes</p>
                  {clientesFiltrados.length === 0 ? (
                    <p className="mt-3 text-slate-400 text-sm">
                      Nenhum cliente cadastrado ainda.
                    </p>
                  ) : (
                    <div className="mt-3 space-y-3">
                      {clientesFiltrados.map((c, index) => (
                        <div
                          key={c.id}
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 space-y-3 animate-fade-in hover-lift"
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <div className="flex items-start justify-between gap-2 text-slate-100">
                            {/* Foto mini */}
                            <button
                              onClick={() => setShowPerfilClienteModal(c.id)}
                              className="h-10 w-10 rounded-full bg-white/10 overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-purple-500 transition"
                              title="Ver perfil"
                            >
                              {c.fotoUrl ? (
                                <img src={c.fotoUrl} alt={c.nome} className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-purple-500/30 to-fuchsia-500/30">
                                  <span className="text-sm font-bold text-purple-300">{c.nome.charAt(0).toUpperCase()}</span>
                                </div>
                              )}
                            </button>
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setShowPerfilClienteModal(c.id)}
                                  className="font-semibold hover:text-purple-300 transition"
                                >
                                  {c.nome}
                                </button>
                                {c.dataCriacao && (
                                  <span className="text-[10px] text-slate-500">
                                    {new Date(c.dataCriacao).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                                  </span>
                                )}
                              </div>
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
                              {c.linkedin && (
                                <a
                                  href={c.linkedin.startsWith("http") ? c.linkedin : `https://${c.linkedin}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="rounded-lg bg-[#0077B5]/20 p-1.5 text-[#0077B5] hover:bg-[#0077B5]/30 transition-all hover:scale-110"
                                  title="Abrir LinkedIn"
                                >
                                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                  </svg>
                                </a>
                              )}
                              <button
                                onClick={() => gerarRelatorioCliente(c.id)}
                                disabled={loadingPDF}
                                className="rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-xs font-semibold text-purple-200 hover:bg-purple-500/20 transition-all hover:scale-105 disabled:opacity-50"
                                title="Gerar Relatório"
                              >
                                PDF
                              </button>
                              <button
                                onClick={() => handleDeleteClick(c.id, c.nome)}
                                className="rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-xs font-semibold text-rose-200 hover:bg-rose-500/20 transition-all hover:scale-105"
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


                          {/* Anotações do cliente (somente visualização) */}
                          {getAnotacoesCliente(c.id).length > 0 && (
                          <div className="space-y-2">
                              <label className="text-xs text-slate-300 flex items-center gap-2">
                                Anotações 
                                <span className="rounded-full bg-purple-500/30 px-2 py-0.5 text-xs">{getAnotacoesCliente(c.id).length}</span>
                              </label>
                              <div className="max-h-32 overflow-y-auto space-y-2 rounded-xl border border-white/10 bg-white/5 p-2">
                                {getAnotacoesCliente(c.id).slice(0, 3).map((anot) => (
                                  <div key={anot.id} className="rounded-lg bg-white/5 p-2 text-xs">
                                    <p className="text-slate-300">{anot.texto}</p>
                                    <p className="text-slate-500 text-[10px] mt-1">{new Date(anot.dataCriacao).toLocaleDateString("pt-BR")}</p>
                          </div>
                                ))}
                                {getAnotacoesCliente(c.id).length > 3 && (
                                  <p className="text-xs text-purple-400 text-center">+{getAnotacoesCliente(c.id).length - 3} anotações</p>
                                )}
                              </div>
                              <p className="text-xs text-slate-500">Gerencie na aba Anotações</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSection === "Pesquisa" && (
            <div className="mt-8 space-y-6 section-transition animate-fade-in">
              {/* Barra de Busca Principal */}
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/10 to-fuchsia-500/10 p-6 shadow-lg shadow-purple-900/30">
                <div className="flex flex-col gap-4">
                  <div className="flex w-full items-center rounded-xl border border-purple-500/30 bg-white/5 px-4 py-3 backdrop-blur-sm">
                    <svg className="h-5 w-5 text-purple-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                        <input
                      value={searchPesquisa}
                      onChange={(e) => setSearchPesquisa(e.target.value)}
                      className="flex-1 bg-transparent text-base text-white placeholder:text-slate-400 outline-none"
                      placeholder="Buscar por nome, email, telefone, CPF, RG... (Ctrl+K para focar)"
                    />
                    {searchPesquisa && (
                      <button
                        onClick={() => setSearchPesquisa("")}
                        className="ml-2 rounded-full p-1 text-slate-400 hover:text-white hover:bg-white/10 transition"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                      </div>

                  {searchPesquisa && (
                    <p className="text-sm text-purple-300">
                      <span className="font-semibold">{clientesFiltradosPesquisa.length}</span> {clientesFiltradosPesquisa.length === 1 ? "resultado encontrado" : "resultados encontrados"}
                    </p>
                  )}
                </div>
                      </div>

              {/* Filtros Avançados */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-purple-900/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Filtros Avançados</h3>
                  {(filterStatusPesquisa !== "Todos" || filterGeneroPesquisa !== "Todos" || searchPesquisa) && (
                    <button
                      onClick={() => {
                        setFilterStatusPesquisa("Todos");
                        setFilterGeneroPesquisa("Todos");
                        setSearchPesquisa("");
                      }}
                      className="text-sm text-purple-400 hover:text-purple-300 transition"
                    >
                      Limpar todos os filtros
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {/* Filtro Status */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-slate-300">Status</label>
                        <select
                      value={filterStatusPesquisa}
                      onChange={(e) => setFilterStatusPesquisa(e.target.value)}
                      className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-slate-100 outline-none focus:border-purple-400 transition"
                    >
                      <option value="Todos">Todos</option>
                      <option value="Ativo">Ativo</option>
                      <option value="Inativo">Inativo</option>
                      <option value="Em avaliação">Em avaliação</option>
                        </select>
                      </div>

                  {/* Filtro Gênero */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-slate-300">Gênero</label>
                    <select
                      value={filterGeneroPesquisa}
                      onChange={(e) => setFilterGeneroPesquisa(e.target.value)}
                      className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-slate-100 outline-none focus:border-purple-400 transition"
                    >
                      <option value="Todos">Todos</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                      <option value="Não binário">Não binário</option>
                      <option value="Prefiro não informar">Prefiro não informar</option>
                    </select>
                              </div>

                  {/* Ordenação */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-slate-300">Ordenar</label>
                    <select
                      value={sortByPesquisa}
                      onChange={(e) => setSortByPesquisa(e.target.value as "nome" | "data" | "status")}
                      className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-slate-100 outline-none focus:border-purple-400 transition"
                    >
                      <option value="data">Data de cadastro</option>
                      <option value="nome">Nome</option>
                      <option value="status">Status</option>
                    </select>
                        </div>
                      </div>

                {/* Controle de Ordem */}
                <div className="mt-4 flex items-center gap-3">
                      <button
                    onClick={() => setSortOrderPesquisa(sortOrderPesquisa === "asc" ? "desc" : "asc")}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-slate-100 hover:bg-white/15 transition"
                  >
                    {sortOrderPesquisa === "asc" ? (
                      <>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                        Crescente
                          </>
                        ) : (
                          <>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        Decrescente
                          </>
                        )}
                      </button>
                  
                  {/* Indicadores de Filtros Ativos */}
                  <div className="flex flex-wrap gap-2">
                    {filterStatusPesquisa !== "Todos" && (
                      <span className="rounded-full bg-purple-500/30 px-3 py-1 text-xs text-purple-100">
                        Status: {filterStatusPesquisa}
                      </span>
                    )}
                    {filterGeneroPesquisa !== "Todos" && (
                      <span className="rounded-full bg-pink-500/30 px-3 py-1 text-xs text-pink-100">
                        Gênero: {filterGeneroPesquisa}
                      </span>
                    )}
                  </div>
                    </div>
                  </div>

              {/* Resultados da Pesquisa */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-purple-900/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    Resultados
                    {clientesFiltradosPesquisa.length > 0 && (
                      <span className="ml-2 rounded-full bg-purple-500/30 px-2 py-0.5 text-sm font-normal text-purple-100">
                        {clientesFiltradosPesquisa.length}
                      </span>
                    )}
                  </h3>
                  {clientesFiltradosPesquisa.length > 0 && (
                    <button
                      onClick={async () => {
                        const wb = XLSX.utils.book_new();
                        const data = clientesFiltradosPesquisa.map((c) => ({
                          Nome: c.nome,
                          Email: c.email || "",
                          Telefone: c.telefone || "",
                          Celular: c.celular || "",
                          CPF: c.cpf || "",
                          RG: c.rg || "",
                          "Data de Nascimento": c.dataNascimento || "",
                          Gênero: c.genero || "",
                          Status: c.status || "",
                          Grupo: c.grupo || "",
                          "Plano Financeiro": c.planoFinanceiro || "",
                          "Valor Sessão": c.valorSessao || "",
                          Endereço: c.endereco || "",
                          Observações: c.observacoes || "",
                          "Data de Cadastro": c.dataCriacao ? new Date(c.dataCriacao).toLocaleDateString("pt-BR") : "",
                        }));
                        const ws = XLSX.utils.json_to_sheet(data);
                        XLSX.utils.book_append_sheet(wb, ws, "Clientes");
                        const nomeArquivo = `pesquisa_clientes_${new Date().toISOString().split("T")[0]}.xlsx`;
                        XLSX.writeFile(wb, nomeArquivo);
                        showToast("Exportado para Excel com sucesso!", "success");
                      }}
                      className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-green-900/40 hover:brightness-110 transition"
                    >
                      Exportar para Excel
                    </button>
                  )}
                </div>

                {clientesFiltradosPesquisa.length === 0 ? (
                  <div className="py-12 text-center">
                    <svg className="mx-auto h-16 w-16 text-slate-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p className="text-slate-400 text-lg font-medium">Nenhum resultado encontrado</p>
                    <p className="text-slate-500 text-sm mt-2">Tente ajustar os filtros ou limpar a busca</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {clientesFiltradosPesquisa.map((c, index) => {
                      const anotacoesCliente = getAnotacoesCliente(c.id);
                      const eventosCliente = eventos.filter((e) => e.clienteId === c.id);
                      const transacoesCliente = transacoes.filter((t) => t.clienteId === c.id);
                      const receitasCliente = transacoesCliente.filter((t) => t.tipo === "receita").reduce((acc, t) => acc + t.valor, 0);
                      
                      return (
                          <div
                            key={c.id}
                          className="rounded-xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition-all animate-fade-in hover-lift"
                          style={{ animationDelay: `${index * 0.03}s` }}
                        >
                          <div className="flex items-start gap-4">
                            {/* Foto */}
                            <button
                              onClick={() => setShowPerfilClienteModal(c.id)}
                              className="h-16 w-16 rounded-xl bg-white/10 overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-purple-500 transition"
                              title="Ver perfil completo"
                            >
                              {c.fotoUrl ? (
                                <img src={c.fotoUrl} alt={c.nome} className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-purple-500/30 to-fuchsia-500/30">
                                  <span className="text-xl font-bold text-purple-300">{c.nome.charAt(0).toUpperCase()}</span>
                                </div>
                              )}
                            </button>

                            <div className="flex-1 space-y-3">
                              {/* Cabeçalho do Cliente */}
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <button
                                      onClick={() => setShowPerfilClienteModal(c.id)}
                                      className="text-lg font-semibold text-white hover:text-purple-300 transition"
                                    >
                                      {c.nome}
                                    </button>
                                    <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs text-purple-100">
                                      {c.status}
                                    </span>
                                  </div>
                                  
                                  {/* Informações Principais */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-300">
                                    {c.email && <p><span className="text-slate-400">Email:</span> {c.email}</p>}
                                    {(c.telefone || c.celular) && (
                                      <p><span className="text-slate-400">Contato:</span> {c.telefone || c.celular}</p>
                                    )}
                                    {c.genero && <p><span className="text-slate-400">Gênero:</span> {c.genero}</p>}
                                    {c.dataCriacao && (
                                      <p><span className="text-slate-400">Cadastrado:</span> {new Date(c.dataCriacao).toLocaleDateString("pt-BR")}</p>
                                    )}
                              </div>
                              </div>
                            </div>

                              {/* Estatísticas Rápidas */}
                              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/10">
                                <div className="text-center">
                                  <p className="text-xs text-slate-400 mb-1">Anotações</p>
                                  <p className="text-lg font-bold text-purple-300">{anotacoesCliente.length}</p>
                              </div>
                                <div className="text-center">
                                  <p className="text-xs text-slate-400 mb-1">Eventos</p>
                                  <p className="text-lg font-bold text-blue-300">{eventosCliente.length}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs text-slate-400 mb-1">Receitas</p>
                                  <p className="text-lg font-bold text-green-300">R$ {receitasCliente.toFixed(2)}</p>
                                </div>
                              </div>


                              {/* Anotações Recentes (Preview) */}
                              {anotacoesCliente.length > 0 && (
                                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                                  <p className="text-xs font-semibold text-slate-300 mb-2">Última anotação:</p>
                                  <p className="text-sm text-slate-200 line-clamp-2">{anotacoesCliente[0].texto}</p>
                                  <p className="text-xs text-slate-500 mt-1">
                                    {new Date(anotacoesCliente[0].dataCriacao).toLocaleDateString("pt-BR")}
                                  </p>
                              </div>
                            )}
                            </div>

                            {/* Botões de Ação */}
                            <div className="flex flex-col gap-2">
                              {c.linkedin && (
                                <a
                                  href={c.linkedin.startsWith("http") ? c.linkedin : `https://${c.linkedin}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-center gap-2 rounded-xl bg-[#0077B5]/20 border border-[#0077B5]/30 px-4 py-2 text-sm font-semibold text-[#0077B5] hover:bg-[#0077B5]/30 transition"
                                >
                                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                  </svg>
                                  LinkedIn
                                </a>
                              )}
                              <button
                                onClick={() => gerarRelatorioCliente(c.id)}
                                disabled={loadingPDF}
                                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-900/40 hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {loadingPDF ? (
                                  <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white" />
                                    Gerando...
                                  </>
                                ) : (
                                  <>
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Relatório PDF
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setActiveSection("Anotações");
                                  setClienteSelecionadoAnotacao(c.id);
                                }}
                                className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10 transition"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Ver Anotações
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                      </div>
                    )}
                  </div>
            </div>
          )}

          {activeSection === "Painel" && (
            <div className="mt-8 space-y-6 section-transition animate-fade-in">
              {/* Indicador de Filtros Ativos */}
              {(Object.keys(filtrosAtivos).length > 0) && (
                <div className="rounded-2xl bg-purple-500/20 p-4 border border-purple-500/30 animate-bounce-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-purple-200 font-semibold">Filtros ativos:</span>
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
                <div className="rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-900/20 p-5 shadow-lg shadow-purple-900/30 animate-scale-in hover-lift">
                  <p className="text-sm text-purple-200 mb-1">Total de Clientes</p>
                  <p className="text-3xl font-bold text-white">{clientesFiltradosParaGraficos.length}</p>
                  <p className="text-xs text-purple-300 mt-1">Cadastrados no sistema</p>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-fuchsia-500/20 to-fuchsia-900/20 p-5 shadow-lg shadow-fuchsia-900/30 animate-scale-in hover-lift" style={{ animationDelay: "0.1s" }}>
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
                <div className="rounded-2xl bg-gradient-to-br from-indigo-500/20 to-indigo-900/20 p-5 shadow-lg shadow-indigo-900/30 animate-scale-in hover-lift" style={{ animationDelay: "0.2s" }}>
                  <p className="text-sm text-indigo-200 mb-1">Em Avaliação</p>
                  <p className="text-3xl font-bold text-white">
                    {clientesFiltradosParaGraficos.filter((c) => c.status === "Em avaliação").length}
                  </p>
                  <p className="text-xs text-indigo-300 mt-1">Requerem atenção</p>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-900/20 p-5 shadow-lg shadow-emerald-900/30 animate-scale-in hover-lift" style={{ animationDelay: "0.3s" }}>
                  <p className="text-sm text-emerald-200 mb-1">Total de Anotações</p>
                  <p className="text-3xl font-bold text-white">
                    {anotacoes.length}
                  </p>
                  <p className="text-xs text-emerald-300 mt-1">Registros de acompanhamento</p>
                </div>
              </div>

              {/* Gráficos */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Gráfico de Barras - Status */}
                <div className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 p-6 shadow-xl shadow-purple-900/40 animate-fade-in hover-lift border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-1">Distribuição por Status</h3>
                  <p className="text-xs text-purple-300 mb-4">Status atual dos seus clientes</p>
                  <ResponsiveContainer width="100%" height={280}>
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
                      margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient id="gradientAtivo" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#4ade80" />
                          <stop offset="100%" stopColor="#16a34a" />
                        </linearGradient>
                        <linearGradient id="gradientInativo" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f87171" />
                          <stop offset="100%" stopColor="#dc2626" />
                        </linearGradient>
                        <linearGradient id="gradientAvaliacao" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#fbbf24" />
                          <stop offset="100%" stopColor="#d97706" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        stroke="#94a3b8" 
                        tick={{ fill: '#cbd5e1', fontSize: 12 }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                      />
                      <YAxis 
                        stroke="#94a3b8" 
                        tick={{ fill: '#cbd5e1', fontSize: 11 }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                          border: '1px solid rgba(168, 85, 247, 0.3)', 
                          borderRadius: '12px',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                        }}
                        itemStyle={{ color: '#e2e8f0' }}
                        cursor={{ fill: 'rgba(168, 85, 247, 0.1)' }}
                      />
                      <Bar
                        dataKey="valor"
                        radius={[8, 8, 0, 0]}
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
                      >
                        {[
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
                        ].map((entry, index) => {
                          const statuses = ["Ativo", "Inativo", "Em avaliação"];
                          const statusSelecionado = statuses[index];
                          const isFiltered = filtrosAtivos.status && filtrosAtivos.status !== statusSelecionado;
                          const gradients = ["url(#gradientAtivo)", "url(#gradientInativo)", "url(#gradientAvaliacao)"];
                            return (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={gradients[index]} 
                              opacity={isFiltered ? 0.4 : 1}
                              style={{ filter: filtrosAtivos.status === statusSelecionado ? "drop-shadow(0 0 6px rgba(255,255,255,0.3))" : "none" }}
                            />
                          );
                        })}
                      </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  <p className="text-xs text-purple-400/70 mt-2 text-center italic">Clique nas barras para filtrar</p>
                  </div>

                {/* Gráfico de Gênero */}
                {clientesFiltradosParaGraficos.filter((c) => c.genero).length > 0 && (
                  <div className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 p-6 shadow-xl shadow-purple-900/40 animate-fade-in hover-lift border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-1">Distribuição por Gênero</h3>
                    <p className="text-xs text-purple-300 mb-4">Perfil demográfico dos seus clientes</p>
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <defs>
                          <linearGradient id="gradientGenero1" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#a855f7" />
                            <stop offset="100%" stopColor="#7c3aed" />
                          </linearGradient>
                          <linearGradient id="gradientGenero2" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#f472b6" />
                            <stop offset="100%" stopColor="#db2777" />
                          </linearGradient>
                          <linearGradient id="gradientGenero3" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#818cf8" />
                            <stop offset="100%" stopColor="#4f46e5" />
                          </linearGradient>
                          <linearGradient id="gradientGenero4" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#a78bfa" />
                            <stop offset="100%" stopColor="#7c3aed" />
                          </linearGradient>
                          <linearGradient id="gradientGenero5" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#c084fc" />
                            <stop offset="100%" stopColor="#9333ea" />
                          </linearGradient>
                        </defs>
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
                          innerRadius={55}
                          outerRadius={95}
                          paddingAngle={4}
                          dataKey="value"
                          stroke="none"
                          label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                          labelLine={{ stroke: '#a855f7', strokeWidth: 1 }}
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
                            const gradients = ["url(#gradientGenero1)", "url(#gradientGenero2)", "url(#gradientGenero3)", "url(#gradientGenero4)", "url(#gradientGenero5)"];
                            return Object.keys(generos).map((genero, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={gradients[index % gradients.length]} 
                                style={{ 
                                  cursor: "pointer", 
                                  opacity: filtrosAtivos.genero && filtrosAtivos.genero !== genero ? 0.4 : 1,
                                  filter: filtrosAtivos.genero === genero ? "drop-shadow(0 0 8px #a855f7)" : "none"
                                }} 
                              />
                            ));
                          })()}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                            border: '1px solid rgba(168, 85, 247, 0.3)', 
                            borderRadius: '12px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                          }}
                          itemStyle={{ color: '#e2e8f0' }}
                        />
                        <Legend 
                          wrapperStyle={{ paddingTop: '10px' }}
                          formatter={(value) => <span style={{ color: '#e2e8f0', fontSize: '12px' }}>{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <p className="text-xs text-purple-400/70 mt-2 text-center italic">Clique nos segmentos para filtrar</p>
                  </div>
                )}

                {/* Gráfico de Estados Emocionais nas Anotações */}
                {anotacoes.filter(a => a.estadoEmocional).length > 0 && (
                  <div className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 p-6 shadow-xl shadow-purple-900/40 animate-fade-in hover-lift border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-1">Estados Emocionais</h3>
                    <p className="text-xs text-purple-300 mb-4">Análise das anotações de acompanhamento</p>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart
                        data={(() => {
                          const estados = ["Colaborativo", "Motivado", "Neutro", "Ansioso", "Estressado", "Desmotivado"];
                          return estados.map(estado => ({
                            name: estado,
                            quantidade: anotacoes.filter(a => a.estadoEmocional === estado).length,
                          })).filter(item => item.quantidade > 0);
                        })()}
                        margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
                      >
                        <defs>
                          <linearGradient id="gradientEstadoPositivo" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#4ade80" />
                            <stop offset="100%" stopColor="#16a34a" />
                          </linearGradient>
                          <linearGradient id="gradientEstadoNeutro" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#94a3b8" />
                            <stop offset="100%" stopColor="#64748b" />
                          </linearGradient>
                          <linearGradient id="gradientEstadoAtencao" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#fbbf24" />
                            <stop offset="100%" stopColor="#d97706" />
                          </linearGradient>
                          <linearGradient id="gradientEstadoCritico" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f87171" />
                            <stop offset="100%" stopColor="#dc2626" />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          stroke="#94a3b8" 
                          tick={{ fill: '#cbd5e1', fontSize: 10 }}
                          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        />
                        <YAxis 
                          stroke="#94a3b8" 
                          tick={{ fill: '#cbd5e1', fontSize: 11 }}
                          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                            border: '1px solid rgba(168, 85, 247, 0.3)', 
                            borderRadius: '12px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                          }}
                          itemStyle={{ color: '#e2e8f0' }}
                          cursor={{ fill: 'rgba(168, 85, 247, 0.1)' }}
                        />
                        <Bar dataKey="quantidade" radius={[8, 8, 0, 0]}>
                          {(() => {
                            const estados = ["Colaborativo", "Motivado", "Neutro", "Ansioso", "Estressado", "Desmotivado"];
                            const data = estados.map(estado => ({
                              name: estado,
                              quantidade: anotacoes.filter(a => a.estadoEmocional === estado).length,
                            })).filter(item => item.quantidade > 0);
                            
                            return data.map((entry) => {
                              let gradient = "url(#gradientEstadoNeutro)";
                              if (entry.name === "Colaborativo" || entry.name === "Motivado") {
                                gradient = "url(#gradientEstadoPositivo)";
                              } else if (entry.name === "Ansioso") {
                                gradient = "url(#gradientEstadoAtencao)";
                              } else if (entry.name === "Estressado" || entry.name === "Desmotivado") {
                                gradient = "url(#gradientEstadoCritico)";
                              }
                              return <Cell key={`cell-${entry.name}`} fill={gradient} />;
                            });
                          })()}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <p className="text-xs text-purple-400/70 mt-2 text-center italic">Baseado nos registros de acompanhamento</p>
                  </div>
                )}

                {/* Gráfico de Tipos de Acompanhamento */}
                {anotacoes.filter(a => a.tipoAcompanhamento).length > 0 && (
                  <div className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 p-6 shadow-xl shadow-purple-900/40 animate-fade-in hover-lift border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-1">Tipos de Acompanhamento</h3>
                    <p className="text-xs text-purple-300 mb-4">Natureza das intervenções realizadas</p>
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <defs>
                          <linearGradient id="gradientRotina" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#a855f7" />
                            <stop offset="100%" stopColor="#7c3aed" />
                          </linearGradient>
                          <linearGradient id="gradientDesenv" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#06b6d4" />
                            <stop offset="100%" stopColor="#0891b2" />
                          </linearGradient>
                          <linearGradient id="gradientOrient" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#059669" />
                          </linearGradient>
                          <linearGradient id="gradientFeedback" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#d97706" />
                          </linearGradient>
                          <linearGradient id="gradientAval" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#2563eb" />
                          </linearGradient>
                          <linearGradient id="gradientConflito" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#f97316" />
                            <stop offset="100%" stopColor="#ea580c" />
                          </linearGradient>
                          <linearGradient id="gradientCrise" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#ef4444" />
                            <stop offset="100%" stopColor="#dc2626" />
                          </linearGradient>
                        </defs>
                        <Pie
                          data={(() => {
                            const tipos = ["Rotina", "Desenvolvimento", "Orientação", "Feedback", "Avaliação", "Conflito", "Crise"];
                            return tipos.map(tipo => ({
                              name: tipo,
                              value: anotacoes.filter(a => a.tipoAcompanhamento === tipo).length,
                            })).filter(item => item.value > 0);
                          })()}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={95}
                          paddingAngle={4}
                          dataKey="value"
                          stroke="none"
                          label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                          labelLine={{ stroke: '#a855f7', strokeWidth: 1 }}
                        >
                          {(() => {
                            const tipos = ["Rotina", "Desenvolvimento", "Orientação", "Feedback", "Avaliação", "Conflito", "Crise"];
                            const gradientMap: Record<string, string> = {
                              "Rotina": "url(#gradientRotina)",
                              "Desenvolvimento": "url(#gradientDesenv)",
                              "Orientação": "url(#gradientOrient)",
                              "Feedback": "url(#gradientFeedback)",
                              "Avaliação": "url(#gradientAval)",
                              "Conflito": "url(#gradientConflito)",
                              "Crise": "url(#gradientCrise)",
                            };
                            const data = tipos.map(tipo => ({
                              name: tipo,
                              value: anotacoes.filter(a => a.tipoAcompanhamento === tipo).length,
                            })).filter(item => item.value > 0);
                            
                            return data.map((entry) => (
                              <Cell key={`cell-${entry.name}`} fill={gradientMap[entry.name] || "url(#gradientRotina)"} />
                            ));
                          })()}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                            border: '1px solid rgba(168, 85, 247, 0.3)', 
                            borderRadius: '12px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                          }}
                          itemStyle={{ color: '#e2e8f0' }}
                        />
                        <Legend 
                          wrapperStyle={{ paddingTop: '10px' }}
                          formatter={(value) => <span style={{ color: '#e2e8f0', fontSize: '12px' }}>{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <p className="text-xs text-purple-400/70 mt-2 text-center italic">Distribuição das intervenções realizadas</p>
                  </div>
                )}
              </div>

              {/* Tabela Resumo */}
              <div className="rounded-2xl bg-white/5 p-6 shadow-lg shadow-purple-900/30 animate-fade-in hover-lift">
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

          {activeSection === "Agenda" && (
            <div className="mt-8 space-y-6 section-transition animate-fade-in">
              {/* Conexão com Google Calendar */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-purple-900/30">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-2">📅 Google Calendar</h2>
                    <p className="text-sm text-slate-300">
                      Conecte sua conta do Google para sincronizar eventos automaticamente.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {googleConnected ? (
                      <>
                        <span className="rounded-full bg-green-500/20 px-4 py-2 text-sm font-semibold text-green-200 border border-green-400/50">
                          ✓ Conectado
                        </span>
                        <button
                          onClick={() => {
                            setGoogleConnected(false);
                            setEventos([]);
                            showToast("Desconectado do Google Calendar", "info");
                          }}
                          className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10 transition"
                        >
                          Desconectar
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setGoogleConnected(true);
                          showToast("Conectado ao Google Calendar com sucesso!", "success");
                          carregarEventosGoogle();
                        }}
                        className="rounded-xl bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/40 hover:brightness-110 transition flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Conectar Google Calendar
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Calendário e Eventos */}
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Calendário */}
                <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-purple-900/30">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Calendário</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const novaData = new Date(selectedDate);
                          novaData.setMonth(novaData.getMonth() - 1);
                          setSelectedDate(novaData);
                        }}
                        className="rounded-lg bg-white/10 px-3 py-1 text-sm text-slate-200 hover:bg-white/20 transition"
                      >
                        ←
                      </button>
                      <span className="text-sm text-slate-200 font-medium min-w-[150px] text-center">
                        {selectedDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                      </span>
                      <button
                        onClick={() => {
                          const novaData = new Date(selectedDate);
                          novaData.setMonth(novaData.getMonth() + 1);
                          setSelectedDate(novaData);
                        }}
                        className="rounded-lg bg-white/10 px-3 py-1 text-sm text-slate-200 hover:bg-white/20 transition"
                      >
                        →
                      </button>
                      <button
                        onClick={() => setSelectedDate(new Date())}
                        className="rounded-lg bg-purple-500/20 px-3 py-1 text-sm text-purple-200 hover:bg-purple-500/30 transition"
                      >
                        Hoje
                      </button>
                    </div>
                  </div>
                  
                  {/* Grid do Calendário */}
                  <div className="grid grid-cols-7 gap-2">
                    {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((dia) => (
                      <div key={dia} className="text-center text-xs font-semibold text-slate-400 py-2">
                        {dia}
                      </div>
                    ))}
                    {gerarDiasCalendario(selectedDate).map((dia, index) => {
                      const diaAtual = new Date();
                      const isHoje = dia && dia.getDate() === diaAtual.getDate() && 
                                    dia.getMonth() === diaAtual.getMonth() && 
                                    dia.getFullYear() === diaAtual.getFullYear();
                      const isMesAtual = dia && dia.getMonth() === selectedDate.getMonth();
                      const eventosDia = eventos.filter((e) => {
                        if (!dia) return false;
                        const dataEvento = new Date(e.dataInicio || e.start?.dateTime || e.start?.date);
                        return dataEvento.toDateString() === dia.toDateString();
                      });
                      
                      return (
                        <div
                          key={index}
                          onClick={() => {
                            if (dia) {
                              const dataStr = dia.toISOString().split("T")[0];
                              setEventForm({
                                id: "",
                                titulo: "",
                                descricao: "",
                                dataInicio: dataStr,
                                horaInicio: "",
                                dataFim: dataStr,
                                horaFim: "",
                                clienteId: "",
                                local: "",
                                tipo: "Consulta",
                                valor: "",
                                realizado: false,
                                receitaGerada: false,
                              });
                              setShowEventModal(true);
                            }
                          }}
                          className={`min-h-[60px] rounded-lg border border-white/10 p-2 cursor-pointer transition hover:bg-white/10 ${
                            !dia || !isMesAtual ? "opacity-30" : ""
                          } ${isHoje ? "bg-purple-500/20 border-purple-400/50" : "bg-white/5"}`}
                        >
                          {dia && (
                            <>
                              <div className={`text-xs font-semibold mb-1 ${isHoje ? "text-purple-200" : "text-slate-300"}`}>
                                {dia.getDate()}
                              </div>
                              {eventosDia.length > 0 && (
                                <div className="space-y-1">
                                  {eventosDia.slice(0, 2).map((evento, idx) => {
                                    const dataEvento = new Date(evento.dataInicio || evento.start?.dateTime || evento.start?.date);
                                    return (
                                    <div
                                      key={idx}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                          setEventForm({
                                            id: evento.id || "",
                                            titulo: evento.titulo || evento.summary || "",
                                            descricao: evento.descricao || evento.description || "",
                                            dataInicio: dataEvento.toISOString().split("T")[0],
                                            horaInicio: dataEvento.toTimeString().slice(0, 5),
                                            dataFim: evento.dataFim ? new Date(evento.dataFim).toISOString().split("T")[0] : dataEvento.toISOString().split("T")[0],
                                            horaFim: evento.horaFim || dataEvento.toTimeString().slice(0, 5),
                                            clienteId: evento.clienteId || "",
                                            local: evento.local || evento.location || "",
                                            tipo: evento.tipo || "Consulta",
                                            valor: evento.valor || "",
                                            realizado: evento.realizado || false,
                                            receitaGerada: evento.receitaGerada || false,
                                          });
                                          setShowEventModal(true);
                                        }}
                                        className="text-[10px] bg-purple-500/30 text-purple-100 px-1 py-0.5 rounded truncate cursor-pointer hover:bg-purple-500/50 transition"
                                        title="Clique para editar ou excluir"
                                    >
                                      {evento.titulo || evento.summary || "Evento"}
                                    </div>
                                    );
                                  })}
                                  {eventosDia.length > 2 && (
                                    <div className="text-[10px] text-slate-400">
                                      +{eventosDia.length - 2}
                                    </div>
                                  )}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Lista de Eventos */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-purple-900/30">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Próximos Eventos</h3>
                    <button
                      onClick={() => {
                        const hoje = new Date();
                        const dataStr = hoje.toISOString().split("T")[0];
                        setEventForm({
                          id: "",
                          titulo: "",
                          descricao: "",
                          dataInicio: dataStr,
                          horaInicio: "09:00",
                          dataFim: dataStr,
                          horaFim: "10:00",
                          clienteId: "",
                          local: "",
                          tipo: "Consulta",
                          valor: "",
                          realizado: false,
                          receitaGerada: false,
                        });
                        setShowEventModal(true);
                      }}
                      className="rounded-lg bg-gradient-to-r from-purple-500 to-fuchsia-500 px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110 transition"
                    >
                      + Novo
                    </button>
                  </div>
                  
                  {loadingEvents ? (
                    <div className="flex items-center justify-center py-8">
                      <span className="h-6 w-6 animate-spin rounded-full border-2 border-purple-500/50 border-t-purple-500" />
                    </div>
                  ) : eventos.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-8">
                      Nenhum evento agendado
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                      {eventos
                        .sort((a, b) => {
                          const dataA = new Date(a.dataInicio || a.start?.dateTime || a.start?.date);
                          const dataB = new Date(b.dataInicio || b.start?.dateTime || b.start?.date);
                          return dataA.getTime() - dataB.getTime();
                        })
                        .filter((e) => {
                          const dataEvento = new Date(e.dataInicio || e.start?.dateTime || e.start?.date);
                          return dataEvento >= new Date(new Date().setHours(0, 0, 0, 0));
                        })
                        .slice(0, 10)
                        .map((evento, index) => {
                          const dataEvento = new Date(evento.dataInicio || evento.start?.dateTime || evento.start?.date);
                          const cliente = evento.clienteId ? clientes.find((c) => c.id === evento.clienteId) : null;
                          
                          return (
                            <div
                              key={evento.id || index}
                              className="rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div 
                                  className="flex-1 cursor-pointer"
                              onClick={() => {
                                setEventForm({
                                      id: evento.id || "",
                                  titulo: evento.titulo || evento.summary || "",
                                  descricao: evento.descricao || evento.description || "",
                                  dataInicio: dataEvento.toISOString().split("T")[0],
                                  horaInicio: dataEvento.toTimeString().slice(0, 5),
                                  dataFim: evento.dataFim ? new Date(evento.dataFim).toISOString().split("T")[0] : dataEvento.toISOString().split("T")[0],
                                  horaFim: evento.horaFim || dataEvento.toTimeString().slice(0, 5),
                                  clienteId: evento.clienteId || "",
                                  local: evento.local || evento.location || "",
                                      tipo: evento.tipo || "Consulta",
                                  valor: evento.valor || "",
                                  realizado: evento.realizado || false,
                                  receitaGerada: evento.receitaGerada || false,
                                });
                                setShowEventModal(true);
                              }}
                            >
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm font-semibold text-white">
                                    {evento.titulo || evento.summary || "Sem título"}
                                  </p>
                                    {evento.tipo && (
                                      <span className="text-xs bg-purple-500/30 text-purple-200 px-2 py-0.5 rounded">
                                        {evento.tipo}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-400 mb-1">
                                    {dataEvento.toLocaleDateString("pt-BR", {
                                      day: "2-digit",
                                      month: "short",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </p>
                                  {cliente && (
                                    <p className="text-xs text-purple-300">
                                      👤 {cliente.nome}
                                    </p>
                                  )}
                                  {evento.local || evento.location ? (
                                    <p className="text-xs text-slate-400 mt-1">
                                      📍 {evento.local || evento.location}
                                    </p>
                                  ) : null}
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmDeleteEvento({
                                      isOpen: true,
                                      eventoId: evento.id,
                                      eventoTitulo: evento.titulo || evento.summary || "Sem título",
                                    });
                                  }}
                                  className="text-red-400 hover:text-red-300 transition p-1 rounded hover:bg-red-500/20"
                                  title="Excluir evento"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal de Criar/Editar Evento */}
              {showEventModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                  <div className="rounded-2xl border border-white/10 bg-[#0b0416] p-6 w-full max-w-md shadow-2xl animate-scale-in">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-white">
                        {eventForm.id ? "Editar Evento" : "Novo Evento"}
                      </h3>
                      <button
                        onClick={() => {
                          setShowEventModal(false);
                          setEventForm({
                            id: "",
                            titulo: "",
                            descricao: "",
                            dataInicio: "",
                            horaInicio: "",
                            dataFim: "",
                            horaFim: "",
                            clienteId: "",
                            local: "",
                            tipo: "Consulta",
                            valor: "",
                            realizado: false,
                            receitaGerada: false,
                          });
                        }}
                        className="text-slate-400 hover:text-white transition"
                      >
                        ✕
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-slate-200 mb-1 block">Título *</label>
                        <input
                          value={eventForm.titulo}
                          onChange={(e) => setEventForm({ ...eventForm, titulo: e.target.value })}
                          placeholder="Título do evento"
                          className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-slate-100 outline-none focus:border-purple-400"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm text-slate-200 mb-1 block">Tipo de Evento</label>
                        <select
                          value={eventForm.tipo}
                          onChange={(e) => setEventForm({ ...eventForm, tipo: e.target.value })}
                          className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-slate-100 outline-none focus:border-purple-400"
                        >
                          <option value="Consulta">Consulta</option>
                          <option value="Avaliação">Avaliação</option>
                          <option value="Sessão">Sessão</option>
                          <option value="Reunião">Reunião</option>
                          <option value="Supervisão">Supervisão</option>
                          <option value="Atendimento">Atendimento</option>
                          <option value="Retorno">Retorno</option>
                          <option value="Outro">Outro</option>
                        </select>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm text-slate-200 mb-1 block">Data Início *</label>
                          <input
                            type="date"
                            value={eventForm.dataInicio}
                            onChange={(e) => setEventForm({ ...eventForm, dataInicio: e.target.value })}
                            className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-slate-100 outline-none focus:border-purple-400"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-slate-200 mb-1 block">Hora Início *</label>
                          <input
                            type="time"
                            value={eventForm.horaInicio}
                            onChange={(e) => setEventForm({ ...eventForm, horaInicio: e.target.value })}
                            className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-slate-100 outline-none focus:border-purple-400"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm text-slate-200 mb-1 block">Data Fim *</label>
                          <input
                            type="date"
                            value={eventForm.dataFim}
                            onChange={(e) => setEventForm({ ...eventForm, dataFim: e.target.value })}
                            className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-slate-100 outline-none focus:border-purple-400"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-slate-200 mb-1 block">Hora Fim *</label>
                          <input
                            type="time"
                            value={eventForm.horaFim}
                            onChange={(e) => setEventForm({ ...eventForm, horaFim: e.target.value })}
                            className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-slate-100 outline-none focus:border-purple-400"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm text-slate-200 mb-1 block">Cliente (opcional)</label>
                        <select
                          value={eventForm.clienteId}
                          onChange={(e) => setEventForm({ ...eventForm, clienteId: e.target.value })}
                          className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-slate-100 outline-none focus:border-purple-400"
                        >
                          <option value="">Selecione um cliente</option>
                          {clientes.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.nome}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-sm text-slate-200 mb-1 block">Local</label>
                        <input
                          value={eventForm.local}
                          onChange={(e) => setEventForm({ ...eventForm, local: e.target.value })}
                          placeholder="Local do evento"
                          className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-slate-100 outline-none focus:border-purple-400"
                        />
                      </div>

                      <div>
                        <label className="text-sm text-slate-200 mb-1 block">Valor (opcional)</label>
                        <input
                          type="text"
                          value={eventForm.valor}
                          onChange={(e) => setEventForm({ ...eventForm, valor: e.target.value })}
                          placeholder="0,00"
                          className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-slate-100 outline-none focus:border-purple-400"
                        />
                        <p className="text-xs text-slate-400 mt-1">
                          Se preenchido e evento marcado como realizado, gerará receita automaticamente
                        </p>
                      </div>

                      <div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={eventForm.realizado}
                            onChange={(e) => setEventForm({ ...eventForm, realizado: e.target.checked })}
                            className="rounded border-white/20 bg-white/10 text-purple-500 focus:ring-purple-400"
                            disabled={eventForm.receitaGerada}
                          />
                          <span className="text-sm text-slate-200">
                            Evento realizado
                          </span>
                        </label>
                        {eventForm.receitaGerada && (
                          <p className="text-xs text-green-400 mt-1">
                            ✓ Receita já foi gerada automaticamente
                          </p>
                        )}
                        {eventForm.realizado && eventForm.valor && !eventForm.receitaGerada && (
                          <p className="text-xs text-blue-400 mt-1">
                            ℹ️ Uma receita será criada automaticamente ao salvar
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label className="text-sm text-slate-200 mb-1 block">Descrição</label>
                        <textarea
                          value={eventForm.descricao}
                          onChange={(e) => setEventForm({ ...eventForm, descricao: e.target.value })}
                          placeholder="Descrição do evento"
                          className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-slate-100 outline-none focus:border-purple-400"
                          rows={3}
                        />
                      </div>
                      
                      <div className="flex gap-3 pt-2">
                        {eventForm.id && (
                        <button
                            onClick={() => {
                              setConfirmDeleteEvento({
                                isOpen: true,
                                eventoId: eventForm.id,
                                eventoTitulo: eventForm.titulo || "Sem título",
                              });
                              setShowEventModal(false);
                              setEventForm({
                                id: "",
                                titulo: "",
                                descricao: "",
                                dataInicio: "",
                                horaInicio: "",
                                dataFim: "",
                                horaFim: "",
                                clienteId: "",
                                local: "",
                                tipo: "Consulta",
                                valor: "",
                                realizado: false,
                                receitaGerada: false,
                              });
                            }}
                            className="rounded-xl border border-red-400/50 bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/30 transition"
                          >
                            🗑️ Excluir
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setShowEventModal(false);
                            setEventForm({
                              id: "",
                              titulo: "",
                              descricao: "",
                              dataInicio: "",
                              horaInicio: "",
                              dataFim: "",
                              horaFim: "",
                              clienteId: "",
                              local: "",
                              tipo: "Consulta",
                              valor: "",
                              realizado: false,
                              receitaGerada: false,
                            });
                          }}
                          className={`rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10 transition ${eventForm.id ? "flex-1" : ""}`}
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => {
                            if (!eventForm.titulo || !eventForm.dataInicio || !eventForm.horaInicio) {
                              showToast("Preencha pelo menos título, data e hora de início", "warning");
                              return;
                            }
                            criarEvento();
                          }}
                          className={`rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white hover:brightness-110 transition ${eventForm.id ? "flex-1" : "flex-1"}`}
                        >
                          {eventForm.id ? "Salvar Alterações" : "Salvar Evento"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSection === "Relatórios" && (
            <div className="mt-8 space-y-6 section-transition animate-fade-in">
              {/* Seleção de Tipo de Relatório */}
              <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-fuchsia-500/10 p-6 shadow-lg shadow-purple-900/30 hover-lift">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">📄 Relatórios em PDF</h2>
                    <p className="text-sm text-slate-300 mb-2">
                      Escolha entre relatório semanal ou mensal. Ambos incluem estatísticas, gráficos e análises detalhadas.
                    </p>
                    <p className="text-xs text-slate-400">
                      O relatório mensal é mais elaborado, com análises aprofundadas, recomendações estratégicas e insights detalhados.
                    </p>
                  </div>
                  <span className="rounded-full bg-purple-500/30 px-4 py-2 text-sm font-semibold text-purple-100 border border-purple-400/50">
                    {clientes.length} {clientes.length === 1 ? "registro" : "registros"}
                  </span>
                </div>

                {/* Seletor de Tipo */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                <button
                    onClick={() => setTipoRelatorio("semanal")}
                    className={`rounded-xl p-4 border-2 transition ${
                      tipoRelatorio === "semanal"
                        ? "border-purple-400 bg-purple-500/20 text-white"
                        : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">📊</div>
                      <div className="font-semibold">Semanal</div>
                      <div className="text-xs mt-1 opacity-80">
                        Resumo da semana
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setTipoRelatorio("mensal")}
                    className={`rounded-xl p-4 border-2 transition ${
                      tipoRelatorio === "mensal"
                        ? "border-fuchsia-400 bg-fuchsia-500/20 text-white"
                        : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">📈</div>
                      <div className="font-semibold">Mensal</div>
                      <div className="text-xs mt-1 opacity-80">
                        Análise completa
                      </div>
                    </div>
                  </button>
                </div>

                {/* Descrição do Tipo Selecionado */}
                <div className={`mb-4 p-4 rounded-xl ${
                  tipoRelatorio === "semanal"
                    ? "bg-purple-500/10 border border-purple-400/30"
                    : "bg-fuchsia-500/10 border border-fuchsia-400/30"
                }`}>
                  {tipoRelatorio === "semanal" ? (
                    <div>
                      <p className="text-sm text-slate-200 font-semibold mb-1">📊 Relatório Semanal</p>
                      <p className="text-xs text-slate-300">
                        Inclui: resumo executivo, estatísticas principais, gráficos de distribuição por tipo e status, análise de humor e observações gerais.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-slate-200 font-semibold mb-1">📈 Relatório Mensal (Elaborado)</p>
                      <p className="text-xs text-slate-300">
                        Inclui tudo do semanal, mais: dashboard de métricas mensais, análise detalhada por tipo, análise de gênero, recomendações estratégicas, insights detalhados e conclusão mensal completa.
                      </p>
                    </div>
                  )}
                </div>

                {/* Botão de Gerar */}
                <button
                  onClick={() => tipoRelatorio === "semanal" ? gerarRelatorioPDF() : gerarRelatorioPDFMensal()}
                  disabled={clientes.length === 0 || loadingPDF}
                  className={`w-full rounded-xl px-6 py-4 text-base font-bold text-white shadow-lg hover:brightness-110 transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    tipoRelatorio === "semanal"
                      ? "bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 shadow-purple-900/50"
                      : "bg-gradient-to-r from-fuchsia-600 via-purple-600 to-pink-600 shadow-fuchsia-900/50"
                  }`}
                >
                  {loadingPDF ? (
                    <>
                      <span className="mr-2 inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/50 border-t-white" />
                      Gerando relatório...
                    </>
                  ) : (
                    <>
                      {tipoRelatorio === "semanal" ? "📊 Gerar Relatório Semanal" : "📈 Gerar Relatório Mensal"}
                    </>
                  )}
                </button>
              </div>

              {/* Backup e Restauração */}
              <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-6 shadow-lg shadow-indigo-900/30 hover-lift">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-2">💾 Backup e Restauração</h2>
                    <p className="text-sm text-slate-300 mb-2">
                      Exporte todos os seus dados em JSON ou importe um backup anterior.
                    </p>
                    <p className="text-xs text-slate-400">
                      Útil para fazer backup completo, migrar dados ou restaurar informações.
                    </p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    onClick={exportarJSON}
                    className="rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 hover:brightness-110 transition"
                  >
                    📥 Exportar JSON Completo
                  </button>
                  <button
                    onClick={importarJSON}
                    className="rounded-xl border-2 border-indigo-400/50 bg-indigo-500/20 px-4 py-3 text-sm font-semibold text-indigo-100 hover:bg-indigo-500/30 transition"
                  >
                    📤 Importar JSON
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-purple-900/30 hover-lift">
                <h2 className="text-xl font-semibold text-white mb-2">Exportar Base de Dados</h2>
                <p className="text-sm text-slate-300 mb-6">
                  Baixe relatórios completos em formato Excel (.xlsx) com todos os clientes cadastrados.
                </p>

                <div className="grid gap-4 sm:grid-cols-1">
                  {/* Card Exportação */}
                  <div className="rounded-xl border border-white/10 bg-white/5 p-5 animate-scale-in hover-lift">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">Exportar Clientes</h3>
                        <p className="text-xs text-slate-400">Exporte todos os clientes cadastrados</p>
                      </div>
                      <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-100">
                        {clientes.length} registros
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 mb-4">
                      Exporta todos os dados dos clientes: informações pessoais, financeiras, endereço, etc.
                    </p>
                    <button
                      onClick={() => exportarParaExcel()}
                      disabled={clientes.length === 0 || loadingExport !== null}
                      className="w-full rounded-xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-900/40 hover:brightness-110 transition disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loadingExport !== null ? (
                        <>
                          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white" />
                          Exportando...
                        </>
                      ) : (
                        <>
                          📥 Baixar Excel - Todos os Clientes
                        </>
                      )}
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

          {activeSection === "Financeiro" && (
            <div className="mt-8 space-y-6 section-transition animate-fade-in">
              {(() => {
                const totais = calcularTotais();
                return (
                  <>
                    {/* Cards de Resumo */}
                    <div className="grid gap-6 md:grid-cols-3">
                      {/* Card Saldo */}
                      <div className="rounded-2xl border border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-6 shadow-lg shadow-green-900/30 hover-lift">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-white">Saldo</h3>
                          <span className="text-2xl">💰</span>
                        </div>
                        <p className={`text-3xl font-bold ${totais.saldo >= 0 ? "text-green-300" : "text-red-300"}`}>
                          R$ {totais.saldo.toFixed(2).replace(".", ",")}
                        </p>
                        <p className="text-xs text-slate-400 mt-2">
                          Saldo Total: R$ {totais.saldoTotal.toFixed(2).replace(".", ",")}
                        </p>
                      </div>

                      {/* Card Receitas */}
                      <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-6 shadow-lg shadow-blue-900/30 hover-lift">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-white">Receitas</h3>
                          <span className="text-2xl">📈</span>
                        </div>
                        <p className="text-3xl font-bold text-blue-300">
                          R$ {totais.receitas.toFixed(2).replace(".", ",")}
                        </p>
                        <p className="text-xs text-slate-400 mt-2">
                          Total: R$ {totais.receitasTotal.toFixed(2).replace(".", ",")}
                        </p>
                      </div>

                      {/* Card Despesas */}
                      <div className="rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-500/10 to-pink-500/10 p-6 shadow-lg shadow-red-900/30 hover-lift">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-white">Despesas</h3>
                          <span className="text-2xl">📉</span>
                        </div>
                        <p className="text-3xl font-bold text-red-300">
                          R$ {totais.despesas.toFixed(2).replace(".", ",")}
                        </p>
                        <p className="text-xs text-slate-400 mt-2">
                          Total: R$ {totais.despesasTotal.toFixed(2).replace(".", ",")}
                        </p>
                      </div>
                    </div>

                    {/* Filtros e Ações */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-purple-900/30">
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4 flex-wrap">
                      <div>
                            <label className="text-sm text-slate-200 mb-2 block">Período</label>
                            <select
                              value={filtroPeriodo}
                              onChange={(e) => setFiltroPeriodo(e.target.value as any)}
                              className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-slate-100 outline-none focus:border-purple-400"
                            >
                              <option value="hoje">Hoje</option>
                              <option value="semana">Esta Semana</option>
                              <option value="mes">Este Mês</option>
                              <option value="ano">Este Ano</option>
                              <option value="todos">Todos</option>
                            </select>
                      </div>

                          <div>
                            <label className="text-sm text-slate-200 mb-2 block">Tipo</label>
                            <select
                              value={filtroTipoTransacao}
                              onChange={(e) => setFiltroTipoTransacao(e.target.value as any)}
                              className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-slate-100 outline-none focus:border-purple-400"
                            >
                              <option value="todos">Todos</option>
                              <option value="receita">Receitas</option>
                              <option value="despesa">Despesas</option>
                            </select>
                    </div>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              setTransacaoForm({
                                id: "",
                                tipo: "receita",
                                valor: "",
                                descricao: "",
                                data: new Date().toISOString().split("T")[0],
                                formaPagamento: "Dinheiro",
                                clienteId: "",
                                categoria: "Outros",
                                observacoes: "",
                                pago: true,
                              });
                              setShowTransacaoModal(true);
                            }}
                            className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-green-900/40 hover:brightness-110 transition"
                          >
                            + Nova Receita
                          </button>
                          <button
                            onClick={() => {
                              setTransacaoForm({
                                id: "",
                                tipo: "despesa",
                                valor: "",
                                descricao: "",
                                data: new Date().toISOString().split("T")[0],
                                formaPagamento: "Dinheiro",
                                clienteId: "",
                                categoria: "Outros",
                                observacoes: "",
                                pago: true,
                              });
                              setShowTransacaoModal(true);
                            }}
                            className="rounded-xl bg-gradient-to-r from-red-500 to-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-900/40 hover:brightness-110 transition"
                          >
                            + Nova Despesa
                          </button>
                        </div>
                      </div>

                      {/* Gráficos Financeiros */}
                      <div className="grid gap-6 md:grid-cols-2 mb-6">
                        {/* Gráfico Receitas vs Despesas */}
                        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                          <h3 className="text-lg font-semibold text-white mb-4">Receitas vs Despesas</h3>
                          <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={[
                              { name: "Receitas", valor: totais.receitasTotal },
                              { name: "Despesas", valor: totais.despesasTotal },
                            ]}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                              <XAxis dataKey="name" stroke="#94a3b8" />
                              <YAxis stroke="#94a3b8" />
                              <Tooltip
                                cursor={{ fill: 'rgba(147, 51, 234, 0.05)' }}
                                contentStyle={{ 
                                  borderRadius: '8px', 
                                  border: 'none', 
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                                  backgroundColor: 'rgba(15, 23, 42, 0.98)',
                                  color: '#fff'
                                }}
                                formatter={(value: number | undefined) => `R$ ${(value || 0).toFixed(2).replace(".", ",")}`}
                              />
                              <Bar dataKey="valor" fill="#9333ea" radius={[8, 8, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Gráfico de Despesas por Categoria */}
                        {totais.transacoesFiltradas.filter((t) => t.tipo === "despesa").length > 0 && (
                          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Despesas por Categoria</h3>
                            <ResponsiveContainer width="100%" height={250}>
                              <PieChart>
                                <Pie
                                  data={(() => {
                                    const despesasPorCategoria: Record<string, number> = {};
                                    totais.transacoesFiltradas
                                      .filter((t) => t.tipo === "despesa" && t.categoria)
                                      .forEach((t) => {
                                        const cat = t.categoria || "Outros";
                                        despesasPorCategoria[cat] = (despesasPorCategoria[cat] || 0) + t.valor;
                                      });
                                    const cores: Record<string, string> = {
                                      "Aluguel": "#ef4444",
                                      "Equipamentos": "#f97316",
                                      "Materiais": "#eab308",
                                      "Marketing": "#22c55e",
                                      "Transporte": "#3b82f6",
                                      "Alimentação": "#a855f7",
                                      "Impostos": "#ec4899",
                                      "Salários": "#14b8a6",
                                      "Serviços": "#6366f1",
                                      "Outros": "#64748b",
                                    };
                                    return Object.entries(despesasPorCategoria).map(([name, value]) => ({
                                      name,
                                      value,
                                      fill: cores[name] || "#64748b",
                                    }));
                                  })()}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                                  outerRadius={80}
                                  dataKey="value"
                                >
                                  {(() => {
                                    const despesasPorCategoria: Record<string, number> = {};
                                    totais.transacoesFiltradas
                                      .filter((t) => t.tipo === "despesa" && t.categoria)
                                      .forEach((t) => {
                                        const cat = t.categoria || "Outros";
                                        despesasPorCategoria[cat] = (despesasPorCategoria[cat] || 0) + t.valor;
                                      });
                                    return Object.entries(despesasPorCategoria).map(([name], index) => {
                                      const cores: Record<string, string> = {
                                        "Aluguel": "#ef4444",
                                        "Equipamentos": "#f97316",
                                        "Materiais": "#eab308",
                                        "Marketing": "#22c55e",
                                        "Transporte": "#3b82f6",
                                        "Alimentação": "#a855f7",
                                        "Impostos": "#ec4899",
                                        "Salários": "#14b8a6",
                                        "Serviços": "#6366f1",
                                        "Outros": "#64748b",
                                      };
                                      return <Cell key={`cell-${index}`} fill={cores[name] || "#64748b"} />;
                                    });
                                  })()}
                                </Pie>
                                <Tooltip
                                  cursor={{ fill: 'rgba(147, 51, 234, 0.05)' }}
                                  contentStyle={{ 
                                    borderRadius: '8px', 
                                    border: 'none', 
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                                    backgroundColor: 'rgba(15, 23, 42, 0.98)',
                                    color: '#fff'
                                  }}
                                  formatter={(value: number | undefined) => `R$ ${(value || 0).toFixed(2).replace(".", ",")}`}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                        {/* Gráfico de Evolução Temporal (Fluxo de Caixa) */}
                        {totais.transacoesFiltradas.length > 0 && (
                          <div className="rounded-xl border border-white/10 bg-white/5 p-6 md:col-span-2">
                            <h3 className="text-lg font-semibold text-white mb-4">Fluxo de Caixa (Evolução)</h3>
                            <ResponsiveContainer width="100%" height={300}>
                              <LineChart
                                data={(() => {
                                  // Agrupar por mês
                                  const porMes: Record<string, { receitas: number; despesas: number; saldo: number }> = {};
                                  totais.transacoesFiltradas.forEach((t) => {
                                    const data = new Date(t.data);
                                    const mesAno = `${data.toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}`;
                                    if (!porMes[mesAno]) {
                                      porMes[mesAno] = { receitas: 0, despesas: 0, saldo: 0 };
                                    }
                                    if (t.tipo === "receita" && t.pago) {
                                      porMes[mesAno].receitas += t.valor;
                                    } else if (t.tipo === "despesa" && t.pago) {
                                      porMes[mesAno].despesas += t.valor;
                                    }
                                    porMes[mesAno].saldo = porMes[mesAno].receitas - porMes[mesAno].despesas;
                                  });
                                  return Object.entries(porMes)
                                    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
                                    .map(([name, values]) => ({ name, ...values }));
                                })()}
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                  cursor={{ fill: 'rgba(147, 51, 234, 0.05)' }}
                                  contentStyle={{ 
                                    borderRadius: '8px', 
                                    border: 'none', 
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                                    backgroundColor: 'rgba(15, 23, 42, 0.98)',
                                    color: '#fff'
                                  }}
                                  formatter={(value: number | undefined) => `R$ ${(value || 0).toFixed(2).replace(".", ",")}`}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="receitas" stroke="#22c55e" strokeWidth={2} name="Receitas" />
                                <Line type="monotone" dataKey="despesas" stroke="#ef4444" strokeWidth={2} name="Despesas" />
                                <Line type="monotone" dataKey="saldo" stroke="#3b82f6" strokeWidth={2} name="Saldo" />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </div>

                      {/* Lista de Transações */}
                      <div className="space-y-3 max-h-[500px] overflow-y-auto">
                        {totais.transacoesFiltradas.length === 0 ? (
                          <p className="text-center text-slate-400 py-8">
                            Nenhuma transação encontrada para os filtros selecionados
                          </p>
                        ) : (
                          totais.transacoesFiltradas
                            .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                            .map((transacao) => {
                              const cliente = transacao.clienteId ? clientes.find((c) => c.id === transacao.clienteId) : null;
                              return (
                                <div
                                  key={transacao.id}
                                  className={`rounded-xl border p-4 transition ${
                                    transacao.tipo === "receita"
                                      ? "border-green-500/30 bg-green-500/5 hover:bg-green-500/10"
                                      : "border-red-500/30 bg-red-500/5 hover:bg-red-500/10"
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-2">
                                        <span className={`text-lg font-bold ${
                                          transacao.tipo === "receita" ? "text-green-300" : "text-red-300"
                                        }`}>
                                          {transacao.tipo === "receita" ? "+" : "-"} R$ {transacao.valor.toFixed(2).replace(".", ",")}
                                        </span>
                                        {!transacao.pago && (
                                          <span className="text-xs bg-yellow-500/30 text-yellow-200 px-2 py-0.5 rounded">
                                            Pendente
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-sm font-semibold text-white mb-1">{transacao.descricao}</p>
                                      <div className="flex items-center gap-4 text-xs text-slate-400">
                                        <span>{new Date(transacao.data).toLocaleDateString("pt-BR")}</span>
                                        <span>{transacao.formaPagamento}</span>
                                        {transacao.categoria && <span>{transacao.categoria}</span>}
                                        {cliente && <span>👤 {cliente.nome}</span>}
                                      </div>
                                      {transacao.observacoes && (
                                        <p className="text-xs text-slate-300 mt-2">{transacao.observacoes}</p>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                    <button
                                        onClick={() => {
                                          setTransacaoForm({
                                            id: transacao.id,
                                            tipo: transacao.tipo,
                                            valor: transacao.valor.toString(),
                                            descricao: transacao.descricao,
                                            data: transacao.data.split("T")[0],
                                            formaPagamento: transacao.formaPagamento,
                                            clienteId: transacao.clienteId || "",
                                            categoria: transacao.categoria,
                                            observacoes: transacao.observacoes || "",
                                            pago: transacao.pago,
                                          });
                                          setShowTransacaoModal(true);
                                        }}
                                        className="text-blue-400 hover:text-blue-300 transition p-2 rounded hover:bg-blue-500/20"
                                        title="Editar"
                                      >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                      </button>
                                      <button
                                        onClick={() => excluirTransacao(transacao.id)}
                                        className="text-red-400 hover:text-red-300 transition p-2 rounded hover:bg-red-500/20"
                                        title="Excluir"
                                      >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                        )}
                      </div>
                    </div>

                    {/* Modal de Transação */}
                    {showTransacaoModal && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="rounded-2xl border border-white/10 bg-[#0b0416] p-6 w-full max-w-md shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-white">
                              {transacaoForm.id ? "Editar" : "Nova"} {transacaoForm.tipo === "receita" ? "Receita" : "Despesa"}
                            </h3>
                            <button
                              onClick={() => {
                                setShowTransacaoModal(false);
                                setTransacaoForm({
                                  id: "",
                                  tipo: "receita",
                                  valor: "",
                                  descricao: "",
                                  data: new Date().toISOString().split("T")[0],
                                  formaPagamento: "Dinheiro",
                                  clienteId: "",
                                  categoria: "Outros",
                                  observacoes: "",
                                  pago: true,
                                });
                              }}
                              className="text-slate-400 hover:text-white transition"
                            >
                              ✕
                            </button>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label className="text-sm text-slate-200 mb-1 block">Tipo *</label>
                              <div className="grid grid-cols-2 gap-3">
                                <button
                                  onClick={() => setTransacaoForm({ ...transacaoForm, tipo: "receita" })}
                                  className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                                    transacaoForm.tipo === "receita"
                                      ? "border-green-400 bg-green-500/20 text-green-200"
                                      : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                                  }`}
                                >
                                  📈 Receita
                                </button>
                                <button
                                  onClick={() => setTransacaoForm({ ...transacaoForm, tipo: "despesa" })}
                                  className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                                    transacaoForm.tipo === "despesa"
                                      ? "border-red-400 bg-red-500/20 text-red-200"
                                      : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                                  }`}
                                >
                                  📉 Despesa
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="text-sm text-slate-200 mb-1 block">Valor *</label>
                              <input
                                type="text"
                                value={transacaoForm.valor}
                                onChange={(e) => setTransacaoForm({ ...transacaoForm, valor: e.target.value })}
                                placeholder="0,00"
                                className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-slate-100 outline-none focus:border-purple-400"
                              />
                            </div>

                            <div>
                              <label className="text-sm text-slate-200 mb-1 block">Descrição *</label>
                              <input
                                type="text"
                                value={transacaoForm.descricao}
                                onChange={(e) => setTransacaoForm({ ...transacaoForm, descricao: e.target.value })}
                                placeholder={transacaoForm.tipo === "receita" ? "Ex: Pagamento de sessão" : "Ex: Aluguel do consultório"}
                                className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-slate-100 outline-none focus:border-purple-400"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-sm text-slate-200 mb-1 block">Data *</label>
                                <input
                                  type="date"
                                  value={transacaoForm.data}
                                  onChange={(e) => setTransacaoForm({ ...transacaoForm, data: e.target.value })}
                                  className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-slate-100 outline-none focus:border-purple-400"
                                />
                              </div>
                              <div>
                                <label className="text-sm text-slate-200 mb-1 block">Forma de Pagamento *</label>
                                <select
                                  value={transacaoForm.formaPagamento}
                                  onChange={(e) => setTransacaoForm({ ...transacaoForm, formaPagamento: e.target.value as FormaPagamento })}
                                  className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-slate-100 outline-none focus:border-purple-400"
                                >
                                  <option value="Dinheiro">Dinheiro</option>
                                  <option value="PIX">PIX</option>
                                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                                  <option value="Cartão de Débito">Cartão de Débito</option>
                                  <option value="Boleto">Boleto</option>
                                  <option value="Transferência">Transferência</option>
                                  <option value="Outro">Outro</option>
                                </select>
                              </div>
                            </div>

                            {transacaoForm.tipo === "receita" && (
                              <div>
                                <label className="text-sm text-slate-200 mb-1 block">Cliente (opcional)</label>
                                <select
                                  value={transacaoForm.clienteId}
                                  onChange={(e) => setTransacaoForm({ ...transacaoForm, clienteId: e.target.value })}
                                  className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-slate-100 outline-none focus:border-purple-400"
                                >
                                  <option value="">Selecione um cliente</option>
                                  {clientes.map((c) => (
                                    <option key={c.id} value={c.id}>
                                      {c.nome}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}

                            {transacaoForm.tipo === "despesa" && (
                              <div>
                                <label className="text-sm text-slate-200 mb-1 block">Categoria</label>
                                <select
                                  value={transacaoForm.categoria}
                                  onChange={(e) => setTransacaoForm({ ...transacaoForm, categoria: e.target.value as CategoriaDespesa })}
                                  className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-slate-100 outline-none focus:border-purple-400"
                                >
                                  <option value="Aluguel">Aluguel</option>
                                  <option value="Equipamentos">Equipamentos</option>
                                  <option value="Materiais">Materiais</option>
                                  <option value="Marketing">Marketing</option>
                                  <option value="Transporte">Transporte</option>
                                  <option value="Alimentação">Alimentação</option>
                                  <option value="Impostos">Impostos</option>
                                  <option value="Salários">Salários</option>
                                  <option value="Serviços">Serviços</option>
                                  <option value="Outros">Outros</option>
                                </select>
                              </div>
                            )}

                            <div>
                              <label className="text-sm text-slate-200 mb-1 block">Observações</label>
                              <textarea
                                value={transacaoForm.observacoes}
                                onChange={(e) => setTransacaoForm({ ...transacaoForm, observacoes: e.target.value })}
                                placeholder="Observações adicionais..."
                                className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-slate-100 outline-none focus:border-purple-400"
                                rows={3}
                              />
                            </div>

                            <div>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={transacaoForm.pago}
                                  onChange={(e) => setTransacaoForm({ ...transacaoForm, pago: e.target.checked })}
                                  className="rounded border-white/20 bg-white/10 text-purple-500 focus:ring-purple-400"
                                />
                                <span className="text-sm text-slate-200">
                                  {transacaoForm.tipo === "receita" ? "Pagamento recebido" : "Despesa paga"}
                                </span>
                              </label>
                            </div>

                            <div className="flex gap-3 pt-2">
                              <button
                                onClick={() => {
                                  setShowTransacaoModal(false);
                                  setTransacaoForm({
                                    id: "",
                                    tipo: "receita",
                                    valor: "",
                                    descricao: "",
                                    data: new Date().toISOString().split("T")[0],
                                    formaPagamento: "Dinheiro",
                                    clienteId: "",
                                    categoria: "Outros",
                                    observacoes: "",
                                    pago: true,
                                  });
                                }}
                                className="flex-1 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10 transition"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={salvarTransacao}
                                className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold text-white hover:brightness-110 transition ${
                                  transacaoForm.tipo === "receita"
                                    ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                    : "bg-gradient-to-r from-red-500 to-pink-500"
                                }`}
                              >
                                {transacaoForm.id ? "Salvar Alterações" : "Salvar"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}

          {activeSection === "Anotações" && (
            <div className="mt-8 space-y-6 section-transition animate-fade-in">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Formulário de Nova Anotação */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-purple-900/30">
                  <h3 className="text-base font-semibold text-white mb-4">Nova Anotação</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm text-slate-200">Selecione o Cliente *</label>
                      <select
                        value={clienteSelecionadoAnotacao}
                        onChange={(e) => setClienteSelecionadoAnotacao(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-slate-100 outline-none focus:border-purple-400"
                      >
                        <option value="" className="bg-slate-800 text-slate-400">Selecione um cliente...</option>
                        {clientes.map((c) => (
                          <option key={c.id} value={c.id} className="bg-slate-800 text-slate-100">
                            {c.nome}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Indicadores de Psicologia Organizacional */}
                    <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 space-y-3">
                      <p className="text-xs font-semibold text-purple-200 uppercase tracking-wide">Indicadores de Acompanhamento</p>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {/* Estado Emocional */}
                        <div className="space-y-1">
                          <label className="text-xs text-slate-300">Estado Emocional</label>
                          <select
                            value={estadoEmocionalAnotacao}
                            onChange={(e) => setEstadoEmocionalAnotacao(e.target.value as EstadoEmocional | "")}
                            className="w-full rounded-lg border border-white/10 bg-white/10 px-2 py-1.5 text-xs text-slate-100 outline-none focus:border-purple-400"
                          >
                            <option value="" className="bg-slate-800">Selecionar...</option>
                            <option value="Colaborativo" className="bg-slate-800">Colaborativo</option>
                            <option value="Motivado" className="bg-slate-800">Motivado</option>
                            <option value="Neutro" className="bg-slate-800">Neutro</option>
                            <option value="Ansioso" className="bg-slate-800">Ansioso</option>
                            <option value="Estressado" className="bg-slate-800">Estressado</option>
                            <option value="Desmotivado" className="bg-slate-800">Desmotivado</option>
                          </select>
                        </div>

                        {/* Tendência Comportamental */}
                        <div className="space-y-1">
                          <label className="text-xs text-slate-300">Tendência Comportamental</label>
                          <select
                            value={tendenciaAnotacao}
                            onChange={(e) => setTendenciaAnotacao(e.target.value as TendenciaComportamental | "")}
                            className="w-full rounded-lg border border-white/10 bg-white/10 px-2 py-1.5 text-xs text-slate-100 outline-none focus:border-purple-400"
                          >
                            <option value="" className="bg-slate-800">Selecionar...</option>
                            <option value="Proativo" className="bg-slate-800">Proativo</option>
                            <option value="Engajado" className="bg-slate-800">Engajado</option>
                            <option value="Estável" className="bg-slate-800">Estável</option>
                            <option value="Em adaptação" className="bg-slate-800">Em adaptação</option>
                            <option value="Reativo" className="bg-slate-800">Reativo</option>
                            <option value="Resistente" className="bg-slate-800">Resistente</option>
                          </select>
                        </div>

                        {/* Nível de Urgência */}
                        <div className="space-y-1">
                          <label className="text-xs text-slate-300">Nível de Urgência</label>
                          <select
                            value={urgenciaAnotacao}
                            onChange={(e) => setUrgenciaAnotacao(e.target.value as NivelUrgencia | "")}
                            className="w-full rounded-lg border border-white/10 bg-white/10 px-2 py-1.5 text-xs text-slate-100 outline-none focus:border-purple-400"
                          >
                            <option value="" className="bg-slate-800">Selecionar...</option>
                            <option value="Baixa" className="bg-slate-800">Baixa</option>
                            <option value="Média" className="bg-slate-800">Média</option>
                            <option value="Alta" className="bg-slate-800">Alta</option>
                            <option value="Crítica" className="bg-slate-800">Crítica</option>
                          </select>
                        </div>

                        {/* Tipo de Acompanhamento */}
                        <div className="space-y-1">
                          <label className="text-xs text-slate-300">Tipo de Acompanhamento</label>
                          <select
                            value={tipoAcompanhamentoAnotacao}
                            onChange={(e) => setTipoAcompanhamentoAnotacao(e.target.value as TipoAcompanhamento | "")}
                            className="w-full rounded-lg border border-white/10 bg-white/10 px-2 py-1.5 text-xs text-slate-100 outline-none focus:border-purple-400"
                          >
                            <option value="" className="bg-slate-800">Selecionar...</option>
                            <option value="Rotina" className="bg-slate-800">Rotina</option>
                            <option value="Desenvolvimento" className="bg-slate-800">Desenvolvimento</option>
                            <option value="Orientação" className="bg-slate-800">Orientação</option>
                            <option value="Feedback" className="bg-slate-800">Feedback</option>
                            <option value="Avaliação" className="bg-slate-800">Avaliação</option>
                            <option value="Conflito" className="bg-slate-800">Conflito</option>
                            <option value="Crise" className="bg-slate-800">Crise</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-slate-200">Anotação *</label>
                      <textarea
                        value={novaAnotacao}
                        onChange={(e) => setNovaAnotacao(e.target.value)}
                        placeholder="Descreva observações, comportamentos, intervenções realizadas, próximos passos..."
                        className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-slate-100 outline-none focus:border-purple-400"
                        rows={4}
                        maxLength={1000}
                      />
                      <p className="text-xs text-slate-400 text-right">{novaAnotacao.length}/1000 caracteres</p>
                    </div>

                    <button
                      onClick={adicionarAnotacao}
                      disabled={!clienteSelecionadoAnotacao || !novaAnotacao.trim()}
                      className="w-full rounded-xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-900/40 hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Adicionar Anotação
                    </button>
                  </div>
                </div>

                {/* Lista de Anotações */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-purple-900/30">
                  <h3 className="text-base font-semibold text-white mb-4">
                    Anotações Recentes
                    {anotacoes.length > 0 && (
                      <span className="ml-2 rounded-full bg-purple-500/30 px-2 py-0.5 text-xs font-normal">{anotacoes.length}</span>
                    )}
                  </h3>
                  
                  {anotacoes.length === 0 ? (
                    <p className="text-slate-400 text-sm">Nenhuma anotação registrada ainda.</p>
                  ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                      {anotacoes.slice(0, 20).map((anot, index) => {
                        const cliente = clientes.find((c) => c.id === anot.clienteId);
                        const corEstado: Record<string, string> = {
                          Colaborativo: "bg-green-500/20 text-green-300",
                          Motivado: "bg-emerald-500/20 text-emerald-300",
                          Neutro: "bg-slate-500/20 text-slate-300",
                          Ansioso: "bg-yellow-500/20 text-yellow-300",
                          Estressado: "bg-orange-500/20 text-orange-300",
                          Desmotivado: "bg-red-500/20 text-red-300",
                        };
                        const corUrgencia: Record<string, string> = {
                          Baixa: "bg-green-500/20 text-green-300",
                          Média: "bg-yellow-500/20 text-yellow-300",
                          Alta: "bg-orange-500/20 text-orange-300",
                          Crítica: "bg-red-500/20 text-red-300",
                        };
                        return (
                          <div 
                            key={anot.id} 
                            className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2 animate-fade-in hover:bg-white/10 transition"
                            style={{ animationDelay: `${index * 0.05}s` }}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-semibold text-white">
                                    {cliente?.nome || "Cliente removido"}
                                  </span>
                                </div>
                                
                                {/* Indicadores */}
                                {(anot.estadoEmocional || anot.tendencia || anot.urgencia || anot.tipoAcompanhamento) && (
                                  <div className="flex flex-wrap gap-1.5 mb-2">
                                    {anot.estadoEmocional && (
                                      <span className={`rounded-full px-2 py-0.5 text-[10px] ${corEstado[anot.estadoEmocional] || "bg-purple-500/20 text-purple-300"}`}>
                                        {anot.estadoEmocional}
                                      </span>
                                    )}
                                    {anot.tendencia && (
                                      <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] text-blue-300">
                                        {anot.tendencia}
                                      </span>
                                    )}
                                    {anot.urgencia && (
                                      <span className={`rounded-full px-2 py-0.5 text-[10px] ${corUrgencia[anot.urgencia] || "bg-slate-500/20 text-slate-300"}`}>
                                        Urg: {anot.urgencia}
                                      </span>
                                    )}
                                    {anot.tipoAcompanhamento && (
                                      <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] text-purple-300">
                                        {anot.tipoAcompanhamento}
                                      </span>
                                    )}
                                  </div>
                                )}
                                
                                <p className="text-sm text-slate-300">{anot.texto}</p>
                                <p className="text-xs text-slate-500 mt-1">
                                  {new Date(anot.dataCriacao).toLocaleDateString("pt-BR")} às {new Date(anot.dataCriacao).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                                </p>
                              </div>
                              <button
                                onClick={() => excluirAnotacao(anot.id)}
                                className="rounded-lg bg-red-500/10 p-1.5 text-red-400 hover:bg-red-500/20 transition"
                                title="Excluir anotação"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                    </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  </div>
                </div>

              {/* Anotações por Cliente */}
              {clienteSelecionadoAnotacao && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-purple-900/30 animate-fade-in">
                  <h3 className="text-base font-semibold text-white mb-4">
                    Histórico de Anotações: {clientes.find((c) => c.id === clienteSelecionadoAnotacao)?.nome}
                    <span className="ml-2 rounded-full bg-purple-500/30 px-2 py-0.5 text-xs font-normal">
                      {getAnotacoesCliente(clienteSelecionadoAnotacao).length}
                    </span>
                  </h3>
                  
                  {getAnotacoesCliente(clienteSelecionadoAnotacao).length === 0 ? (
                    <p className="text-slate-400 text-sm">Este cliente ainda não possui anotações.</p>
                  ) : (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                      {getAnotacoesCliente(clienteSelecionadoAnotacao).map((anot, index) => {
                        const corEstado: Record<string, string> = {
                          Colaborativo: "bg-green-500/20 text-green-300",
                          Motivado: "bg-emerald-500/20 text-emerald-300",
                          Neutro: "bg-slate-500/20 text-slate-300",
                          Ansioso: "bg-yellow-500/20 text-yellow-300",
                          Estressado: "bg-orange-500/20 text-orange-300",
                          Desmotivado: "bg-red-500/20 text-red-300",
                        };
                        const corUrgencia: Record<string, string> = {
                          Baixa: "bg-green-500/20 text-green-300",
                          Média: "bg-yellow-500/20 text-yellow-300",
                          Alta: "bg-orange-500/20 text-orange-300",
                          Crítica: "bg-red-500/20 text-red-300",
                        };
                        return (
                          <div 
                            key={anot.id} 
                            className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-3 animate-fade-in"
                            style={{ animationDelay: `${index * 0.05}s` }}
                          >
                            {/* Indicadores */}
                            {(anot.estadoEmocional || anot.tendencia || anot.urgencia || anot.tipoAcompanhamento) && (
                              <div className="flex flex-wrap gap-1.5 mb-2">
                                {anot.estadoEmocional && (
                                  <span className={`rounded-full px-2 py-0.5 text-[10px] ${corEstado[anot.estadoEmocional] || "bg-purple-500/20 text-purple-300"}`}>
                                    {anot.estadoEmocional}
                                  </span>
                                )}
                                {anot.tendencia && (
                                  <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] text-blue-300">
                                    {anot.tendencia}
                                  </span>
                                )}
                                {anot.urgencia && (
                                  <span className={`rounded-full px-2 py-0.5 text-[10px] ${corUrgencia[anot.urgencia] || "bg-slate-500/20 text-slate-300"}`}>
                                    Urg: {anot.urgencia}
                                  </span>
                                )}
                                {anot.tipoAcompanhamento && (
                                  <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] text-purple-300">
                                    {anot.tipoAcompanhamento}
                                  </span>
                                )}
                              </div>
                            )}
                            
                            <p className="text-sm text-slate-200">{anot.texto}</p>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-xs text-slate-500">
                                {new Date(anot.dataCriacao).toLocaleDateString("pt-BR")} às {new Date(anot.dataCriacao).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                              </p>
                              <button
                                onClick={() => excluirAnotacao(anot.id)}
                                className="text-xs text-red-400 hover:text-red-300 transition"
                              >
                                Excluir
                              </button>
                </div>
              </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeSection !== "Clientes" && activeSection !== "Relatórios" && activeSection !== "Painel" && activeSection !== "Financeiro" && activeSection !== "Anotações" && activeSection !== "Pesquisa" && (
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200 shadow-lg shadow-purple-900/30 section-transition animate-fade-in hover-lift">
              <p className="text-base font-semibold text-white">{activeSection}</p>
              <p className="mt-2 text-slate-300">
                Esta área ainda não foi configurada. Clique à vontade — em breve adicionaremos conteúdo aqui.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Perfil do Cliente */}
      {showPerfilClienteModal && (() => {
        const cliente = clientes.find((c) => c.id === showPerfilClienteModal);
        if (!cliente) return null;
        
        const anotacoesCliente = getAnotacoesCliente(cliente.id);
        const eventosCliente = eventos.filter((e) => e.clienteId === cliente.id);
        const transacoesCliente = transacoes.filter((t) => t.clienteId === cliente.id);
        const receitasCliente = transacoesCliente.filter((t) => t.tipo === "receita").reduce((acc, t) => acc + t.valor, 0);

        // Contar indicadores
        const estadosCount: Record<string, number> = {};
        const tendenciasCount: Record<string, number> = {};
        const urgenciasCount: Record<string, number> = {};
        const tiposCount: Record<string, number> = {};
        
        anotacoesCliente.forEach((a) => {
          if (a.estadoEmocional) estadosCount[a.estadoEmocional] = (estadosCount[a.estadoEmocional] || 0) + 1;
          if (a.tendencia) tendenciasCount[a.tendencia] = (tendenciasCount[a.tendencia] || 0) + 1;
          if (a.urgencia) urgenciasCount[a.urgencia] = (urgenciasCount[a.urgencia] || 0) + 1;
          if (a.tipoAcompanhamento) tiposCount[a.tipoAcompanhamento] = (tiposCount[a.tipoAcompanhamento] || 0) + 1;
        });

        const getMaisFrequente = (obj: Record<string, number>): string | null => {
          const entries = Object.entries(obj);
          if (entries.length === 0) return null;
          return entries.sort((a, b) => b[1] - a[1])[0][0];
        };

        const corIndicador: Record<string, string> = {
          // Estados
          "Colaborativo": "bg-green-500", "Motivado": "bg-emerald-500", "Neutro": "bg-slate-500",
          "Ansioso": "bg-yellow-500", "Estressado": "bg-orange-500", "Desmotivado": "bg-red-500",
          // Tendências
          "Proativo": "bg-green-500", "Engajado": "bg-emerald-500", "Estável": "bg-slate-500",
          "Em adaptação": "bg-yellow-500", "Reativo": "bg-orange-500", "Resistente": "bg-red-500",
          // Urgências
          "Baixa": "bg-green-500", "Média": "bg-yellow-500", "Alta": "bg-orange-500", "Crítica": "bg-red-500",
          // Tipos
          "Rotina": "bg-slate-500", "Desenvolvimento": "bg-blue-500", "Orientação": "bg-emerald-500",
          "Feedback": "bg-yellow-500", "Avaliação": "bg-purple-500", "Conflito": "bg-orange-500", "Crise": "bg-red-500",
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-white/10 shadow-2xl">
              {/* Header com foto */}
              <div className="relative bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 p-6 pb-20">
                <button
                  onClick={() => setShowPerfilClienteModal(null)}
                  className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <h2 className="text-2xl font-bold text-white">{cliente.nome}</h2>
                {cliente.grupo && <p className="text-purple-200 mt-1">{cliente.grupo}</p>}
              </div>

              {/* Foto sobreposta */}
              <div className="absolute left-6 top-[100px] transform">
                <div className="h-28 w-28 rounded-2xl border-4 border-slate-900 bg-slate-800 overflow-hidden shadow-xl">
                  {cliente.fotoUrl ? (
                    <img 
                      src={cliente.fotoUrl} 
                      alt={cliente.nome}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-purple-500/30 to-fuchsia-500/30">
                      <svg className="h-12 w-12 text-purple-300/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Conteúdo */}
              <div className="p-6 pt-16">
                {/* Status e ações rápidas */}
                <div className="flex items-center justify-between mb-6 ml-36">
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                      cliente.status === "Ativo" ? "bg-green-500/20 text-green-300" :
                      cliente.status === "Inativo" ? "bg-red-500/20 text-red-300" :
                      "bg-yellow-500/20 text-yellow-300"
                    }`}>
                      {cliente.status || "Não definido"}
                    </span>
                    {cliente.linkedin && (
                      <a
                        href={cliente.linkedin.startsWith("http") ? cliente.linkedin : `https://${cliente.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full bg-[#0077B5]/20 p-2 text-[#0077B5] hover:bg-[#0077B5]/30 transition"
                        title="Abrir LinkedIn"
                      >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowPerfilClienteModal(null);
                        gerarRelatorioCliente(cliente.id);
                      }}
                      className="rounded-xl bg-purple-500/20 px-4 py-2 text-sm font-semibold text-purple-200 hover:bg-purple-500/30 transition"
                    >
                      Gerar PDF
                    </button>
                    <button
                      onClick={() => {
                        setShowPerfilClienteModal(null);
                        setActiveSection("Anotações");
                        setClienteSelecionadoAnotacao(cliente.id);
                      }}
                      className="rounded-xl bg-fuchsia-500/20 px-4 py-2 text-sm font-semibold text-fuchsia-200 hover:bg-fuchsia-500/30 transition"
                    >
                      Ver Anotações
                    </button>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                  {/* Coluna 1 - Informações Pessoais */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-purple-300 uppercase tracking-wide">Informações Pessoais</h3>
                    <div className="space-y-3 rounded-xl bg-white/5 p-4 border border-white/10">
                      {cliente.email && (
                        <div>
                          <p className="text-xs text-slate-400">Email</p>
                          <p className="text-sm text-slate-200">{cliente.email}</p>
                        </div>
                      )}
                      {(cliente.celular || cliente.telefone) && (
                        <div>
                          <p className="text-xs text-slate-400">Contato</p>
                          <p className="text-sm text-slate-200">{cliente.celular || cliente.telefone}</p>
                        </div>
                      )}
                      {cliente.cpf && (
                        <div>
                          <p className="text-xs text-slate-400">CPF</p>
                          <p className="text-sm text-slate-200">{cliente.cpf}</p>
                        </div>
                      )}
                      {cliente.rg && (
                        <div>
                          <p className="text-xs text-slate-400">RG</p>
                          <p className="text-sm text-slate-200">{cliente.rg}</p>
                        </div>
                      )}
                      {cliente.dataNascimento && (
                        <div>
                          <p className="text-xs text-slate-400">Data de Nascimento</p>
                          <p className="text-sm text-slate-200">{cliente.dataNascimento}</p>
                        </div>
                      )}
                      {cliente.genero && (
                        <div>
                          <p className="text-xs text-slate-400">Gênero</p>
                          <p className="text-sm text-slate-200">{cliente.genero}</p>
                        </div>
                      )}
                      {cliente.endereco && (
                        <div>
                          <p className="text-xs text-slate-400">Endereço</p>
                          <p className="text-sm text-slate-200">{cliente.endereco}</p>
                        </div>
                      )}
                    </div>

                    {/* Informações Financeiras */}
                    {(cliente.planoFinanceiro || cliente.valorSessao) && (
                      <>
                        <h3 className="text-sm font-semibold text-purple-300 uppercase tracking-wide mt-4">Financeiro</h3>
                        <div className="space-y-3 rounded-xl bg-white/5 p-4 border border-white/10">
                          {cliente.planoFinanceiro && (
                            <div>
                              <p className="text-xs text-slate-400">Plano</p>
                              <p className="text-sm text-slate-200">{cliente.planoFinanceiro}</p>
                            </div>
                          )}
                          {cliente.valorSessao && (
                            <div>
                              <p className="text-xs text-slate-400">Valor Sessão</p>
                              <p className="text-sm text-slate-200">R$ {cliente.valorSessao}</p>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Coluna 2 - Indicadores */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-purple-300 uppercase tracking-wide">Indicadores de Acompanhamento</h3>
                    <div className="space-y-3 rounded-xl bg-white/5 p-4 border border-white/10">
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Estado Emocional</p>
                        {getMaisFrequente(estadosCount) ? (
                          <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold text-white ${corIndicador[getMaisFrequente(estadosCount)!] || "bg-slate-500"}`}>
                            {getMaisFrequente(estadosCount)}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500 italic">Não registrado</span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Tendência Comportamental</p>
                        {getMaisFrequente(tendenciasCount) ? (
                          <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold text-white ${corIndicador[getMaisFrequente(tendenciasCount)!] || "bg-slate-500"}`}>
                            {getMaisFrequente(tendenciasCount)}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500 italic">Não registrado</span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Nível de Urgência</p>
                        {getMaisFrequente(urgenciasCount) ? (
                          <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold text-white ${corIndicador[getMaisFrequente(urgenciasCount)!] || "bg-slate-500"}`}>
                            {getMaisFrequente(urgenciasCount)}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500 italic">Não registrado</span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Tipo de Acompanhamento</p>
                        {getMaisFrequente(tiposCount) ? (
                          <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold text-white ${corIndicador[getMaisFrequente(tiposCount)!] || "bg-slate-500"}`}>
                            {getMaisFrequente(tiposCount)}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500 italic">Não registrado</span>
                        )}
                      </div>
                    </div>

                    {/* Estatísticas */}
                    <h3 className="text-sm font-semibold text-purple-300 uppercase tracking-wide mt-4">Estatísticas</h3>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-xl bg-purple-500/10 p-3 text-center border border-purple-500/20">
                        <p className="text-2xl font-bold text-purple-300">{anotacoesCliente.length}</p>
                        <p className="text-xs text-slate-400">Anotações</p>
                      </div>
                      <div className="rounded-xl bg-blue-500/10 p-3 text-center border border-blue-500/20">
                        <p className="text-2xl font-bold text-blue-300">{eventosCliente.length}</p>
                        <p className="text-xs text-slate-400">Eventos</p>
                      </div>
                      <div className="rounded-xl bg-green-500/10 p-3 text-center border border-green-500/20">
                        <p className="text-2xl font-bold text-green-300">R${receitasCliente.toFixed(0)}</p>
                        <p className="text-xs text-slate-400">Receitas</p>
                      </div>
                    </div>
                  </div>

                  {/* Coluna 3 - Anotações Recentes */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-purple-300 uppercase tracking-wide">Últimas Anotações</h3>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                      {anotacoesCliente.length === 0 ? (
                        <p className="text-sm text-slate-500 italic rounded-xl bg-white/5 p-4 border border-white/10">
                          Nenhuma anotação registrada.
                        </p>
                      ) : (
                        anotacoesCliente.slice(0, 5).map((anot) => (
                          <div key={anot.id} className="rounded-xl bg-white/5 p-3 border border-white/10">
                            {(anot.estadoEmocional || anot.tendencia) && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {anot.estadoEmocional && (
                                  <span className={`rounded-full px-2 py-0.5 text-[10px] text-white ${corIndicador[anot.estadoEmocional] || "bg-slate-500"}`}>
                                    {anot.estadoEmocional}
                                  </span>
                                )}
                                {anot.tendencia && (
                                  <span className={`rounded-full px-2 py-0.5 text-[10px] text-white ${corIndicador[anot.tendencia] || "bg-slate-500"}`}>
                                    {anot.tendencia}
                                  </span>
                                )}
                              </div>
                            )}
                            <p className="text-sm text-slate-300 line-clamp-3">{anot.texto}</p>
                            <p className="text-xs text-slate-500 mt-2">
                              {new Date(anot.dataCriacao).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Observações */}
                    {cliente.observacoes && (
                      <>
                        <h3 className="text-sm font-semibold text-purple-300 uppercase tracking-wide mt-4">Observações</h3>
                        <div className="rounded-xl bg-white/5 p-4 border border-white/10">
                          <p className="text-sm text-slate-300">{cliente.observacoes}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Rodapé com data de cadastro */}
                <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                  <p className="text-xs text-slate-500">
                    Cadastrado em: {cliente.dataCriacao ? new Date(cliente.dataCriacao).toLocaleDateString("pt-BR") : "Data não registrada"}
                  </p>
                  {cliente.dataAtualizacao && (
                    <p className="text-xs text-slate-500">
                      Atualizado em: {new Date(cliente.dataAtualizacao).toLocaleDateString("pt-BR")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modal de Confirmação - Cliente */}
      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        title="Confirmar exclusão"
        message={`Tem certeza que deseja excluir o cliente "${confirmDelete.clienteNome}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete({ isOpen: false, clienteId: null, clienteNome: "" })}
      />

      {/* Modal de Confirmação - Evento */}
      <ConfirmModal
        isOpen={confirmDeleteEvento.isOpen}
        title="Confirmar exclusão"
        message={`Tem certeza que deseja excluir o evento "${confirmDeleteEvento.eventoTitulo}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
        onConfirm={handleConfirmDeleteEvento}
        onCancel={() => setConfirmDeleteEvento({ isOpen: false, eventoId: null, eventoTitulo: "" })}
      />
    </div>
  );
}

