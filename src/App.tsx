import React, { useEffect, useState } from "react";
import axios from "axios";

type Health = { ok: boolean; ts: string };

export default function App() {
  const [health, setHealth] = useState<Health | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    axios.get("/api/health")
      .then(r => setHealth(r.data))
      .catch(e => {
        console.error(e);
        setErr(e?.response?.data?.error || e.message);
      });
  }, []);

  return (
    <div className="min-h-screen p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">SIL — Sistema Inteligente de Licitações</h1>
        <p className="text-sm text-gray-500">
          Front online • ping backend /api/health
        </p>
      </header>

      {err && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded mb-4">
          Erro ao conectar API: {err}
        </div>
      )}

      {health ? (
        <div className="p-3 bg-green-50 border border-green-200 rounded">
          <div>Backend OK: {String(health.ok)}</div>
          <div>Timestamp: {health.ts}</div>
        </div>
      ) : !err ? (
        <div>Carregando…</div>
      ) : null}

      <section className="mt-6">
        <a className="underline" href="/api/pncp/recebendo-proposta?todasPaginas=true&modalidade=6" target="_blank">
          Testar /api/pncp/recebendo-proposta
        </a>
        {" • "}
        <a className="underline" href="/api/pncp/publicadas?modalidade=6&dataInicial=20250801&dataFinal=20250813&todasPaginas=true" target="_blank">
          Testar /api/pncp/publicadas
        </a>
      </section>
    </div>
  );
}
