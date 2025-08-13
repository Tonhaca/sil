# PROMPT PARA O CURSOR — INTEGRAR CONSULTAS AO PNCP (LICITAÇÕES)

Você é um engenheiro sênior de Node.js/TypeScript criando um **módulo backend** para consultar licitações no **PNCP** (Portal Nacional de Contratações Públicas) e expor rotas HTTP para meu frontend. Entregue **código de produção**, limpo e testável.

## 🎯 Objetivo

- Criar um **serviço backend** (Node/Next.js API Route ou Express) que consome a **API pública de consultas do PNCP** e expõe endpoints internos como:
  - `GET /api/pncp/recebendo-proposta`
  - `GET /api/pncp/publicadas`
- O frontend **NÃO** chamará `pncp.gov.br` direto (evitar CORS). Sempre via nosso backend.
- Implementar **paginação total** (varrer todas as páginas), **validações**, **tratamento de erros**, e **tests**.

## 🔗 Base da API PNCP (Produção)

- `BASE_URL = https://pncp.gov.br/api/consulta`
- Endpoints que usaremos inicialmente (v1):
  - `GET /v1/contratacoes/proposta` → licitações com **recebimento de propostas em aberto**
  - `GET /v1/contratacoes/publicacao` → licitações **publicadas** no período

## ⚙️ Parâmetros importantes (regras)

- **Datas** em **AAAAMMDD** (ex.: `20250813`) — sem hífens.
- \`\`\*\* é obrigatório\*\* nos endpoints acima.
  - Exemplos comuns: `6 = Pregão Eletrônico`, `4 = Concorrência Eletrônica`, `5 = Concorrência Presencial`, `8 = Dispensa`, `9 = Inexigibilidade`.
- **Paginação**: `pagina` (1-based) e `tamanhoPagina` (aceite até **500**). Sempre passar explicitamente.

## ✅ Requisitos funcionais

1. **Rotas internas**
   - `GET /api/pncp/recebendo-proposta`
     - Query params aceitos:\
       `modalidade` (number, default 6),\
       `dataFinal` (string AAAAMMDD, default = hoje),\
       `pagina` (number, default 1),\
       `tamanhoPagina` (number, default 500),\
       `todasPaginas` (boolean, default true → retorna todos os resultados somando páginas).
   - `GET /api/pncp/publicadas`
     - Query params aceitos:\
       `modalidade` (number, obrigatório),\
       `dataInicial` (AAAAMMDD, obrigatório),\
       `dataFinal` (AAAAMMDD, obrigatório),\
       `pagina`, `tamanhoPagina`, `todasPaginas` (mesma lógica).
2. **Paginação completa** quando `todasPaginas=true`: buscar página 1…N e **agregar**.
3. **Validação** robusta (zod ou similar). Se inválido, retornar **400** com mensagem clara.
4. **Tratamento de erros**: timeouts, 4xx/5xx do PNCP, rede, formato inválido → mapear em respostas HTTP legíveis (400/422/502/504).
5. **Tipagem** TS para respostas mínimas úteis (IDs, órgão, objeto, datas de abertura/encerramento de propostas/publicação).
6. **Utilitários**
   - `formatDateYYYYMMDD(date: Date | string)`.
   - Guardas para `AAAAMMDD`.
7. **Tests** unitários dos helpers e integração “mockada” do client HTTP.

## 🗂️ Estrutura sugerida

```
/src
  /lib
    pncpClient.ts          # axios instance + chamadas de baixo nível
    pncpService.ts         # lógica de alto nível (validação, paginação, agregação)
    pncpTypes.ts           # tipos TS das respostas
    date.ts                # helpers de data
  /api
    pncp
      recebendo-proposta.ts  # handler (Next API Route) ou router Express
      publicadas.ts
/tests
  date.test.ts
  pncpService.test.ts
  pncpClient.test.ts
