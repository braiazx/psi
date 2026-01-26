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

**Ordenate** é uma solução completa desenvolvida para profissionais de psicologia organizacional gerenciarem seus clientes, atendimentos, finanças e relatórios de forma eficiente e moderna. A plataforma oferece uma interface intuitiva com visualização de dados em tempo real através de gráficos interativos.

### ✨ Destaques

- 🎨 **Interface Moderna**: Design elegante com tema roxo personalizado
- 📊 **Gráficos Interativos**: Visualização de dados com filtros dinâmicos
- 💰 **Gestão Financeira**: Controle de receitas, despesas e fluxo de caixa
- 📅 **Agenda Completa**: Calendário com eventos e integração financeira
- 📝 **Anotações Inteligentes**: Sistema de notas com indicadores psicológicos
- 🔍 **Pesquisa Avançada**: Busca centralizada com múltiplos filtros
- 📄 **Relatórios PDF**: Relatórios semanais, mensais e por cliente (estilo Persona Card)
- 📥 **Exportação Excel**: Dados completos em formato .xlsx
- 👤 **Perfil Completo**: Foto, dados pessoais e integração com LinkedIn

---

## 🚀 Funcionalidades

### 📊 Painel de Controle
- **Estatísticas em Tempo Real**: Total de clientes, ativos, em avaliação
- **Gráficos Interativos**: Status, gênero, estados emocionais, tipos de acompanhamento
- **Filtros Dinâmicos**: Clique em qualquer elemento para filtrar

### 👥 Gestão de Clientes
- **Cadastro Completo**: Informações pessoais, financeiras e de contato
- **Upload de Foto**: Imagem de perfil para cada cliente
- **Integração LinkedIn**: Link direto para o perfil profissional
- **Modal de Perfil**: Visualização completa com indicadores e estatísticas

### 📅 Agenda
- **Calendário Visual**: Navegação mensal com eventos destacados
- **Tipos de Evento**: Consulta, Avaliação, Retorno, Reunião, Acompanhamento
- **Integração Financeira**: Valor do evento gera receita automaticamente
- **Gestão de Eventos**: Criar, editar e excluir eventos

### 📝 Anotações
- **Indicadores Psicológicos Organizacionais**:
  - **Estado Emocional**: Colaborativo, Motivado, Neutro, Ansioso, Estressado, Desmotivado
  - **Tendência Comportamental**: Proativo, Engajado, Estável, Em adaptação, Reativo, Resistente
  - **Nível de Urgência**: Baixa, Média, Alta, Crítica
  - **Tipo de Acompanhamento**: Rotina, Desenvolvimento, Orientação, Feedback, Avaliação, Conflito, Crise
- **Histórico por Cliente**: Todas as anotações organizadas por data

### 💰 Financeiro
- **Gestão de Transações**: Receitas e despesas com categorização
- **Formas de Pagamento**: Dinheiro, PIX, Cartão Crédito/Débito, Boleto, Transferência
- **Categorias de Despesa**: Aluguel, Material, Marketing, Software, Transporte, Alimentação, Outros
- **Gráficos Financeiros**: Receitas vs Despesas, Fluxo de Caixa, Despesas por Categoria
- **Integração com Agenda**: Eventos realizados geram receitas automaticamente

### 🔍 Pesquisa
- **Busca Centralizada**: Pesquise clientes por nome, email ou telefone
- **Filtros Avançados**: Status, gênero
- **Atalho de Teclado**: `Ctrl+K` para busca rápida
- **Exportação**: Resultados para Excel
- **Acesso Rápido**: Ver perfil, gerar relatório, ir para anotações

### 📄 Relatórios
- **Relatório Semanal**: Resumo da semana com métricas principais
- **Relatório Mensal**: Análise detalhada com insights e recomendações
- **Relatório por Cliente**: Estilo Persona Card com:
  - Foto e dados pessoais
  - Indicadores de acompanhamento mais frequentes
  - Estatísticas (anotações, eventos, receitas)
  - Histórico de anotações recentes
