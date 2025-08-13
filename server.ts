// server.ts – Express + rotas que chamam PNCP no backend
// Produção: serve a pasta 'dist' (Vite build) + API
// Dev: rode `npm run dev` para Vite e este servidor em paralelo

import express from "express";
import axios from "axios";
import cors from "cors";
import compression from "compression";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());
app.use(compression());

// Em dev, liberar CORS para o Vite (5173). Em prod, ajuste a origin.
app.use(cors({ origin: true }));

const PNCP_BASE = "https://pncp.gov.br/api/consulta"; // base oficial
const AXIOS = axios.create({
  baseURL: PNCP_BASE,
  timeout: 30000,
  headers: { 
    accept: "application/json",
    "User-Agent": "SIL-Sistema-Inteligente-Licitacoes/1.0"
  },
});

// util: validar AAAAMMDD
function isYYYYMMDD(v: string): boolean {
  return /^[0-9]{8}$/.test(v);
}

// GET /api/health
app.get("/api/health", (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

// GET /api/pncp/recebendo-proposta
// Params: modalidade(=6 default), dataFinal(AAAAMMDD default hoje), pagina(1), tamanhoPagina(500),
//         todasPaginas(true para agregar tudo)
app.get("/api/pncp/recebendo-proposta", async (req, res) => {
  try {
    const modalidade = Number(req.query.modalidade ?? 6);
    const todasPaginas = String(req.query.todasPaginas ?? "true") === "true";
    const pagina = Number(req.query.pagina ?? 1);
    const tamanhoPagina = Math.max(Math.min(Number(req.query.tamanhoPagina ?? 50), 50), 10);

    const today = new Date();
    const dataFinal =
      typeof req.query.dataFinal === "string" && isYYYYMMDD(req.query.dataFinal)
        ? req.query.dataFinal
        : `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(
            today.getDate()
          ).padStart(2, "0")}`;

    if (!modalidade || !Number.isInteger(modalidade)) {
      return res.status(400).json({ error: "modalidade inválida" });
    }
    if (!isYYYYMMDD(dataFinal)) {
      return res.status(400).json({ error: "dataFinal deve ser AAAAMMDD" });
    }

    const baseParams = {
      dataFinal,
      codigoModalidadeContratacao: modalidade,
      pagina,
      tamanhoPagina,
    };

    console.log('🔍 PNCP Request params:', baseParams);
    console.log('🔍 PNCP URL:', `${PNCP_BASE}/v1/contratacoes/proposta`);

    const first = await AXIOS.get("/v1/contratacoes/proposta", { params: baseParams }).then(r => r.data);
    const results = Array.isArray(first?.data) ? [...first.data] : [];
    const totalPaginas = first?.totalPaginas ?? 1;

    if (todasPaginas && pagina === 1 && totalPaginas > 1) {
      for (let p = 2; p <= totalPaginas; p++) {
        try {
          const page = await AXIOS.get("/v1/contratacoes/proposta", {
            params: { ...baseParams, pagina: p },
          }).then(r => r.data);
          const chunk = Array.isArray(page?.data) ? page.data : [];
          results.push(...chunk);
        } catch (pageError) {
          console.warn(`⚠️ Erro ao buscar página ${p}:`, pageError?.response?.status || pageError?.message);
          // Continua para a próxima página em vez de falhar completamente
        }
      }
    }

    return res.json({
      paginacao: {
        paginaAtual: pagina,
        totalPaginas,
        totalRegistros: first?.totalRegistros ?? results.length,
        tamanhoPagina,
      },
      conteudo: results,
    });
  } catch (err: any) {
    console.error("PNCP ERROR:", {
      where: "/proposta",
      status: err?.response?.status,
      data: err?.response?.data,
      message: err?.message
    });
    res.status(err?.response?.status || 502).json({
      error: "Falha ao consultar PNCP",
      detail: err?.response?.data || err?.message
    });
  }
});

// GET /api/pncp/publicadas
// Params: modalidade (obrigatório), dataInicial(AAAAMMDD), dataFinal(AAAAMMDD),
//         pagina(1), tamanhoPagina(500), todasPaginas(true)
app.get("/api/pncp/publicadas", async (req, res) => {
  try {
    const modalidade = Number(req.query.modalidade);
    const dataInicial = String(req.query.dataInicial || "");
    const dataFinal = String(req.query.dataFinal || "");
    const pagina = Number(req.query.pagina ?? 1);
    const tamanhoPagina = Math.max(Math.min(Number(req.query.tamanhoPagina ?? 50), 50), 10);
    const todasPaginas = String(req.query.todasPaginas ?? "true") === "true";

    if (!modalidade || !Number.isInteger(modalidade)) {
      return res.status(400).json({ error: "modalidade é obrigatória e deve ser um inteiro" });
    }
    if (!isYYYYMMDD(dataInicial) || !isYYYYMMDD(dataFinal)) {
      return res.status(400).json({ error: "dataInicial e dataFinal devem ser AAAAMMDD" });
    }

    const baseParams = {
      codigoModalidadeContratacao: modalidade,
      dataInicial,
      dataFinal,
      pagina,
      tamanhoPagina,
    };

    const first = await AXIOS.get("/v1/contratacoes/publicacao", { params: baseParams }).then(r => r.data);
    const results = Array.isArray(first?.data) ? [...first.data] : [];
    const totalPaginas = first?.totalPaginas ?? 1;

    if (todasPaginas && pagina === 1 && totalPaginas > 1) {
      for (let p = 2; p <= totalPaginas; p++) {
        try {
          const page = await AXIOS.get("/v1/contratacoes/publicacao", {
            params: { ...baseParams, pagina: p },
          }).then(r => r.data);
          const chunk = Array.isArray(page?.data) ? page.data : [];
          results.push(...chunk);
        } catch (pageError) {
          console.warn(`⚠️ Erro ao buscar página ${p}:`, pageError?.response?.status || pageError?.message);
          // Continua para a próxima página em vez de falhar completamente
        }
      }
    }

    return res.json({
      paginacao: {
        paginaAtual: pagina,
        totalPaginas,
        totalRegistros: first?.totalRegistros ?? results.length,
        tamanhoPagina,
      },
      conteudo: results,
    });
  } catch (err: any) {
    console.error("PNCP ERROR:", {
      where: "/publicacao",
      status: err?.response?.status,
      data: err?.response?.data,
      message: err?.message
    });
    res.status(err?.response?.status || 502).json({
      error: "Falha ao consultar PNCP",
      detail: err?.response?.data || err?.message
    });
  }
});

// --- NOVA ROTA: /api/pncp/recentes ---
// Params:
//   dias (default 3): janela relativa (hoje - dias ... hoje)
//   modalidade (default 6): código obrigatório pra /publicacao
//   limite (default 50): corta o topo depois da ordenação
//   tamanhoPagina (default 500): máximo suportado
app.get("/api/pncp/recentes", async (req, res) => {
  try {
    const dias = Math.max(1, parseInt(String(req.query.dias ?? "3"), 10));
    const modalidade = Number(req.query.modalidade ?? 6);
    const limite = Math.max(1, parseInt(String(req.query.limite ?? "50"), 10));
    const tamanhoPagina = Math.max(Math.min(Number(req.query.tamanhoPagina ?? 50), 50), 10);

    if (!Number.isInteger(modalidade)) {
      return res.status(400).json({ error: "modalidade inválida" });
    }

    // datas AAAAMMDD (API exige esse formato)
    const hoje = new Date();
    const dFinal = `${hoje.getFullYear()}${String(hoje.getMonth()+1).padStart(2,"0")}${String(hoje.getDate()).padStart(2,"0")}`;
    const ini = new Date(hoje);
    ini.setDate(ini.getDate() - dias - 1); // coloco 1 dia de buffer
    const dInicial = `${ini.getFullYear()}${String(ini.getMonth()+1).padStart(2,"0")}${String(ini.getDate()).padStart(2,"0")}`;
    
    console.log('🔍 Recentes - Parâmetros:', { dias, modalidade, limite, tamanhoPagina });
    console.log('🔍 Recentes - Datas:', { dInicial, dFinal });
    console.log('🔍 Recentes - Estratégia: Buscar por período e ordenar no backend por dataInclusao > dataPublicacaoPncp > dataAtualizacao');

    // Busca em múltiplas modalidades para ter mais variedade
    const modalidades = [6, 4, 5, 8, 7, 12]; // Pregão Eletrônico, Concorrência, Dispensa, Pregão Presencial, Credenciamento
    const out: any[] = [];

    for (const modalidade of modalidades) {
      try {
        console.log(`🔍 Buscando modalidade ${modalidade}...`);
        
        const baseParams = {
          codigoModalidadeContratacao: modalidade,
          dataInicial: dInicial,
          dataFinal: dFinal,
          pagina: 1,
          tamanhoPagina,
        };

        const first = await AXIOS.get("/v1/contratacoes/publicacao", { params: baseParams }).then(r => r.data);
        const modalidadeResults = Array.isArray(first?.conteudo) ? [...first.conteudo] : (first?.data || []);
        const totalPaginas = first?.paginacao?.totalPaginas ?? first?.totalPaginas ?? 1;

        // Busca todas as páginas desta modalidade
        for (let p = 2; p <= totalPaginas; p++) {
          const page = await AXIOS.get("/v1/contratacoes/publicacao", {
            params: { ...baseParams, pagina: p },
          }).then(r => r.data);
          const chunk = Array.isArray(page?.conteudo) ? page.conteudo : (page?.data || []);
          modalidadeResults.push(...chunk);
        }

        out.push(...modalidadeResults);
        console.log(`✅ Modalidade ${modalidade}: ${modalidadeResults.length} licitações`);
      } catch (error) {
        console.warn(`⚠️ Erro ao buscar modalidade ${modalidade}:`, error);
      }
    }

    // Remove duplicatas baseado no numeroControlePNCP
    const licitacoesUnicas = out.filter((licitacao, index, self) => 
      index === self.findIndex(l => l.numeroControlePNCP === licitacao.numeroControlePNCP)
    );

    console.log(`📊 Total de licitações encontradas: ${out.length}`);
    console.log(`📊 Licitações únicas após remoção de duplicatas: ${licitacoesUnicas.length}`);

    // ordenar: 1) dataInclusao (mais preciso p/ "adicionadas na plataforma")
    //          2) fallback para dataPublicacaoPncp
    // Conforme manual PNCP: campos 21, 22 e 23 dos "Dados de retorno"
    const toKey = (o: any) => {
      const di = o?.dataInclusao || "";
      const dp = o?.dataPublicacaoPncp || "";
      const da = o?.dataAtualizacao || "";
      
      // normaliza AAAA-MM-DDTHH:mm:ssZ, AAAAMMDD, etc.
      const norm = (s: string) => {
        if (!s) return 0;
        if (/^\d{8}$/.test(s)) return Number(s); // AAAAMMDD -> número comparável
        const t = Date.parse(s);
        return isNaN(t) ? 0 : t;
      };
      
      // Prioridade: dataInclusao > dataPublicacaoPncp > dataAtualizacao
      return [norm(di), norm(dp), norm(da)];
    };

    licitacoesUnicas.sort((a, b) => {
      const [adi, adp, ada] = toKey(a);
      const [bdi, bdp, bda] = toKey(b);
      
      // 1º critério: dataInclusao (mais preciso para "adicionadas na plataforma")
      if (bdi !== adi) return bdi - adi;
      
      // 2º critério: dataPublicacaoPncp (fallback)
      if (bdp !== adp) return bdp - adp;
      
      // 3º critério: dataAtualizacao (último fallback)
      return bda - ada;
    });

    const topo = licitacoesUnicas.slice(0, limite);

    return res.json({
      janela: { de: dInicial, ate: dFinal, dias },
      ordenadoPor: ["dataInclusao", "dataPublicacaoPncp", "dataAtualizacao"],
      totalEncontrado: licitacoesUnicas.length,
      totalRetornado: topo.length,
      conteudo: topo,
    });
  } catch (err: any) {
    console.error("PNCP ERROR /recentes:", err?.response?.status, err?.response?.data || err.message);
    res.status(err?.response?.status || 502).json({ error: "Falha ao consultar PNCP /publicacao", detail: err?.message });
  }
});

// Produção: servir build do Vite
if (process.env.NODE_ENV === 'production') {
  const DIST = join(__dirname, "dist");
  app.use(express.static(DIST));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) return next();
    res.sendFile(join(DIST, "index.html"));
  });
} else {
  // Em desenvolvimento, apenas servir a API
  app.get("/", (req, res) => {
    res.json({ 
      message: "SIL API - Modo Desenvolvimento", 
      endpoints: {
        health: "/api/health",
        recebendoProposta: "/api/pncp/recebendo-proposta",
        publicadas: "/api/pncp/publicadas",
        recentes: "/api/pncp/recentes"
      }
    });
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 SIL rodando em http://localhost:${PORT}`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🔗 API Health: http://localhost:${PORT}/api/health`);
  console.log(`🔗 PNCP Recebendo Proposta: http://localhost:${PORT}/api/pncp/recebendo-proposta`);
  console.log(`🔗 PNCP Publicadas: http://localhost:${PORT}/api/pncp/publicadas`);
  console.log(`🔗 PNCP Recentes: http://localhost:${PORT}/api/pncp/recentes`);
});
