# 🚀 Guia de Instalação - Ordenate

## Pré-requisitos

- **Node.js 18+** instalado
  - Verificar: `node --version`
  - Download: https://nodejs.org/

## Instalação Passo a Passo

### 1. Clonar o Repositório

```bash
git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
cd projeto001
```

### 2. Instalar Dependências do Backend

```bash
cd backend
npm install
```

### 3. Instalar Dependências do Frontend

```bash
cd ../frontend
npm install
```

### 4. Iniciar os Servidores

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
✅ Backend rodando em: http://localhost:3001

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
✅ Frontend rodando em: http://localhost:3000 (ou 3002)

### 5. Acessar o Sistema

1. Abra o navegador
2. Acesse: http://localhost:3000 (ou a porta que aparecer no terminal)
3. Login:
   - Usuário: `adm`
   - Senha: `adm`

## Dados de Demonstração

O sistema já vem com dados fictícios pré-carregados:
- ✅ 12 clientes
- ✅ 8 eventos na agenda
- ✅ 15 transações financeiras
- ✅ 10 anotações

Os dados aparecem automaticamente ao acessar pela primeira vez.

## Solução de Problemas

### Porta 3000 já está em uso
- O Next.js automaticamente usará a porta 3002
- Acesse: http://localhost:3002

### Erro ao instalar dependências
```bash
# Limpar cache e reinstalar
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Erro de compilação TypeScript
```bash
# Reinstalar dependências
cd backend
npm install

cd ../frontend
npm install
```

## Estrutura de Pastas

```
projeto001/
├── backend/          # Servidor Node.js/Express
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/         # Aplicação Next.js
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── next.config.ts
│
└── README.md
```

## Comandos Úteis

```bash
# Backend
cd backend
npm run dev      # Desenvolvimento
npm run build    # Build para produção
npm start        # Executar build

# Frontend
cd frontend
npm run dev      # Desenvolvimento
npm run build    # Build para produção
npm start        # Executar build
```

## Suporte

Se encontrar problemas:
1. Verifique se o Node.js está instalado: `node --version`
2. Verifique se as portas 3000 e 3001 estão livres
3. Limpe o cache: `npm cache clean --force`
4. Reinstale as dependências