- **Exportação Excel**: Dados completos de todos os clientes

### 👤 Perfil do Usuário
- Nome, idade, gênero e pronomes
- Upload de foto de perfil
- Dados de contato

---


1. **Cadastrar Cliente**: Aba "Clientes" → Preencher formulário → Salvar
2. **Agendar Evento**: Aba "Agenda" → Clicar no dia → Preencher dados
3. **Fazer Anotação**: Aba "Anotações" → Selecionar cliente → Adicionar nota com indicadores
4. **Acompanhar Finanças**: Aba "Financeiro" → Ver gráficos e transações
5. **Gerar Relatório**: Aba "Pesquisa" → Encontrar cliente → "Relatório PDF"

---

## 🛠️ Tecnologias

### Frontend
- **Next.js 16.1.1** - Framework React com SSR
- **React 19.2.3** - Biblioteca UI
- **TypeScript 5.0** - Tipagem estática
- **Tailwind CSS 4.0** - Estilização utility-first
- **Recharts 3.6.0** - Gráficos interativos
- **jsPDF** - Geração de PDFs
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
│   │   ├── app/
│   │   │   ├── page.tsx       # Página de login
│   │   │   ├── inicio/
│   │   │   │   ├── page.tsx   # Dashboard principal
│   │   │   │   └── perfil/
│   │   │   │       └── page.tsx  # Página de perfil
│   │   │   └── globals.css    # Estilos globais
│   │   ├── components/
│   │   │   ├── ConfirmModal.tsx  # Modal de confirmação
│   │   │   └── Toast.tsx         # Notificações
│   │   └── utils/
│   │       └── localStorage.ts   # Funções de persistência
│   ├── public/                # Ícones e assets
│   ├── package.json
│   └── next.config.ts
│
├── COMANDOS.txt               # Lista de comandos úteis
├── LEIA-ME.txt                # Instruções rápidas
├── LICENSE                    # Licença MIT
└── README.md                  # Este arquivo
```

---

## 🎨 Paleta de Cores

Design moderno com paleta suave e minimalista:

| Cor | Hex | Uso |
|-----|-----|-----|
| Slate Escuro | `#0f172a` | Background principal |
| Slate Médio | `#1e293b` | Cards e containers |
| Slate Claro | `#334155` | Elementos secundários |
| Verde | `#22c55e` | Status ativo, sucesso |
| Amarelo | `#f59e0b` | Em avaliação, atenção |
| Vermelho | `#ef4444` | Inativo, erros, crítico |
| Azul | `#3b82f6` | Links e ações |

---

## 📊 Indicadores de Psicologia Organizacional

### Estados Emocionais
| Estado | Cor | Descrição |
|--------|-----|-----------|
| Colaborativo | 🟢 Verde | Receptivo e comunicativo |
| Motivado | 🟢 Esmeralda | Engajado e proativo |
| Neutro | ⚪ Cinza | Objetivo e contido |
| Ansioso | 🟡 Amarelo | Preocupado, inquieto |
| Estressado | 🟠 Laranja | Sob pressão |
| Desmotivado | 🔴 Vermelho | Desengajado |

### Tendências Comportamentais
| Tendência | Cor | Descrição |
|-----------|-----|-----------|
| Proativo | 🟢 Verde | Iniciativa e autonomia |
| Engajado | 🟢 Esmeralda | Comprometido |
| Estável | ⚪ Cinza | Consistente |
| Em adaptação | 🟡 Amarelo | Período de ajuste |
| Reativo | 🟠 Laranja | Responde a estímulos |
| Resistente | 🔴 Vermelho | Dificuldade com mudanças |

---

## 🔒 Segurança

- Dados armazenados localmente no navegador
- Validação de formulários
- TypeScript para type safety
- Sanitização de inputs

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

- Comunidade React/Next.js
- Todos os contribuidores

---

<div align="center">

### ⭐ Se este projeto foi útil, considere dar uma estrela!

**Desenvolvido com ❤️ e ☕**

[⬆ Voltar ao topo](#-ordenate)

</div>