```

## 🧩 Implementação — faça o código completo

### 1) Axios client

- Timeout 30s, `accept: */*`.
- Base: `https://pncp.gov.br/api/consulta`.

### 2) Tipos (ajuste conforme retorno real do PNCP)

Inclua ao menos:

```ts
export interface PaginacaoPNCP {
  paginaAtual: number;
  totalPaginas: number;
  totalRegistros: number;
  tamanhoPagina: number;
}

export interface UnidadeGestora {
  nome: string;
  cnpj: string;
  uf?: string;
  ibge?: string;
}

export interface ContratacaoResumo {
  numeroControlePNCP: string;
  modalidadeCodigo: number;
  modalidadeNome?: string;
  objetoCompra?: string;
  informacaoComplementar?: string;
  orgao?: UnidadeGestora;
  dataAberturaProposta?: string;     // AAAA-MM-DDTHH:mm:ssZ ou AAAAMMDD se vier assim
  dataEncerramentoProposta?: string;
  dataPublicacaoPncp?: string;
  urlDetalhe?: string;               // se houver
}

export interface RespostaContratacoes {
  conteudo: ContratacaoResumo[];
  paginacao: PaginacaoPNCP;
}
```

### 3) Helpers de data

```ts
export function formatDateYYYYMMDD(input?: Date | string): string {
  const d = input ? new Date(input) : new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

export function isYYYYMMDD(v: string): boolean {
  return /^[0-9]{8}$/.test(v);
}
```

### 4) pncpClient.ts (baixo nível)

```ts
import axios from "axios";

export const PNCP_BASE = "https://pncp.gov.br/api/consulta";

export const pncp = axios.create({
  baseURL: PNCP_BASE,
  timeout: 30000,
  headers: { accept: "*/*" },
});

// GET /v1/contratacoes/proposta
export async function getContratacoesPropostaRaw(params: {
  dataFinal: string;                   // AAAAMMDD
  codigoModalidadeContratacao: number; // obrigatório
  pagina?: number;
  tamanhoPagina?: number;
}) {
  const { data } = await pncp.get("/v1/contratacoes/proposta", { params });
  return data;
}

// GET /v1/contratacoes/publicacao
export async function getContratacoesPublicacaoRaw(params: {
  dataInicial: string;                 // AAAAMMDD
  dataFinal: string;                   // AAAAMMDD
  codigoModalidadeContratacao: number; // obrigatório
  pagina?: number;
  tamanhoPagina?: number;
}) {
  const { data } = await pncp.get("/v1/contratacoes/publicacao", { params });
  return data;
}
```

### 5) pncpService.ts (validação + paginação + normalização)

Use **zod** para validar queries internas e montar chamadas, e implemente **paginações sucessivas** até `totalPaginas`.

```ts
import { z } from "zod";
import { getContratacoesPropostaRaw, getContratacoesPublicacaoRaw } from "./pncpClient";
import { isYYYYMMDD } from "./date";

