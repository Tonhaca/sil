// src/services/pncpApi.ts
import axios from "axios";

const api = axios.create({ baseURL: "/api" });

// Licitações com recebimento de proposta em aberto
export async function getRecebendoProposta(params: {
  modalidade?: number;          // default 6
  dataFinal?: string;           // AAAAMMDD; default hoje
  pagina?: number;              // default 1
  tamanhoPagina?: number;       // default 500
  todasPaginas?: boolean;       // default true
} = {}) {
  const { data } = await api.get("/pncp/recebendo-proposta", { params });
  return data;
}

// Licitações publicadas em período
export async function getPublicadas(params: {
  modalidade: number;           // obrigatório
  dataInicial: string;          // AAAAMMDD
  dataFinal: string;            // AAAAMMDD
  pagina?: number;
  tamanhoPagina?: number;
  todasPaginas?: boolean;       // default true
}) {
  const { data } = await api.get("/pncp/publicadas", { params });
  return data;
}

// Dados de fallback para quando a API do PNCP está indisponível
const dadosFallback = {
  paginacao: {
    paginaAtual: 1,
    totalPaginas: 1,
    totalRegistros: 3,
    tamanhoPagina: 3
  },
  conteudo: [
    {
      idContratacao: 'fallback-1',
      numeroContratacao: '001/2024',
      objetoContratacao: 'Aquisição de equipamentos de informática para secretaria municipal',
      dataPublicacao: '20240813',
      dataAbertura: '20240820',
      valorEstimado: 150000.00,
      unidadeGestora: {
        codigo: '123456',
        nome: 'Prefeitura Municipal de São Paulo',
        uf: 'SP',
        municipio: 'São Paulo'
      },
      modalidadeContratacao: 'Pregão Eletrônico',
      situacaoContratacao: 'Recebendo Proposta',
      instrumentoConvocatorio: 'Edital',
      linkEdital: 'https://exemplo.com/edital1',
      linkSistema: 'https://exemplo.com/sistema1'
    },
    {
      idContratacao: 'fallback-2',
      numeroContratacao: '002/2024',
      objetoContratacao: 'Serviços de limpeza e conservação de prédios públicos',
      dataPublicacao: '20240810',
      dataAbertura: '20240825',
      valorEstimado: 85000.00,
      unidadeGestora: {
        codigo: '789012',
        nome: 'Secretaria de Administração do Estado',
        uf: 'RJ',
        municipio: 'Rio de Janeiro'
      },
      modalidadeContratacao: 'Concorrência',
      situacaoContratacao: 'Recebendo Proposta',
      instrumentoConvocatorio: 'Edital',
      linkEdital: 'https://exemplo.com/edital2',
      linkSistema: 'https://exemplo.com/sistema2'
    },
    {
      idContratacao: 'fallback-3',
      numeroContratacao: '003/2024',
      objetoContratacao: 'Fornecimento de material de escritório para órgãos federais',
      dataPublicacao: '20240808',
      dataAbertura: '20240822',
      valorEstimado: 45000.00,
      unidadeGestora: {
        codigo: '345678',
        nome: 'Ministério da Economia',
        uf: 'DF',
        municipio: 'Brasília'
      },
      modalidadeContratacao: 'Pregão Eletrônico',
      situacaoContratacao: 'Recebendo Proposta',
      instrumentoConvocatorio: 'Edital',
      linkEdital: 'https://exemplo.com/edital3',
      linkSistema: 'https://exemplo.com/sistema3'
    }
  ]
};

// Versões com fallback para compatibilidade
export async function getRecebendoPropostaComFallback(params = {}) {
  try {
    return await getRecebendoProposta(params);
  } catch (error) {
    console.warn('Erro ao buscar licitações em aberto, usando dados de fallback:', error);
    return dadosFallback;
  }
}

export async function getPublicadasComFallback(params: {
  modalidade: number;
  dataInicial: string;
  dataFinal: string;
  pagina?: number;
  tamanhoPagina?: number;
  todasPaginas?: boolean;
}) {
  try {
    return await getPublicadas(params);
  } catch (error) {
    console.warn('Erro ao buscar licitações publicadas, usando dados de fallback:', error);
    return dadosFallback;
  }
}

// Listas estáticas para compatibilidade
export const modalidadesContratacao = [
  { codigo: 6, nome: 'Pregão Eletrônico' },
  { codigo: 4, nome: 'Concorrência Eletrônica' },
  { codigo: 5, nome: 'Concorrência Presencial' },
  { codigo: 8, nome: 'Dispensa' },
  { codigo: 9, nome: 'Inexigibilidade' }
];

export const situacoesContratacao = [
  { codigo: 'recebendo-proposta', nome: 'Recebendo Proposta' },
  { codigo: 'homologada', nome: 'Homologada' },
  { codigo: 'suspensa', nome: 'Suspensa' },
  { codigo: 'revogada', nome: 'Revogada' },
  { codigo: 'anulada', nome: 'Anulada' }
];

export const instrumentosConvocatorios = [
  { codigo: 'edital', nome: 'Edital' },
  { codigo: 'aviso', nome: 'Aviso' },
  { codigo: 'convocacao', nome: 'Convocação' }
];

