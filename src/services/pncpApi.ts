// src/services/pncpApi.ts
import axios from 'axios';

const PNCP_BASE = 'https://pncp.gov.br/api/consulta';

// Configuração do axios para PNCP
const pncpApi = axios.create({
  baseURL: PNCP_BASE,
  timeout: 30000,
  headers: {
    'accept': '*/*'
  }
});

// Função para formatar data para AAAAMMDD
function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10).replace(/-/g, '');
}

// Tipos para as respostas da API
export interface PNCPContratacao {
  numeroControlePNCP: string;
  numeroContratacao: string;
  objetoCompra: string;
  dataAberturaProposta: string;
  dataEncerramentoProposta: string;
  modalidadeNome: string;
  codigoModalidadeContratacao: number;
  valorEstimado: number;
  unidadeGestora: {
    codigo: string;
    nome: string;
    uf: string;
    municipio: string;
  };
  situacaoContratacao: string;
  instrumentoConvocatorio: string;
  linkEdital?: string;
  linkSistema?: string;
}

export interface PNCPResponse {
  conteudo: PNCPContratacao[];
  paginacao: {
    paginaAtual: number;
    totalPaginas: number;
    totalRegistros: number;
    tamanhoPagina: number;
  };
}

// Buscar licitações recebendo propostas (em aberto)
export async function buscarLicitacoesEmAberto(params: {
  modalidade?: number;
  dataFinal?: string;
  pagina?: number;
  tamanhoPagina?: number;
} = {}): Promise<PNCPResponse> {
  const {
    modalidade = 6, // Pregão Eletrônico por padrão
    dataFinal = formatDate(new Date()),
    pagina = 1,
    tamanhoPagina = 500
  } = params;

  const response = await pncpApi.get('/v1/contratacoes/proposta', {
    params: {
      dataFinal,
      codigoModalidadeContratacao: modalidade,
      pagina,
      tamanhoPagina
    }
  });

  return response.data;
}

// Buscar licitações publicadas em período
export async function buscarLicitacoesPublicadas(params: {
  modalidade: number;
  dataInicial: string;
  dataFinal: string;
  pagina?: number;
  tamanhoPagina?: number;
}): Promise<PNCPResponse> {
  const {
    modalidade,
    dataInicial,
    dataFinal,
    pagina = 1,
    tamanhoPagina = 500
  } = params;

  const response = await pncpApi.get('/v1/contratacoes/publicacao', {
    params: {
      codigoModalidadeContratacao: modalidade,
      dataInicial,
      dataFinal,
      pagina,
      tamanhoPagina
    }
  });

  return response.data;
}

// Buscar todas as páginas de uma consulta
export async function buscarTodasPaginas(
  buscaFunction: () => Promise<PNCPResponse>,
  maxPaginas: number = 10
): Promise<PNCPContratacao[]> {
  const todasContratacoes: PNCPContratacao[] = [];
  let pagina = 1;
  let totalPaginas = 1;

  while (pagina <= totalPaginas && pagina <= maxPaginas) {
    try {
      const response = await buscaFunction();
      
      if (pagina === 1) {
        totalPaginas = response.paginacao.totalPaginas;
      }

      todasContratacoes.push(...response.conteudo);
      pagina++;

      // Pequena pausa para não sobrecarregar a API
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Erro ao buscar página ${pagina}:`, error);
      break;
    }
  }

  return todasContratacoes;
}

// Buscar licitações que contenham um termo específico
export async function buscarPorTermo(termo: string): Promise<PNCPContratacao[]> {
  // Primeiro busca licitações em aberto
  const emAberto = await buscarTodasPaginas(() => 
    buscarLicitacoesEmAberto({ tamanhoPagina: 500 })
  );

  // Filtra por termo (busca ampla no objeto)
  const filtradas = emAberto.filter(contratacao => 
    contratacao.objetoCompra.toLowerCase().includes(termo.toLowerCase()) ||
    contratacao.numeroContratacao.toLowerCase().includes(termo.toLowerCase()) ||
    contratacao.unidadeGestora.nome.toLowerCase().includes(termo.toLowerCase())
  );

  // Ordena por data mais recente
  return filtradas.sort((a, b) => 
    new Date(b.dataAberturaProposta).getTime() - new Date(a.dataAberturaProposta).getTime()
  );
}

