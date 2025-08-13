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
  headers: { accept: "*/*" },
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
    const tamanhoPagina = Math.max(Math.min(Number(req.query.tamanhoPagina ?? 500), 500), 10);

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
    console.error("ERRO /recebendo-proposta:", err?.response?.status, err?.response?.data || err.message);
    const status = err?.response?.status || 502;
    return res.status(status).json({ error: "Falha ao consultar PNCP /proposta", detail: err?.message });
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
    const tamanhoPagina = Math.max(Math.min(Number(req.query.tamanhoPagina ?? 500), 500), 10);
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
    console.error("ERRO /publicadas:", err?.response?.status, err?.response?.data || err.message);
    const status = err?.response?.status || 502;
    return res.status(status).json({ error: "Falha ao consultar PNCP /publicacao", detail: err?.message });
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
        publicadas: "/api/pncp/publicadas"
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
});
