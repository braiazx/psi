// Utilitário para salvar e carregar dados usando localStorage

// Salvar clientes
export const saveClientes = async (clientes: any[]) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem("clientes_ordenate", JSON.stringify(clientes));
    }
  } catch (error) {
    console.error("Erro ao salvar clientes:", error);
  }
};

// Dados fictícios padrão
const dadosFicticios = {
  clientes: [
    {
      id: "c1",
      nome: "Ana Carolina Silva",
      email: "ana.silva@empresa.com.br",
      telefone: "(11) 3456-7890",
      celular: "(11) 98765-4321",
      status: "Ativo",
      grupo: "Liderança",
      cpf: "123.456.789-00",
      rg: "12.345.678-9",
      dataNascimento: "1985-03-15",
      genero: "Feminino",
      nomeSocial: false,
      planoFinanceiro: "Mensal",
      valorSessao: "350",
      observacoes: "Gerente de RH, foco em desenvolvimento de liderança",
      endereco: "Av. Paulista, 1000 - São Paulo/SP",
      adicionais: "Preferência por sessões às terças",
      responsavel: "",
      anotacoes: "",
      dataCriacao: new Date('2025-10-01').toISOString(),
      dataAtualizacao: new Date('2026-01-10').toISOString()
    },
    {
      id: "c2",
      nome: "Bruno Oliveira Costa",
      email: "bruno.costa@techcorp.com",
      telefone: "(11) 2345-6789",
      celular: "(11) 97654-3210",
      status: "Ativo",
      grupo: "Individual",
      cpf: "234.567.890-11",
      rg: "23.456.789-0",
      dataNascimento: "1990-07-22",
      genero: "Masculino",
      nomeSocial: false,
      planoFinanceiro: "Avulso",
      valorSessao: "280",
      observacoes: "Desenvolvedor sênior, questões de burnout",
      endereco: "Rua Augusta, 500 - São Paulo/SP",
      adicionais: "",
      responsavel: "",
      anotacoes: "",
      dataCriacao: new Date('2025-09-15').toISOString(),
      dataAtualizacao: new Date('2026-01-08').toISOString()
    },
    {
      id: "c3",
      nome: "Carla Beatriz Santos",
      email: "carla.santos@consultoria.com",
      telefone: "(11) 3456-7891",
      celular: "(11) 96543-2109",
      status: "Ativo",
      grupo: "Corporativo",
      cpf: "345.678.901-22",
      rg: "34.567.890-1",
      dataNascimento: "1982-11-30",
      genero: "Feminino",
      nomeSocial: false,
      planoFinanceiro: "Trimestral",
      valorSessao: "400",
      observacoes: "CEO, coaching executivo",
      endereco: "Av. Brigadeiro Faria Lima, 2000 - São Paulo/SP",
      adicionais: "Sessões quinzenais",
      responsavel: "",
      anotacoes: "",
      dataCriacao: new Date('2025-08-01').toISOString(),
      dataAtualizacao: new Date('2026-01-05').toISOString()
    },
    {
      id: "c4",
      nome: "Daniel Ferreira Lima",
      email: "daniel.lima@startup.io",
      telefone: "(11) 4567-8902",
      celular: "(11) 95432-1098",
      status: "Em pausa",
      grupo: "Individual",
      cpf: "456.789.012-33",
      rg: "45.678.901-2",
      dataNascimento: "1995-02-14",
      genero: "Masculino",
      nomeSocial: false,
      planoFinanceiro: "Mensal",
      valorSessao: "250",
      observacoes: "Product Manager, gestão de ansiedade",
      endereco: "Rua Oscar Freire, 300 - São Paulo/SP",
      adicionais: "Retorno previsto em fevereiro",
      responsavel: "",
      anotacoes: "",
      dataCriacao: new Date('2025-11-10').toISOString(),
      dataAtualizacao: new Date('2025-12-20').toISOString()
    },
    {
      id: "c5",
      nome: "Elena Rodrigues",
      email: "elena.rodrigues@banco.com.br",
      telefone: "(11) 5678-9013",
      celular: "(11) 94321-0987",
      status: "Ativo",
      grupo: "Corporativo",
      cpf: "567.890.123-44",
      rg: "56.789.012-3",
      dataNascimento: "1988-06-08",
      genero: "Feminino",
      nomeSocial: false,
      planoFinanceiro: "Anual",
      valorSessao: "380",
      observacoes: "Diretora Financeira, equilíbrio vida-trabalho",
      endereco: "Av. Berrini, 1500 - São Paulo/SP",
      adicionais: "",
      responsavel: "",
      anotacoes: "",
      dataCriacao: new Date('2025-07-20').toISOString(),
      dataAtualizacao: new Date('2026-01-12').toISOString()
    },
    {
      id: "c6",
      nome: "Fernando Almeida",
      email: "fernando.almeida@agencia.com",
      telefone: "(11) 6789-0124",
      celular: "(11) 93210-9876",
      status: "Ativo",
      grupo: "Liderança",
      cpf: "678.901.234-55",
      rg: "67.890.123-4",
      dataNascimento: "1979-09-25",
      genero: "Masculino",
      nomeSocial: false,
      planoFinanceiro: "Mensal",
      valorSessao: "320",
      observacoes: "Diretor Criativo, gestão de equipes",
      endereco: "Rua dos Pinheiros, 800 - São Paulo/SP",
      adicionais: "",
      responsavel: "",
      anotacoes: "",
      dataCriacao: new Date('2025-10-05').toISOString(),
      dataAtualizacao: new Date('2026-01-09').toISOString()
    },
    {
      id: "c7",
      nome: "Gabriela Martins",
      email: "gabriela.martins@hospital.org",
      telefone: "(11) 7890-1235",
      celular: "(11) 92109-8765",
      status: "Novo",
      grupo: "Individual",
      cpf: "789.012.345-66",
      rg: "78.901.234-5",
      dataNascimento: "1992-12-03",
      genero: "Feminino",
      nomeSocial: false,
      planoFinanceiro: "Avulso",
      valorSessao: "280",
      observacoes: "Médica residente, gestão de estresse",
      endereco: "Av. Dr. Arnaldo, 450 - São Paulo/SP",
      adicionais: "Horários flexíveis devido plantões",
      responsavel: "",
      anotacoes: "",
      dataCriacao: new Date('2026-01-08').toISOString(),
      dataAtualizacao: new Date('2026-01-08').toISOString()
    },
    {
      id: "c8",
      nome: "Henrique Souza",
      email: "henrique.souza@industria.com.br",
      telefone: "(11) 8901-2346",
      celular: "(11) 91098-7654",
      status: "Ativo",
      grupo: "Corporativo",
      cpf: "890.123.456-77",
      rg: "89.012.345-6",
      dataNascimento: "1975-04-18",
      genero: "Masculino",
      nomeSocial: false,
      planoFinanceiro: "Trimestral",
      valorSessao: "450",
      observacoes: "Presidente, transição de carreira",
      endereco: "Av. das Nações Unidas, 12000 - São Paulo/SP",
      adicionais: "",
      responsavel: "",
      anotacoes: "",
      dataCriacao: new Date('2025-06-01').toISOString(),
      dataAtualizacao: new Date('2026-01-11').toISOString()
    },
    {
      id: "c9",
      nome: "Isabela Pereira",
      email: "isabela.pereira@escola.edu.br",
      telefone: "(11) 9012-3457",
      celular: "(11) 90987-6543",
      status: "Inativo",
      grupo: "Individual",
      cpf: "901.234.567-88",
      rg: "90.123.456-7",
      dataNascimento: "1987-08-12",
      genero: "Feminino",
      nomeSocial: false,
      planoFinanceiro: "Mensal",
      valorSessao: "250",
      observacoes: "Professora, completou acompanhamento",
      endereco: "Rua Vergueiro, 1200 - São Paulo/SP",
      adicionais: "Alta em dezembro/2025",
      responsavel: "",
      anotacoes: "",
      dataCriacao: new Date('2025-03-15').toISOString(),
      dataAtualizacao: new Date('2025-12-15').toISOString()
    },
    {
      id: "c10",
      nome: "João Pedro Campos",
      email: "joao.campos@logistica.com",
      telefone: "(11) 0123-4568",
      celular: "(11) 99876-5432",
      status: "Ativo",
      grupo: "Liderança",
      cpf: "012.345.678-99",
      rg: "01.234.567-8",
      dataNascimento: "1983-01-28",
      genero: "Masculino",
      nomeSocial: false,
      planoFinanceiro: "Mensal",
      valorSessao: "350",
      observacoes: "Gerente de Operações, desenvolvimento de liderança",
      endereco: "Av. Santo Amaro, 2500 - São Paulo/SP",
      adicionais: "",
      responsavel: "",
      anotacoes: "",
      dataCriacao: new Date('2025-09-20').toISOString(),
      dataAtualizacao: new Date('2026-01-07').toISOString()
    },
    {
      id: "c11",
      nome: "Karen Nascimento",
      email: "karen.nascimento@varejo.com.br",
      telefone: "(11) 1234-5679",
      celular: "(11) 98765-4322",
      status: "Novo",
      grupo: "Individual",
      cpf: "123.456.789-01",
      rg: "12.345.678-0",
      dataNascimento: "1998-05-20",
      genero: "Feminino",
      nomeSocial: false,
      planoFinanceiro: "Avulso",
      valorSessao: "220",
      observacoes: "Analista Jr., início de carreira",
      endereco: "Rua da Consolação, 600 - São Paulo/SP",
      adicionais: "",
      responsavel: "",
      anotacoes: "",
      dataCriacao: new Date('2026-01-10').toISOString(),
      dataAtualizacao: new Date('2026-01-10').toISOString()
    },
    {
      id: "c12",
      nome: "Lucas Andrade",
      email: "lucas.andrade@tech.com",
      telefone: "(11) 2345-6780",
      celular: "(11) 97654-3211",
      status: "Ativo",
      grupo: "Corporativo",
      cpf: "234.567.890-12",
      rg: "23.456.789-1",
      dataNascimento: "1986-10-10",
      genero: "Masculino",
      nomeSocial: false,
      planoFinanceiro: "Trimestral",
      valorSessao: "380",
      observacoes: "CTO, gestão de mudanças organizacionais",
      endereco: "Av. Rebouças, 1800 - São Paulo/SP",
      adicionais: "",
      responsavel: "",
      anotacoes: "",
      dataCriacao: new Date('2025-08-10').toISOString(),
      dataAtualizacao: new Date('2026-01-06').toISOString()
    }
  ],
  perfil: {
    nome: "Dr. Rafael Mendes",
    idade: "42",
    genero: "Masculino",
    pronomes: "ele/dele",
    foto: null
  },
  eventos: [
    {
      id: "e1",
      titulo: "Sessão - Ana Carolina",
      descricao: "Acompanhamento quinzenal de desenvolvimento de liderança",
      data: "2026-01-14",
      hora: "09:00",
      clienteId: "c1",
      tipo: "Consulta",
      valor: 350,
      realizado: false,
      receitaGerada: false
    },
    {
      id: "e2",
      titulo: "Sessão - Bruno Oliveira",
      descricao: "Continuação do trabalho sobre burnout",
      data: "2026-01-14",
      hora: "10:30",
      clienteId: "c2",
      tipo: "Consulta",
      valor: 280,
      realizado: false,
      receitaGerada: false
    },
    {
      id: "e3",
      titulo: "Coaching Executivo - Carla",
      descricao: "Sessão mensal de coaching executivo",
      data: "2026-01-15",
      hora: "14:00",
      clienteId: "c3",
      tipo: "Acompanhamento",
      valor: 600,
      realizado: false,
      receitaGerada: false
    },
    {
      id: "e4",
      titulo: "Avaliação Inicial - Karen",
      descricao: "Primeira sessão - levantamento inicial",
      data: "2026-01-16",
      hora: "11:00",
      clienteId: "c11",
      tipo: "Avaliação",
      valor: 220,
      realizado: false,
      receitaGerada: false
    },
    {
      id: "e5",
      titulo: "Reunião de Equipe - TechCorp",
      descricao: "Workshop de comunicação não-violenta",
      data: "2026-01-17",
      hora: "09:00",
      clienteId: "c12",
      tipo: "Reunião",
      valor: 1500,
      realizado: false,
      receitaGerada: false
    },
    {
      id: "e6",
      titulo: "Sessão - Elena Rodrigues",
      descricao: "Continuação do trabalho sobre equilíbrio",
      data: "2026-01-13",
      hora: "16:00",
      clienteId: "c5",
      tipo: "Consulta",
      valor: 380,
      realizado: true,
      receitaGerada: true
    },
    {
      id: "e7",
      titulo: "Sessão - Fernando Almeida",
      descricao: "Trabalho sobre gestão de equipes criativas",
      data: "2026-01-13",
      hora: "10:00",
      clienteId: "c6",
      tipo: "Consulta",
      valor: 320,
      realizado: true,
      receitaGerada: true
    },
    {
      id: "e8",
      titulo: "Retorno - Henrique Souza",
      descricao: "Acompanhamento do processo de transição",
      data: "2026-01-20",
      hora: "08:00",
      clienteId: "c8",
      tipo: "Retorno",
      valor: 675,
      realizado: false,
      receitaGerada: false
    }
  ],
  transacoes: [
    { id: "t1", tipo: "receita", valor: 350, descricao: "Sessão - Ana Carolina Silva", data: "2026-01-07", formaPagamento: "PIX", clienteId: "c1", pago: true, dataCriacao: new Date('2026-01-07').toISOString() },
    { id: "t2", tipo: "receita", valor: 280, descricao: "Sessão - Bruno Oliveira Costa", data: "2026-01-07", formaPagamento: "Cartão de Crédito", clienteId: "c2", pago: true, dataCriacao: new Date('2026-01-07').toISOString() },
    { id: "t3", tipo: "receita", valor: 380, descricao: "Sessão - Elena Rodrigues", data: "2026-01-06", formaPagamento: "Transferência", clienteId: "c5", pago: true, dataCriacao: new Date('2026-01-06').toISOString() },
    { id: "t4", tipo: "receita", valor: 320, descricao: "Sessão - Fernando Almeida", data: "2026-01-09", formaPagamento: "PIX", clienteId: "c6", pago: true, dataCriacao: new Date('2026-01-09').toISOString() },
    { id: "t5", tipo: "receita", valor: 450, descricao: "Sessão - Henrique Souza", data: "2026-01-06", formaPagamento: "Boleto", clienteId: "c8", pago: true, dataCriacao: new Date('2026-01-06').toISOString() },
    { id: "t6", tipo: "receita", valor: 350, descricao: "Sessão - João Pedro Campos", data: "2026-01-10", formaPagamento: "PIX", clienteId: "c10", pago: true, dataCriacao: new Date('2026-01-10').toISOString() },
    { id: "t7", tipo: "receita", valor: 380, descricao: "Sessão - Lucas Andrade", data: "2026-01-11", formaPagamento: "Cartão de Débito", clienteId: "c12", pago: true, dataCriacao: new Date('2026-01-11').toISOString() },
    { id: "t8", tipo: "receita", valor: 600, descricao: "Coaching Executivo - Carla Beatriz", data: "2026-01-02", formaPagamento: "Transferência", clienteId: "c3", pago: true, dataCriacao: new Date('2026-01-02').toISOString() },
    { id: "t9", tipo: "despesa", valor: 2500, descricao: "Aluguel do consultório - Janeiro", data: "2026-01-05", formaPagamento: "Boleto", categoria: "Aluguel", pago: true, dataCriacao: new Date('2026-01-05').toISOString() },
    { id: "t10", tipo: "despesa", valor: 150, descricao: "Material de escritório", data: "2026-01-03", formaPagamento: "Cartão de Crédito", categoria: "Materiais", pago: true, dataCriacao: new Date('2026-01-03').toISOString() },
    { id: "t11", tipo: "despesa", valor: 89.90, descricao: "Assinatura software de gestão", data: "2026-01-01", formaPagamento: "Cartão de Crédito", categoria: "Serviços", pago: true, dataCriacao: new Date('2026-01-01').toISOString() },
    { id: "t12", tipo: "despesa", valor: 350, descricao: "Marketing digital - Meta Ads", data: "2026-01-08", formaPagamento: "Cartão de Crédito", categoria: "Marketing", pago: true, dataCriacao: new Date('2026-01-08').toISOString() },
    { id: "t13", tipo: "receita", valor: 3500, descricao: "Pacote trimestral - Elena Rodrigues", data: "2025-12-15", formaPagamento: "Transferência", clienteId: "c5", pago: true, dataCriacao: new Date('2025-12-15').toISOString() },
    { id: "t14", tipo: "receita", valor: 2800, descricao: "Workshop Comunicação - TechCorp", data: "2025-12-20", formaPagamento: "Boleto", clienteId: "c12", pago: true, dataCriacao: new Date('2025-12-20').toISOString() },
    { id: "t15", tipo: "despesa", valor: 2500, descricao: "Aluguel do consultório - Dezembro", data: "2025-12-05", formaPagamento: "Boleto", categoria: "Aluguel", pago: true, dataCriacao: new Date('2025-12-05').toISOString() }
  ],
  anotacoes: [
    { id: "a1", clienteId: "c1", texto: "Sessão focada em técnicas de feedback construtivo. Ana demonstrou grande evolução na aplicação da escuta ativa com sua equipe. Próximos passos: trabalhar delegação de tarefas.", data: "2026-01-07", dataCriacao: new Date('2026-01-07').toISOString(), estadoEmocional: "Motivado", tendencia: "Proativo", urgencia: "Baixa", tipoAcompanhamento: "Desenvolvimento" },
    { id: "a2", clienteId: "c1", texto: "Revisão do plano de desenvolvimento individual. Ana reportou melhoria significativa no clima da equipe após implementação das técnicas discutidas.", data: "2025-12-17", dataCriacao: new Date('2025-12-17').toISOString(), estadoEmocional: "Colaborativo", tendencia: "Engajado", urgencia: "Baixa", tipoAcompanhamento: "Feedback" },
    { id: "a3", clienteId: "c2", texto: "Bruno relatou episódio de sobrecarga na última sprint. Trabalhamos técnicas de gerenciamento de tempo e estabelecimento de limites saudáveis com a liderança.", data: "2026-01-07", dataCriacao: new Date('2026-01-07').toISOString(), estadoEmocional: "Ansioso", tendencia: "Em adaptação", urgencia: "Média", tipoAcompanhamento: "Orientação" },
    { id: "a4", clienteId: "c2", texto: "Melhora significativa após férias. Implementou rotina de pausas regulares. Continua acompanhamento para consolidação dos novos hábitos.", data: "2025-12-10", dataCriacao: new Date('2025-12-10').toISOString(), estadoEmocional: "Neutro", tendencia: "Estável", urgencia: "Baixa", tipoAcompanhamento: "Rotina" },
    { id: "a5", clienteId: "c3", texto: "Sessão de coaching executivo focada em tomada de decisão estratégica. Carla está conduzindo processo de fusão com muita competência.", data: "2026-01-02", dataCriacao: new Date('2026-01-02').toISOString(), estadoEmocional: "Colaborativo", tendencia: "Proativo", urgencia: "Média", tipoAcompanhamento: "Desenvolvimento" },
    { id: "a6", clienteId: "c3", texto: "Discussão sobre gestão de stakeholders durante processo de mudança organizacional. Definidos KPIs para acompanhamento do clima durante transição.", data: "2025-12-05", dataCriacao: new Date('2025-12-05').toISOString(), estadoEmocional: "Motivado", tendencia: "Engajado", urgencia: "Baixa", tipoAcompanhamento: "Avaliação" },
    { id: "a7", clienteId: "c5", texto: "Elena conseguiu estabelecer boundaries mais claros com a equipe. Redução de horas extras de 20h para 8h semanais no último mês.", data: "2026-01-06", dataCriacao: new Date('2026-01-06').toISOString(), estadoEmocional: "Motivado", tendencia: "Proativo", urgencia: "Baixa", tipoAcompanhamento: "Feedback" },
    { id: "a8", clienteId: "c5", texto: "Trabalho sobre delegação e confiança na equipe. Elena reconhece padrão de controle excessivo. Exercício: delegar uma decisão importante esta semana.", data: "2025-12-23", dataCriacao: new Date('2025-12-23').toISOString(), estadoEmocional: "Neutro", tendencia: "Em adaptação", urgencia: "Baixa", tipoAcompanhamento: "Desenvolvimento" },
    { id: "a9", clienteId: "c6", texto: "Fernando reportou conflito na equipe criativa. Trabalhamos estratégias de mediação e comunicação não-violenta para próxima reunião de equipe.", data: "2026-01-09", dataCriacao: new Date('2026-01-09').toISOString(), estadoEmocional: "Ansioso", tendencia: "Reativo", urgencia: "Alta", tipoAcompanhamento: "Conflito" },
    { id: "a10", clienteId: "c6", texto: "Sessão de follow-up pós-mediação. Conflito resolvido parcialmente. Equipe precisa de workshop de team building. Sugestão encaminhada ao RH.", data: "2025-12-16", dataCriacao: new Date('2025-12-16').toISOString(), estadoEmocional: "Neutro", tendencia: "Estável", urgencia: "Média", tipoAcompanhamento: "Orientação" },
    { id: "a11", clienteId: "c7", texto: "Primeira sessão - avaliação inicial. Gabriela apresenta sinais de exaustão relacionados à carga de plantões. Foco inicial: técnicas de recuperação e autocuidado.", data: "2026-01-08", dataCriacao: new Date('2026-01-08').toISOString(), estadoEmocional: "Estressado", tendencia: "Em adaptação", urgencia: "Alta", tipoAcompanhamento: "Avaliação" },
    { id: "a12", clienteId: "c8", texto: "Henrique está no processo final de transição para o conselho. Trabalhamos aspectos emocionais de 'deixar ir' a gestão operacional.", data: "2026-01-06", dataCriacao: new Date('2026-01-06').toISOString(), estadoEmocional: "Neutro", tendencia: "Estável", urgencia: "Baixa", tipoAcompanhamento: "Desenvolvimento" },
    { id: "a13", clienteId: "c8", texto: "Definição de legado e preparação de sucessor. Henrique demonstra clareza sobre seus valores e o que deseja deixar para a próxima gestão.", data: "2025-12-09", dataCriacao: new Date('2025-12-09').toISOString(), estadoEmocional: "Colaborativo", tendencia: "Proativo", urgencia: "Baixa", tipoAcompanhamento: "Orientação" },
    { id: "a14", clienteId: "c10", texto: "Avanço significativo em habilidades de liderança situacional. João aplicou com sucesso técnica de coaching com colaborador jr.", data: "2026-01-10", dataCriacao: new Date('2026-01-10').toISOString(), estadoEmocional: "Motivado", tendencia: "Engajado", urgencia: "Baixa", tipoAcompanhamento: "Feedback" },
    { id: "a15", clienteId: "c10", texto: "Trabalho sobre gestão de performance da equipe. Definição de métricas claras e feedback estruturado para cada membro.", data: "2025-12-27", dataCriacao: new Date('2025-12-27').toISOString(), estadoEmocional: "Colaborativo", tendencia: "Proativo", urgencia: "Baixa", tipoAcompanhamento: "Desenvolvimento" },
    { id: "a16", clienteId: "c11", texto: "Primeira sessão agendada. Karen busca orientação para início de carreira e desenvolvimento de soft skills para progressão.", data: "2026-01-10", dataCriacao: new Date('2026-01-10').toISOString(), estadoEmocional: "Motivado", tendencia: "Engajado", urgencia: "Baixa", tipoAcompanhamento: "Avaliação" },
    { id: "a17", clienteId: "c12", texto: "Lucas está liderando transformação digital na empresa. Discussão sobre gestão de resistência à mudança e comunicação de visão.", data: "2026-01-11", dataCriacao: new Date('2026-01-11').toISOString(), estadoEmocional: "Colaborativo", tendencia: "Proativo", urgencia: "Média", tipoAcompanhamento: "Desenvolvimento" },
    { id: "a18", clienteId: "c12", texto: "Workshop realizado com equipe de tech. Feedback positivo. 85% de engajamento nas atividades. Próximo: workshop com stakeholders de negócio.", data: "2025-12-20", dataCriacao: new Date('2025-12-20').toISOString(), estadoEmocional: "Motivado", tendencia: "Engajado", urgencia: "Baixa", tipoAcompanhamento: "Feedback" },
    { id: "a19", clienteId: "c4", texto: "Daniel solicitou pausa no acompanhamento por motivos pessoais. Retorno previsto para fevereiro/2026. Manter contato mensal por email.", data: "2025-12-20", dataCriacao: new Date('2025-12-20').toISOString(), estadoEmocional: "Neutro", tendencia: "Estável", urgencia: "Baixa", tipoAcompanhamento: "Rotina" },
    { id: "a20", clienteId: "c9", texto: "Alta terapêutica. Isabela completou com sucesso o programa de desenvolvimento. Objetivos alcançados. Porta aberta para retorno se necessário.", data: "2025-12-15", dataCriacao: new Date('2025-12-15').toISOString(), estadoEmocional: "Motivado", tendencia: "Proativo", urgencia: "Baixa", tipoAcompanhamento: "Feedback" }
  ]
};

