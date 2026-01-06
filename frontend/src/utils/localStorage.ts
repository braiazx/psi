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
          return [];
        }
      }
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
