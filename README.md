# SIL - Sistema Inteligente de Licitações

Sistema web para busca e consulta de licitações públicas do Brasil através da API do PNCP (Portal Nacional de Contratações Públicas).

## 🚀 Características

- **Dados Reais**: Consome diretamente a API pública do PNCP sem dados mockados
- **Busca Inteligente**: Pesquisa por itens específicos (ex: "mamadeira" encontra mamadeiras de 0-6 anos, com bico de silicone, etc.)
- **Filtros Avançados**: Por data, localização, modalidade, situação, valor
- **Interface Moderna**: Design responsivo com Tailwind CSS
- **Detalhes Completos**: Visualização completa de cada licitação com documentos
- **Paginação**: Navegação eficiente entre resultados
- **Deploy Automático**: Configurado para Railway

## 🛠️ Tecnologias

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Date Handling**: date-fns
- **Deploy**: Railway

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn

## 🚀 Instalação e Execução

### Desenvolvimento Local

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd sistema-inteligente-licitacoes
```

2. **Instale as dependências**
```bash
npm install
```

3. **Execute em modo desenvolvimento**
```bash
npm run dev
```

4. **Acesse a aplicação**
```
http://localhost:3000
```

### Build para Produção

```bash
npm run build
npm run preview
```

## 🚀 Deploy no Railway

### Configuração Automática

1. **Conecte o repositório ao Railway**
   - Acesse [railway.app](https://railway.app)
   - Conecte sua conta GitHub
   - Selecione este repositório

2. **Deploy Automático**
   - O Railway detectará automaticamente a configuração
   - O build e deploy acontecerão automaticamente
   - A URL será gerada automaticamente

### Configuração Manual (se necessário)

```bash
# Instale o CLI do Railway
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

## 📱 Funcionalidades

### 🔍 Busca Inteligente
- Pesquisa por termos gerais
- Busca específica por itens
- Resultados ordenados por data mais recente

### 🎯 Filtros Avançados
- **Período**: Data de publicação
- **Localização**: UF e município
- **Valor**: Range de valores estimados
- **Modalidade**: Pregão, Concorrência, etc.
- **Situação**: Em aberto, Homologada, etc.

### 📊 Visualização de Dados
- Cards informativos de cada licitação
- Detalhes completos em modal
- Informações do órgão contratante
- Itens da contratação
- Documentos disponíveis
- Cronograma de datas importantes

### 📄 Documentos
- Acesso direto aos documentos da licitação
- Links para edital, anexos e outros arquivos
- Download facilitado

## 🏗️ Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── Header.tsx      # Cabeçalho com busca
│   ├── Sidebar.tsx     # Filtros avançados
│   ├── ContratacaoCard.tsx # Card de licitação
│   ├── Pagination.tsx  # Navegação de páginas
│   └── ContratacaoDetalhes.tsx # Modal de detalhes
├── hooks/              # Hooks customizados
│   └── useContratacoes.ts # Gerenciamento de estado
├── services/           # Serviços de API
│   └── pncpApi.ts     # Integração com PNCP
├── types/              # Tipos TypeScript
│   └── pncp.ts        # Interfaces da API
├── App.tsx            # Componente principal
├── main.tsx           # Ponto de entrada
└── index.css          # Estilos globais
```

## 🔌 API do PNCP

O sistema consome a API pública do PNCP disponível em:
- **Documentação**: https://pncp.gov.br/api/consulta/swagger-ui/index.html#/
- **Manual**: https://www.gov.br/pncp/pt-br/central-de-conteudo/manuais/versoes-anteriores/ManualPNCPAPIConsultasVerso1.0.pdf
- **Site Oficial**: https://pncp.gov.br

### Endpoints Utilizados
- `/contratacoes` - Busca por data
- `/contratacoes/em-aberto` - Licitações em aberto
- `/contratacoes/filtros` - Busca com filtros
- `/contratacoes/busca` - Busca por termo
- `/contratacoes/por-item` - Busca por item específico

## 🎨 Design System

### Cores
- **Primary**: Azul (#3B82F6)
- **Secondary**: Cinza (#64748B)
- **Success**: Verde (#10B981)
- **Warning**: Amarelo (#F59E0B)
- **Error**: Vermelho (#EF4444)

### Componentes
- Cards com sombra suave
- Botões com estados hover
- Inputs com foco destacado
- Modais responsivos
- Paginação intuitiva

## 📱 Responsividade

- **Mobile First**: Design otimizado para dispositivos móveis
- **Tablet**: Layout adaptativo para tablets
- **Desktop**: Interface completa para desktop
- **Sidebar**: Colapsável em dispositivos móveis

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build
npm run lint         # Linting do código
```

## 🐛 Troubleshooting

### Problemas Comuns

1. **Erro de CORS**
   - A API do PNCP pode ter restrições de CORS
   - Use um proxy ou configure headers adequados

2. **Timeout nas Requisições**
   - A API pode ser lenta em horários de pico
   - Timeout configurado para 30 segundos

3. **Dados Não Carregam**
   - Verifique a conectividade com a API
   - Consulte os logs do console

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para suporte e dúvidas:
- Abra uma issue no GitHub
- Consulte a documentação da API do PNCP
- Verifique os logs do console

---

**Desenvolvido com ❤️ para facilitar o acesso às licitações públicas do Brasil**
