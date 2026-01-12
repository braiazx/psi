# ⚡ Início Rápido - Ordenate

## Para replicar em outro PC

### 1. Clone o repositório
```bash
git clone https://github.com/braiazx/psi.git
cd psi
```

### 2. Instale as dependências

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd ../frontend
npm install
```

### 3. Inicie os servidores

**Terminal 1:**
```bash
cd backend
npm run dev
```

**Terminal 2:**
```bash
cd frontend
npm run dev
```

### 4. Acesse
- Frontend: http://localhost:3000 (ou 3002)
- Backend: http://localhost:3001

### 5. Login
- Usuário: `adm`
- Senha: `adm`

## ✅ Pronto!

O sistema já vem com dados fictícios pré-carregados para demonstração.

## 📋 Requisitos
- Node.js 18+ instalado
- Portas 3000 e 3001 livres

## 🆘 Problemas?

Verifique:
- Node.js instalado: `node --version`
- Portas livres: `netstat -ano | findstr :3000`
- Cache limpo: `npm cache clean --force`