// Carregar clientes
export const loadClientes = async (): Promise<any[]> => {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("clientes_ordenate");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error("Erro ao parsear clientes do localStorage:", e);
          return dadosFicticios.clientes;
        }
      }
      // Se não houver dados salvos, retornar dados fictícios
      localStorage.setItem("clientes_ordenate", JSON.stringify(dadosFicticios.clientes));
      localStorage.setItem("perfil_ordenate", JSON.stringify(dadosFicticios.perfil));
      localStorage.setItem("eventos_ordenate", JSON.stringify(dadosFicticios.eventos));
      localStorage.setItem("transacoes_ordenate", JSON.stringify(dadosFicticios.transacoes));
      localStorage.setItem("anotacoes_ordenate", JSON.stringify(dadosFicticios.anotacoes));
      return dadosFicticios.clientes;
    }
    return [];
  } catch (error) {
    console.error("Erro ao carregar clientes:", error);
    return dadosFicticios.clientes;
  }
};

// Salvar perfil
export const savePerfil = async (perfil: any) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem("perfil_ordenate", JSON.stringify(perfil));
    }
  } catch (error) {
    console.error("Erro ao salvar perfil:", error);
  }
};

// Carregar perfil
export const loadPerfil = async (): Promise<any> => {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("perfil_ordenate");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error("Erro ao parsear perfil do localStorage:", e);
          return dadosFicticios.perfil;
        }
      }
      // Se não houver perfil salvo, retornar perfil fictício
      return dadosFicticios.perfil;
    }
    return null;
  } catch (error) {
    console.error("Erro ao carregar perfil:", error);
    return dadosFicticios.perfil;
  }
};

// Criar backup (apenas no localStorage)
export const createBackup = async (clientes: any[], perfil: any) => {
  try {
    if (typeof window !== 'undefined') {
      const backupData = {
        timestamp: new Date().toISOString(),
        clientes,
        perfil,
      };
      const backups = JSON.parse(localStorage.getItem("backups_ordenate") || "[]");
      backups.push(backupData);
      // Manter apenas os últimos 10 backups
      const recentBackups = backups.slice(-10);
      localStorage.setItem("backups_ordenate", JSON.stringify(recentBackups));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Erro ao criar backup:', error);
    return false;
  }
};