const PropostaQuery = z.object({
  modalidade: z.coerce.number().int().min(1).default(6),
  dataFinal: z.string().refine(isYYYYMMDD, "dataFinal deve ser AAAAMMDD").default(() => {
    const d = new Date();
    return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`;
  }),
  pagina: z.coerce.number().int().min(1).default(1),
  tamanhoPagina: z.coerce.number().int().min(1).max(500).default(500),
  todasPaginas: z.coerce.boolean().default(true),
});

const PublicadasQuery = z.object({
  modalidade: z.coerce.number().int().min(1),
  dataInicial: z.string().refine(isYYYYMMDD, "dataInicial deve ser AAAAMMDD"),
  dataFinal: z.string().refine(isYYYYMMDD, "dataFinal deve ser AAAAMMDD"),
  pagina: z.coerce.number().int().min(1).default(1),
  tamanhoPagina: z.coerce.number().int().min(1).max(500).default(500),
  todasPaginas: z.coerce.boolean().default(true),
});

export async function listarRecebendoProposta(qs: unknown) {
  const q = PropostaQuery.parse(qs);

  const first = await getContratacoesPropostaRaw({
    dataFinal: q.dataFinal,
    codigoModalidadeContratacao: q.modalidade,
    pagina: q.pagina,
    tamanhoPagina: q.tamanhoPagina,
  });

  const results = Array.isArray(first?.conteudo) ? [...first.conteudo] : [];
  const totalPaginas = first?.paginacao?.totalPaginas ?? 1;

  if (q.todasPaginas && q.pagina === 1 && totalPaginas > 1) {
    for (let p = 2; p <= totalPaginas; p++) {
      const page = await getContratacoesPropostaRaw({
        dataFinal: q.dataFinal,
        codigoModalidadeContratacao: q.modalidade,
        pagina: p,
        tamanhoPagina: q.tamanhoPagina,
      });
      if (Array.isArray(page?.conteudo)) results.push(...page.conteudo);
    }
  }

  return {
    paginacao: first?.paginacao ?? { paginaAtual: q.pagina, totalPaginas, totalRegistros: results.length, tamanhoPagina: q.tamanhoPagina },
    conteudo: results,
  };
}

export async function listarPublicadas(qs: unknown) {
  const q = PublicadasQuery.parse(qs);

  const first = await getContratacoesPublicacaoRaw({
    dataInicial: q.dataInicial,
    dataFinal: q.dataFinal,
    codigoModalidadeContratacao: q.modalidade,
    pagina: q.pagina,
    tamanhoPagina: q.tamanhoPagina,
  });

  const results = Array.isArray(first?.conteudo) ? [...first.conteudo] : [];
  const totalPaginas = first?.paginacao?.totalPaginas ?? 1;

  if (q.todasPaginas && q.pagina === 1 && totalPaginas > 1) {
    for (let p = 2; p <= totalPaginas; p++) {
      const page = await getContratacoesPublicacaoRaw({
        dataInicial: q.dataInicial,
        dataFinal: q.dataFinal,
        codigoModalidadeContratacao: q.modalidade,
        pagina: p,
        tamanhoPagina: q.tamanhoPagina,
      });
      if (Array.isArray(page?.conteudo)) results.push(...page.conteudo);
    }
  }

  return {
    paginacao: first?.paginacao ?? { paginaAtual: q.pagina, totalPaginas, totalRegistros: results.length, tamanhoPagina: q.tamanhoPagina },
    conteudo: results,
  };
}
```

### 6) Rotas (Next.js API Routes) — adapte para Express se preferir

```ts
// /src/api/pncp/recebendo-proposta.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { listarRecebendoProposta } from "@/lib/pncpService";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
    const data = await listarRecebendoProposta(req.query);
    res.status(200).json(data);
  } catch (err: any) {
    const msg = err?.message ?? "Erro ao consultar PNCP";
    const status = msg.toLowerCase().includes("aaaammdd") ? 400 : 502;
    res.status(status).json({ error: msg });
  }
}
```

```ts
// /src/api/pncp/publicadas.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { listarPublicadas } from "@/lib/pncpService";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
    const data = await listarPublicadas(req.query);
    res.status(200).json(data);
  } catch (err: any) {
    const msg = err?.message ?? "Erro ao consultar PNCP";
    const status = msg.toLowerCase().includes("aaaammdd") ? 400 : 502;
    res.status(status).json({ error: msg });
  }
}
```

### 7) Exemplos de uso (cURL)

```bash
# Recebendo proposta (pregão eletrônico = 6), hoje, todas as páginas
curl -s "http://localhost:3000/api/pncp/recebendo-proposta?todasPaginas=true&modalidade=6"

# Publicadas no período (01–13/08/2025), modalidade 6
curl -s "http://localhost:3000/api/pncp/publicadas?modalidade=6&dataInicial=20250801&dataFinal=20250813&todasPaginas=true"
```

### 8) Testes (exemplo com Vitest/Jest)

- Testar `formatDateYYYYMMDD` e `isYYYYMMDD`.
- Mockar `pncpClient` e testar paginação (agrega N páginas).
- Testar validação (erro 400 quando data inválida).

### 9) Observações/Erros comuns (prevenir no código e doc)

- **Base path incorreto** → sempre `https://pncp.gov.br/api/consulta`.
- **Datas com hífen** (`2025-08-13`) → **inválido**; use `20250813`.
- \*\*Falta de \*\*\`\` → 400/422.
- **CORS** → nunca chamar do browser direto; usar nosso backend.

## 📌 Critérios de aceite

- Rodando local, `GET /api/pncp/recebendo-proposta` e `GET /api/pncp/publicadas` retornam JSON com `{ paginacao, conteudo[] }`.
- Quando `todasPaginas=true`, o serviço varre todas as páginas e agrega.
- Inputs inválidos retornam **400** com mensagem clara.
- Falhas do PNCP retornam **502/504** com mensagem útil.
- Código em **TypeScript**, organizado, com testes básicos passando.

## 🧪 Extra (opcional)

- Cache em memória (TTL curto) para evitar rate-limit em dev.
- Campo `source: "PNCP"` e carimbo de hora em cada item.
- Normalizar datas para ISO UTC (`YYYY-MM-DDTHH:mm:ssZ`) se vierem em outro formato.
- Parametrizar múltiplas modalidades (ex.: `modalidade=6,4,5`) expandindo chamadas em paralelo e agregando.

Produza todos os arquivos conforme estrutura proposta. Se detectar diferenças de contrato no retorno real do PNCP, **ajuste os tipos** mantendo os campos essenciais (`numeroControlePNCP`, `modalidade`, `objetoCompra`, datas, órgão). Documente no README curto como rodar e testar.

