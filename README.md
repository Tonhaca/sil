# Sistema Inteligente de Licitações (SIL)

Sistema para consulta de licitações no Portal Nacional de Contratações Públicas (PNCP) com interface moderna e dados em tempo real.

## 🚀 Funcionalidades

- **Busca por Termo**: Pesquisa licitações por palavra-chave
- **Busca por Item**: Pesquisa licitações por item específico
- **Licitações em Aberto**: Visualiza licitações recebendo propostas
- **Filtros Avançados**: Por período, localização, valor estimado
- **Dados Reais**: Integração direta com a API oficial do PNCP
- **Fallback Inteligente**: Web scraping quando a API não responde

## 🛠️ Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Validação**: Zod
- **Testes**: Vitest
- **Deploy**: Railway

## 📦 Instalação

```bash
# Clone o repositório
git clone <repository-url>
cd sistema-inteligente-licitacoes

# Instale as dependências
npm install

# Execute em desenvolvimento
npm run dev

# Execute em produção
npm run build
npm start
```

## 🧪 Testes

```bash
# Executar todos os testes
npm run test:run

# Executar testes em modo watch
npm run test

# Interface visual dos testes
npm run test:ui
```

## 🔌 API Endpoints

### Rotas HTTP (Conforme recomendação ChatGPT 5)

#### `GET /api/pncp/recebendo-proposta`
Busca licitações com período de recebimento de propostas em aberto.

**Parâmetros:**
- `modalidade` (number, default: 6) - Código da modalidade
- `dataFinal` (string AAAAMMDD, default: hoje) - Data final
- `pagina` (number, default: 1) - Número da página
- `tamanhoPagina` (number, default: 500) - Tamanho da página
- `todasPaginas` (boolean, default: true) - Buscar todas as páginas

**Exemplo:**
```bash
curl "http://localhost:3000/api/pncp/recebendo-proposta?modalidade=6&todasPaginas=true"
```

#### `GET /api/pncp/publicadas`
Busca licitações publicadas no período especificado.

**Parâmetros:**
- `modalidade` (number, obrigatório) - Código da modalidade
- `dataInicial` (string AAAAMMDD, obrigatório) - Data inicial
- `dataFinal` (string AAAAMMDD, obrigatório) - Data final
- `pagina` (number, default: 1) - Número da página
- `tamanhoPagina` (number, default: 500) - Tamanho da página
- `todasPaginas` (boolean, default: true) - Buscar todas as páginas

**Exemplo:**
```bash
curl "http://localhost:3000/api/pncp/publicadas?modalidade=6&dataInicial=20250801&dataFinal=20250813&todasPaginas=true"
```

## 📊 Estrutura do Projeto

```
src/
├── api/pncp/                    # Rotas HTTP (ChatGPT 5)
│   ├── recebendo-proposta.ts
│   └── publicadas.ts
├── components/                  # Componentes React
├── hooks/                      # Custom hooks
├── services/                   # Serviços de API
│   ├── pncpApi.ts             # Integração principal
│   ├── pncpClient.ts          # Cliente Axios
│   ├── pncpService.ts         # Lógica de negócio
│   └── webScrapingService.ts  # Fallback web scraping
├── types/                     # Tipos TypeScript
│   ├── pncp.ts               # Tipos principais
│   └── pncpApi.ts            # Tipos da API
└── utils/                     # Utilitários
    └── date.ts               # Helpers de data

tests/                         # Testes unitários
├── date.test.ts              # Testes de data
└── setup.ts                  # Setup dos testes
```

## 🔧 Configuração

### Variáveis de Ambiente

```env
# Porta do servidor (opcional)
PORT=3000

# URL base da API do PNCP
PNCP_BASE_URL=https://pncp.gov.br/api/consulta
```

### Modalidades de Contratação

- `6` - Pregão Eletrônico
- `4` - Concorrência Eletrônica
- `5` - Concorrência Presencial
- `8` - Dispensa
- `9` - Inexigibilidade

## 🚀 Deploy

### Railway

1. Conecte seu repositório ao Railway
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Outras Plataformas

O projeto é compatível com qualquer plataforma que suporte Node.js.

## 📝 Licença

MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para suporte, abra uma issue no repositório ou entre em contato com a equipe SIL.
