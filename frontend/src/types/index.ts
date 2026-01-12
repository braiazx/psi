// ===== TIPOS PRINCIPAIS =====

export type Cliente = {
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
  dataCriacao?: string;
  dataAtualizacao?: string;
  fotoUrl?: string;
  linkedin?: string;
};

export type TipoTransacao = "receita" | "despesa";
export type FormaPagamento = "Dinheiro" | "PIX" | "Cartão de Crédito" | "Cartão de Débito" | "Boleto" | "Transferência" | "Outro";
export type CategoriaDespesa = "Aluguel" | "Equipamentos" | "Materiais" | "Marketing" | "Transporte" | "Alimentação" | "Outros" | "Impostos" | "Salários" | "Serviços";

export type Transacao = {
  id: string;
  tipo: TipoTransacao;
  valor: number;
  descricao: string;
  data: string;
  formaPagamento: FormaPagamento;
  clienteId?: string;
  categoria?: CategoriaDespesa;
  observacoes?: string;
  pago: boolean;
  dataCriacao: string;
};

export type EstadoEmocional = "Colaborativo" | "Neutro" | "Ansioso" | "Motivado" | "Desmotivado" | "Estressado";
export type TendenciaComportamental = "Engajado" | "Em adaptação" | "Resistente" | "Proativo" | "Reativo" | "Estável";
export type NivelUrgencia = "Baixa" | "Média" | "Alta" | "Crítica";
export type TipoAcompanhamento = "Desenvolvimento" | "Conflito" | "Orientação" | "Avaliação" | "Feedback" | "Crise" | "Rotina";

export type Anotacao = {
  id: string;
  clienteId: string;
  texto: string;
  data: string;
  dataCriacao: string;
  estadoEmocional?: EstadoEmocional;
  tendencia?: TendenciaComportamental;
  urgencia?: NivelUrgencia;
  tipoAcompanhamento?: TipoAcompanhamento;
};

export type Evento = {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  hora: string;
  clienteId: string;
  tipo: string;
  valor?: number;
  realizado?: boolean;
  receitaGerada?: boolean;
};

export type Perfil = {
  nome: string;
  idade: string;
  genero: string;
  pronomes: string;
  foto: string | null;
};

// ===== FORM TYPES =====

export type ClienteForm = Omit<Cliente, 'id' | 'dataCriacao' | 'dataAtualizacao' | 'anotacoes'> & {
  anotacoes?: string;
};

export type EventoForm = {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  hora: string;
  clienteId: string;
  tipo: string;
  valor: string;
  realizado: boolean;
};

export type TransacaoForm = {
  tipo: TipoTransacao;
  valor: string;
  descricao: string;
  data: string;
  formaPagamento: FormaPagamento;
  clienteId: string;
  categoria: CategoriaDespesa;
  observacoes: string;
  pago: boolean;
};

// ===== FILTER TYPES =====

export type FiltrosAtivos = {
  status?: string;
  genero?: string;
};

// ===== CONSTANTS =====

export const CORES_GRAFICO = ["#9333ea", "#ec4899", "#6366f1", "#22c55e", "#eab308", "#ef4444"];

export const CORES_INDICADORES: Record<string, string> = {
  // Estados Emocionais
  "Colaborativo": "bg-green-500",
  "Motivado": "bg-emerald-500",
  "Neutro": "bg-slate-500",
  "Ansioso": "bg-yellow-500",
  "Estressado": "bg-orange-500",
  "Desmotivado": "bg-red-500",
  // Tendências
  "Proativo": "bg-green-500",
  "Engajado": "bg-emerald-500",
  "Estável": "bg-slate-500",
  "Em adaptação": "bg-yellow-500",
  "Reativo": "bg-orange-500",
  "Resistente": "bg-red-500",
  // Urgências
  "Baixa": "bg-green-500",
  "Média": "bg-yellow-500",
  "Alta": "bg-orange-500",
  "Crítica": "bg-red-500",
  // Tipos de Acompanhamento
  "Rotina": "bg-slate-500",
  "Desenvolvimento": "bg-blue-500",
  "Orientação": "bg-emerald-500",
  "Feedback": "bg-yellow-500",
  "Avaliação": "bg-purple-500",
  "Conflito": "bg-orange-500",
  "Crise": "bg-red-500",
};

export const FORMAS_PAGAMENTO: FormaPagamento[] = [
  "Dinheiro", "PIX", "Cartão de Crédito", "Cartão de Débito", "Boleto", "Transferência", "Outro"
];

export const CATEGORIAS_DESPESA: CategoriaDespesa[] = [
  "Aluguel", "Equipamentos", "Materiais", "Marketing", "Transporte", "Alimentação", "Outros", "Impostos", "Salários", "Serviços"
];

export const ESTADOS_EMOCIONAIS: EstadoEmocional[] = [
  "Colaborativo", "Motivado", "Neutro", "Ansioso", "Estressado", "Desmotivado"
];

export const TENDENCIAS: TendenciaComportamental[] = [
  "Proativo", "Engajado", "Estável", "Em adaptação", "Reativo", "Resistente"
];

export const NIVEIS_URGENCIA: NivelUrgencia[] = [
  "Baixa", "Média", "Alta", "Crítica"
];

export const TIPOS_ACOMPANHAMENTO: TipoAcompanhamento[] = [
  "Rotina", "Desenvolvimento", "Orientação", "Feedback", "Avaliação", "Conflito", "Crise"
];

export const TIPOS_EVENTO = [
  "Consulta", "Avaliação", "Retorno", "Reunião", "Acompanhamento", "Outros"
];










