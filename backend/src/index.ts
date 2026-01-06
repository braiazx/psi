import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Criar pasta de dados se não existir
const DATA_DIR = path.join(__dirname, '..', '..', 'dados');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Middlewares
app.use(cors());
app.use(express.json());

// Rota de teste
app.get('/', (req, res) => {
  res.json({ 
    message: 'Sistema de Psicologia Organizacional - Backend',
    status: 'online',
    version: '1.0.0'
  });
});

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Rota para salvar dados localmente
app.post('/api/save-data', (req, res) => {
  try {
    const { key, data } = req.body;
    const filePath = path.join(DATA_DIR, `${key}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    res.json({ success: true, message: 'Dados salvos com sucesso' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Rota para carregar dados localmente
app.get('/api/load-data/:key', (req, res) => {
  try {
    const { key } = req.params;
    const filePath = path.join(DATA_DIR, `${key}.json`);
    
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      res.json({ success: true, data: JSON.parse(data) });
    } else {
      res.json({ success: true, data: null });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Rotas específicas para clientes e perfil (compatibilidade)
app.post('/api/data/clientes', (req, res) => {
  try {
    const clientes = req.body;
    const filePath = path.join(DATA_DIR, 'clientes.json');
    fs.writeFileSync(filePath, JSON.stringify(clientes, null, 2), 'utf-8');
    
    // Criar backup automático
    const backupPath = path.join(BACKUP_DIR, `clientes_backup_${Date.now()}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(clientes, null, 2), 'utf-8');
    
    res.json({ success: true, message: 'Clientes salvos com sucesso' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/data/clientes', (req, res) => {
  try {
    const filePath = path.join(DATA_DIR, 'clientes.json');
    
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      res.json(JSON.parse(data));
    } else {
      res.json([]);
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/data/perfil', (req, res) => {
  try {
    const perfil = req.body;
    const filePath = path.join(DATA_DIR, 'perfil.json');
    fs.writeFileSync(filePath, JSON.stringify(perfil, null, 2), 'utf-8');
    res.json({ success: true, message: 'Perfil salvo com sucesso' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/data/perfil', (req, res) => {
  try {
    const filePath = path.join(DATA_DIR, 'perfil.json');
    
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      res.json(JSON.parse(data));
    } else {
      res.json(null);
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Rota para criar backup
app.post('/api/backup', (req, res) => {
  try {
    const backup = req.body;
    const backupFileName = `backup_${new Date().toISOString().split('T')[0]}_${Date.now()}.json`;
    const backupPath = path.join(BACKUP_DIR, backupFileName);
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2), 'utf-8');
    res.json({ success: true, message: 'Backup criado com sucesso', filename: backupFileName });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 Acesse: http://localhost:${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
  console.log(`========================================`);
});

