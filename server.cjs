const express = require("express");
const axios = require("axios");
const cors = require("cors");
const compression = require("compression");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(compression());
app.use(cors({ origin: true }));

const PNCP_BASE = "https://pncp.gov.br/api/consulta";
const AXIOS = axios.create({ baseURL: PNCP_BASE, timeout: 30000, headers: { accept: "*/*" } });

function isYYYYMMDD(v){ return /^[0-9]{8}$/.test(v); }

app.get("/api/health", (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

app.get("/api/pncp/recebendo-proposta", async (req, res) => {
  try {
    const modalidade = Number(req.query.modalidade ?? 6);
    const todasPaginas = String(req.query.todasPaginas ?? "true") === "true";
    const pagina = Number(req.query.pagina ?? 1);
    const tamanhoPagina = Math.min(Number(req.query.tamanhoPagina ?? 50), 50);
    const now = new Date();
    const dataFinal = typeof req.query.dataFinal === "string" && isYYYYMMDD(req.query.dataFinal)
      ? req.query.dataFinal
      : `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,"0")}${String(now.getDate()).padStart(2,"0")}`;

    if (!Number.isInteger(modalidade)) return res.status(400).json({ error: "modalidade inválida" });
    if (!isYYYYMMDD(dataFinal)) return res.status(400).json({ error: "dataFinal deve ser AAAAMMDD" });

    const baseParams = { dataFinal, codigoModalidadeContratacao: modalidade, pagina, tamanhoPagina };

    const first = await AXIOS.get("/v1/contratacoes/proposta", { params: baseParams }).then(r => r.data);
    const list = Array.isArray(first?.conteudo) ? [...first.conteudo] : first?.data || [];
    const totalPaginas = first?.paginacao?.totalPaginas ?? first?.totalPaginas ?? 1;

    if (todasPaginas && pagina === 1 && totalPaginas > 1) {
      for (let p = 2; p <= totalPaginas; p++) {
        const page = await AXIOS.get("/v1/contratacoes/proposta", { params: { ...baseParams, pagina: p } }).then(r => r.data);
        const chunk = Array.isArray(page?.conteudo) ? page.conteudo : page?.data || [];
        list.push(...chunk);
      }
    }

    res.json({
      paginacao: {
        paginaAtual: pagina,
        totalPaginas,
        totalRegistros: first?.paginacao?.totalRegistros ?? first?.totalRegistros ?? list.length,
        tamanhoPagina
      },
      conteudo: list
    });
  } catch (err) {
    console.error("PNCP ERROR /proposta:", err?.response?.status, err?.response?.data || err.message);
    res.status(err?.response?.status || 502).json({ error: "Falha ao consultar PNCP /proposta", detail: err?.message });
  }
});

app.get("/api/pncp/publicadas", async (req, res) => {
  try {
    const modalidade = Number(req.query.modalidade);
    const dataInicial = String(req.query.dataInicial || "");
    const dataFinal = String(req.query.dataFinal || "");
    const pagina = Number(req.query.pagina ?? 1);
    const tamanhoPagina = Math.min(Number(req.query.tamanhoPagina ?? 50), 50);
    const todasPaginas = String(req.query.todasPaginas ?? "true") === "true";

    if (!Number.isInteger(modalidade)) return res.status(400).json({ error: "modalidade obrigatória (int)" });
    if (!isYYYYMMDD(dataInicial) || !isYYYYMMDD(dataFinal)) return res.status(400).json({ error: "datas AAAAMMDD" });

    const baseParams = { codigoModalidadeContratacao: modalidade, dataInicial, dataFinal, pagina, tamanhoPagina };

    const first = await AXIOS.get("/v1/contratacoes/publicacao", { params: baseParams }).then(r => r.data);
    const list = Array.isArray(first?.conteudo) ? [...first.conteudo] : first?.data || [];
    const totalPaginas = first?.paginacao?.totalPaginas ?? first?.totalPaginas ?? 1;

    if (todasPaginas && pagina === 1 && totalPaginas > 1) {
      for (let p = 2; p <= totalPaginas; p++) {
        const page = await AXIOS.get("/v1/contratacoes/publicacao", { params: { ...baseParams, pagina: p } }).then(r => r.data);
        const chunk = Array.isArray(page?.conteudo) ? page.conteudo : page?.data || [];
        list.push(...chunk);
      }
    }

    res.json({
      paginacao: {
        paginaAtual: pagina,
        totalPaginas,
        totalRegistros: first?.paginacao?.totalRegistros ?? first?.totalRegistros ?? list.length,
        tamanhoPagina
      },
      conteudo: list
    });
  } catch (err) {
    console.error("PNCP ERROR /publicacao:", err?.response?.status, err?.response?.data || err.message);
    res.status(err?.response?.status || 502).json({ error: "Falha ao consultar PNCP /publicacao", detail: err?.message });
  }
});

// === estáticos da SPA (depois das rotas /api) ===
const DIST = path.join(__dirname, "dist");
if (fs.existsSync(DIST)) {
  app.use(express.static(DIST));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) return next();
    res.sendFile(path.join(DIST, "index.html"));
  });
} else {
  // fallback útil em dev/ambiente sem build
  app.get("*", (req, res) => res.send(`
    <html><body style="font-family:sans-serif;padding:16px">
      <h2>SIL em execução</h2>
      <p>Build não encontrado (<code>/dist</code>). Rode <code>npm run build</code> e reinicie.</p>
      <ul>
        <li><a href="/api/health">/api/health</a></li>
        <li><a href="/api/pncp/recebendo-proposta?todasPaginas=true&modalidade=6">/api/pncp/recebendo-proposta</a></li>
      </ul>
    </body></html>
  `));
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`SIL rodando em http://localhost:${PORT}`);
});
