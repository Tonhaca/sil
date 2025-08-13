import axios from "axios";
import { RespostaContratacoes } from "../types/pncpApi";

export const PNCP_BASE = "https://pncp.gov.br/api/consulta";

export const pncp = axios.create({
  baseURL: PNCP_BASE,
  timeout: 30000,
  headers: { accept: "*/*" },
});

// Interceptors para logging
pncp.interceptors.request.use(
  (config) => {
    console.log(`🔍 PNCP API Request: ${config.method?.toUpperCase()} ${config.url}`, config.params);
    return config;
  },
  (error) => {
    console.error('❌ PNCP API Request Error:', error);
    return Promise.reject(error);
  }
);

pncp.interceptors.response.use(
  (response) => {
    console.log(`✅ PNCP API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ PNCP API Response Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// GET /v1/contratacoes/proposta
export async function getContratacoesPropostaRaw(params: {
  dataFinal: string;                   // AAAAMMDD
  codigoModalidadeContratacao: number; // obrigatório
  pagina?: number;
  tamanhoPagina?: number;
}): Promise<RespostaContratacoes> {
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
}): Promise<RespostaContratacoes> {
  const { data } = await pncp.get("/v1/contratacoes/publicacao", { params });
  return data;
}
