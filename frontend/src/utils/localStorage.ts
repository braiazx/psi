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


// Dados fictícios simples para demonstração
const criarDadosDemo = () => {
  return [
    {
      id: "c1",
      nome: "Cliente 1",
      genero: "Mulher",
      dataNascimento: "1985-03-15",
      email: "",
      telefone: "",
      celular: "",
      status: "Ativo",
      grupo: "",
      cpf: "",
      rg: "",
      nomeSocial: false,
      planoFinanceiro: "",
      valorSessao: "",
      observacoes: "",
      endereco: "",
      adicionais: "",
      responsavel: "",
      anotacoes: "",
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString()
    },
    {
      id: "c2",
      nome: "Cliente 2",
      genero: "Homem",
      dataNascimento: "1990-07-22",
      email: "",
      telefone: "",
      celular: "",
      status: "Ativo",
      grupo: "",
      cpf: "",
      rg: "",
      nomeSocial: false,
      planoFinanceiro: "",
      valorSessao: "",
      observacoes: "",
      endereco: "",
      adicionais: "",
      responsavel: "",
      anotacoes: "",
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString()
    },
    {
      id: "c3",
      nome: "Cliente 3",
      genero: "Mulher",
      dataNascimento: "1988-11-30",
      email: "",
      telefone: "",
      celular: "",
      status: "Ativo",
      grupo: "",
      cpf: "",
      rg: "",
      nomeSocial: false,
      planoFinanceiro: "",
      valorSessao: "",
      observacoes: "",
      endereco: "",
      adicionais: "",
      responsavel: "",
      anotacoes: "",
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString()
    },
    {
      id: "c4",
      nome: "Cliente 4",
      genero: "Homem",
      dataNascimento: "1995-02-14",
      email: "",
      telefone: "",
      celular: "",
      status: "Ativo",
      grupo: "",
      cpf: "",
      rg: "",
      nomeSocial: false,
      planoFinanceiro: "",
      valorSessao: "",
      observacoes: "",
      endereco: "",
      adicionais: "",
      responsavel: "",
      anotacoes: "",
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString()
    },
    {
      id: "c5",
      nome: "Cliente 5",
      genero: "Mulher",
      dataNascimento: "1992-06-08",
      email: "",
      telefone: "",
      celular: "",
      status: "Ativo",
      grupo: "",
      cpf: "",
      rg: "",
      nomeSocial: false,
      planoFinanceiro: "",
      valorSessao: "",
      observacoes: "",
      endereco: "",
      adicionais: "",
      responsavel: "",
      anotacoes: "",
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString()
    },
    {
      id: "c6",
      nome: "Cliente 6",
      genero: "Homem",
      dataNascimento: "1983-09-25",
      email: "",
      telefone: "",
      celular: "",
      status: "Ativo",
      grupo: "",
      cpf: "",
      rg: "",
      nomeSocial: false,
      planoFinanceiro: "",
      valorSessao: "",
      observacoes: "",
      endereco: "",
      adicionais: "",
      responsavel: "",
      anotacoes: "",
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString()
    },
    {
      id: "c7",
      nome: "Cliente 7",
      genero: "Mulher",
      dataNascimento: "1998-12-03",
      email: "",
      telefone: "",
      celular: "",
      status: "Ativo",
      grupo: "",
      cpf: "",
      rg: "",
      nomeSocial: false,
      planoFinanceiro: "",
      valorSessao: "",
      observacoes: "",
      endereco: "",
      adicionais: "",
      responsavel: "",
      anotacoes: "",
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString()
    },
    {
      id: "c8",
      nome: "Cliente 8",
      genero: "Homem",
      dataNascimento: "1975-04-18",
      email: "",
      telefone: "",
      celular: "",
      status: "Ativo",
      grupo: "",
      cpf: "",
      rg: "",
      nomeSocial: false,
      planoFinanceiro: "",
      valorSessao: "",
      observacoes: "",
      endereco: "",
      adicionais: "",
      responsavel: "",
      anotacoes: "",
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString()
    },
    {
      id: "c9",
      nome: "Cliente 9",
      genero: "Mulher",
      dataNascimento: "1987-08-12",
      email: "",
      telefone: "",
      celular: "",
      status: "Ativo",
      grupo: "",
      cpf: "",
      rg: "",
      nomeSocial: false,
      planoFinanceiro: "",
      valorSessao: "",
      observacoes: "",
      endereco: "",
      adicionais: "",
      responsavel: "",
      anotacoes: "",
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString()
    },
    {
      id: "c10",
      nome: "Cliente 10",
      genero: "Homem",
      dataNascimento: "1991-01-28",
      email: "",
      telefone: "",
      celular: "",
      status: "Ativo",
      grupo: "",
      cpf: "",
      rg: "",
      nomeSocial: false,
      planoFinanceiro: "",
      valorSessao: "",
      observacoes: "",
      endereco: "",
      adicionais: "",
      responsavel: "",
      anotacoes: "",
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString()
    }
  ];
};

// Carregar clientes
export const loadClientes = async (): Promise<any[]> => {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("clientes_ordenate");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Se o array estiver vazio, carregar dados demo
          if (Array.isArray(parsed) && parsed.length === 0) {
            const dadosDemo = criarDadosDemo();
            localStorage.setItem("clientes_ordenate", JSON.stringify(dadosDemo));
            return dadosDemo;
          } else if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch (e) {
          console.error("Erro ao parsear clientes do localStorage:", e);
          // Continuar para carregar dados demo
        }
      }
      // Se não houver dados salvos, criar dados demo
      const dadosDemo = criarDadosDemo();
      localStorage.setItem("clientes_ordenate", JSON.stringify(dadosDemo));
      return dadosDemo;
    }
    return [];
  } catch (error) {
    console.error("Erro ao carregar clientes:", error);
    return [];
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
          return null;
        }
      }
      // Sistema inicia sem perfil pré-configurado
      return null;
    }
    return null;
  } catch (error) {
    console.error("Erro ao carregar perfil:", error);
    return null;
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
