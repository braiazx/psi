<div align="center">

# 🟣 ORDENATE

### Sistema de Gestão Psicológica Organizacional

![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js&logoColor=white)

**Uma plataforma moderna e intuitiva para gestão de atendimentos psicológicos organizacionais**

[🚀 Funcionalidades](#-funcionalidades) • [📦 Instalação](#-instalação) • [💻 Uso](#-uso) • [🛠️ Tecnologias](#️-tecnologias) • [📁 Estrutura](#-estrutura)

---

</div>

## 📖 Sobre o Projeto

**Ordenate** é uma solução completa desenvolvida para profissionais de psicologia organizacional gerenciarem seus clientes, atendimentos e relatórios de forma eficiente e moderna. A plataforma oferece uma interface intuitiva com visualização de dados em tempo real através de gráficos interativos.

### ✨ Destaques

- 🎨 **Interface Moderna**: Design elegante com tema roxo personalizado
- 📊 **Gráficos Interativos**: Visualização de dados com filtros dinâmicos (estilo Looker/Power BI)
- 💾 **Armazenamento Local**: Dados salvos no navegador (localStorage)
- 📥 **Exportação Excel**: Relatórios completos em formato .xlsx
- 🔍 **Busca e Filtros**: Sistema avançado de pesquisa e filtragem
- 👤 **Gestão de Perfil**: Perfil personalizável com foto

---

## 🚀 Funcionalidades

### 🔐 Autenticação
- Login seguro com validação
- Modo "Lembrar-me"
- Verificação de senha em tempo real

### 👥 Gestão de Clientes

#### **Cadastros Completos**
- Informações pessoais completas (CPF, RG, data de nascimento)
- Dados financeiros (plano, valor de sessão)
- Endereço e informações adicionais
- Responsável e observações gerais
- Sistema de anotações por cliente

#### **Cadastro Rápido**
- Atendimentos rápidos para órgãos públicos
- Registro de humor no momento do atendimento:
  - 🤝 **Colaborativo**: Receptivo e comunicativo
  - 😐 **Neutro**: Objetivo e contido
  - 😤 **Tensionado**: Irritado ou frustrado

### 📊 Painel de Controle

#### **Estatísticas em Tempo Real**
- Total de clientes
- Clientes ativos
- Em avaliação
- Atendimentos rápidos

#### **Gráficos Interativos**
- 📈 **Distribuição por Tipo**: Pizza chart (Completos vs Rápidos)
- 📊 **Distribuição por Status**: Gráfico de barras (Ativo, Inativo, Em avaliação)
- 😊 **Humor nos Atendimentos**: Análise de humor dos atendimentos rápidos
- 👥 **Distribuição por Gênero**: Visualização demográfica

#### **Filtros Dinâmicos**
- Clique em qualquer elemento do gráfico para filtrar os demais
- Sistema de filtros combinados (tipo, status, gênero, humor)
- Indicador visual de filtros ativos
- Botão para limpar todos os filtros

### 📥 Relatórios
- Exportação para Excel (.xlsx)
- Separação por tipo de cadastro
- Dados completos e organizados

### 👤 Perfil do Usuário
- Nome, idade, gênero e pronomes
- Upload de foto de perfil
- Persistência de dados

---

## 📦 Instalação

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn

### Passo a Passo

1. **Clone o repositório**
```bash
git clone https://github.com/braiazx/psi.git
cd psi
```

2. **Instale as dependências do backend**
```bash
cd backend
npm install
npm run build
```

3. **Instale as dependências do frontend**
```bash
cd ../frontend
npm install
```

4. **Inicie o backend** (em um terminal)
```bash
cd backend
npm start
```

5. **Inicie o frontend** (em outro terminal)
```bash
cd frontend
npm run dev
```

6. **Acesse a aplicação**
```
Frontend: http://localhost:3000
Backend:  http://localhost:3001
```

### 🔑 Credenciais de Acesso

```
Usuário: adm
Senha:   adm
```

---

## 💻 Uso

### Primeiro Acesso

1. Acesse `http://localhost:3000`
2. Faça login com as credenciais acima
3. Explore o painel principal

### Cadastrando Clientes

1. Vá para a aba **"Clientes"**
2. Escolha entre **"Cadastros"** (completo) ou **"Cadastro rápido"**
3. Preencha os campos necessários
4. Clique em **"Salvar Cliente"**

### Visualizando Dados

1. Acesse a aba **"Painel"**
2. Visualize os gráficos interativos
3. **Clique em qualquer elemento** para filtrar os outros gráficos
4. Use o botão **"Limpar Filtros"** para resetar

### Exportando Relatórios

1. Vá para a aba **"Relatórios"**
2. Escolha o tipo de exportação
3. Clique em **"Baixar Excel"**
4. O arquivo será salvo na pasta Downloads

---

## 🛠️ Tecnologias

### Frontend
- **Next.js 16.1.1** - Framework React com SSR
- **React 19.2.3** - Biblioteca UI
- **TypeScript 5.0** - Tipagem estática
- **Tailwind CSS 4.0** - Estilização utility-first
- **Recharts 3.6.0** - Gráficos interativos
- **XLSX 0.18.5** - Exportação para Excel

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **TypeScript** - Tipagem estática

### Armazenamento
- **localStorage** - Persistência no navegador

---

## 📁 Estrutura do Projeto

```
projeto001/
├── backend/
│   ├── src/
│   │   └── index.ts          # Servidor Express
│   ├── dist/                  # Build TypeScript
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   └── app/
│   │       ├── page.tsx       # Página de login
│   │       ├── inicio/
│   │       │   ├── page.tsx  # Dashboard principal
│   │       │   └── perfil/
│   │       │       └── page.tsx  # Página de perfil
│   │       └── globals.css    # Estilos globais
│   ├── public/               # Ícones e assets
│   ├── package.json
│   └── next.config.js
│
└── README.md
```

---

## 🎨 Paleta de Cores

O projeto utiliza uma paleta roxa moderna:

- **Roxo Principal**: `#9333ea`
- **Fuchsia**: `#ec4899`
- **Indigo**: `#6366f1`
- **Fundo Escuro**: `#0b0416`

---

## 📊 Funcionalidades dos Gráficos

### Interatividade
- ✅ Clique em qualquer elemento para filtrar
- ✅ Múltiplos filtros simultâneos
- ✅ Atualização em tempo real
- ✅ Animações suaves
- ✅ Tooltips informativos
- ✅ Sem bordas brancas (design limpo)

### Tipos de Gráficos
1. **Pie Chart** - Distribuição por tipo e gênero
2. **Bar Chart** - Status e humor
3. **Tabela Resumo** - Estatísticas detalhadas

---

## 🔒 Segurança

- Dados armazenados localmente no navegador
- Validação de formulários
- Proteção contra XSS
- TypeScript para type safety

---

## 🚧 Roadmap

- [ ] Integração com banco de dados
- [ ] Autenticação JWT
- [ ] Sistema de backup
- [ ] Notificações
- [ ] Calendário de agendamentos
- [ ] Chat interno
- [ ] Relatórios PDF
- [ ] Dashboard avançado

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fazer fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abrir um Pull Request

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

## 👨‍💻 Autor

**Nikolas Brian Victor da Silva**

- GitHub: [@braiazx](https://github.com/braiazx)
- Projeto: [Ordenate](https://github.com/braiazx/psi)

---

## 🙏 Agradecimentos

- Inspirado em [psicomanager.com.br](https://www.psicomanager.com.br)
- Comunidade React/Next.js
- Todos os contribuidores

---

<div align="center">

### ⭐ Se este projeto foi útil, considere dar uma estrela!

**Desenvolvido com ❤️ e ☕**

[⬆ Voltar ao topo](#-ordenate)

</div>
