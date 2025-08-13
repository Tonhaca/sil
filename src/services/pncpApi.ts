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

// Tipos para as respostas da API baseados na estrutura real
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

// Função para mapear dados da API para nosso formato
function mapearContratacao(dados: any): PNCPContratacao {
  return {
    numeroControlePNCP: dados.numeroControlePNCP || '',
    numeroContratacao: dados.numeroCompra || '',
    objetoCompra: dados.objetoCompra || '',
    dataAberturaProposta: dados.dataAberturaProposta || '',
    dataEncerramentoProposta: dados.dataEncerramentoProposta || '',
    modalidadeNome: dados.modalidadeNome || '',
    codigoModalidadeContratacao: dados.modalidadeId || 0,
    valorEstimado: dados.valorTotalEstimado || 0,
    unidadeGestora: {
      codigo: dados.unidadeOrgao?.codigoUnidade || '',
      nome: dados.unidadeOrgao?.nomeUnidade || dados.orgaoEntidade?.razaoSocial || '',
      uf: dados.unidadeOrgao?.ufSigla || '',
      municipio: dados.unidadeOrgao?.municipioNome || ''
    },
    situacaoContratacao: dados.situacaoCompraNome || '',
    instrumentoConvocatorio: dados.tipoInstrumentoConvocatorioNome || '',
    linkEdital: dados.linkSistemaOrigem || '',
    linkSistema: dados.linkProcessoEletronico || ''
  };
}

// Buscar licitações recebendo propostas (em aberto) - SEM filtros
export async function buscarLicitacoesEmAberto(params: {
  pagina?: number;
  tamanhoPagina?: number;
} = {}): Promise<PNCPResponse> {
  const {
    pagina = 1,
    tamanhoPagina = 50 // Mínimo 10, usando 50 para pegar mais resultados
  } = params;

  const dataFinal = formatDate(new Date()); // Data de hoje

  console.log('🔍 Buscando licitações em aberto (sem filtros):', { dataFinal, pagina, tamanhoPagina });

  const response = await pncpApi.get('/v1/contratacoes/proposta', {
    params: {
      dataFinal, // Parâmetro obrigatório
      pagina,
      tamanhoPagina
    }
  });

  console.log('✅ Resposta da API:', response.data);

  // Mapeia os dados para nosso formato
  const conteudo = Array.isArray(response.data.data) 
    ? response.data.data.map(mapearContratacao)
    : [];

  return {
    conteudo,
    paginacao: {
      paginaAtual: response.data.numeroPagina || 1,
      totalPaginas: response.data.totalPaginas || 1,
      totalRegistros: response.data.totalRegistros || 0,
      tamanhoPagina: tamanhoPagina
    }
  };
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
    tamanhoPagina = 50
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

  // Mapeia os dados para nosso formato
  const conteudo = Array.isArray(response.data.data) 
    ? response.data.data.map(mapearContratacao)
    : [];

  return {
    conteudo,
    paginacao: {
      paginaAtual: response.data.numeroPagina || 1,
      totalPaginas: response.data.totalPaginas || 1,
      totalRegistros: response.data.totalRegistros || 0,
      tamanhoPagina: tamanhoPagina
    }
  };
}

// Buscar todas as páginas de uma consulta
export async function buscarTodasPaginas(
  buscaFunction: (pagina: number) => Promise<PNCPResponse>,
  maxPaginas: number = 10 // Aumentado para buscar mais páginas
): Promise<PNCPContratacao[]> {
  const todasContratacoes: PNCPContratacao[] = [];
  let pagina = 1;
  let totalPaginas = 1;

  while (pagina <= totalPaginas && pagina <= maxPaginas) {
    try {
      console.log(`📄 Buscando página ${pagina}...`);
      const response = await buscaFunction(pagina);
      
      if (pagina === 1) {
        totalPaginas = response.paginacao.totalPaginas;
        console.log(`📊 Total de páginas: ${totalPaginas}`);
      }

      todasContratacoes.push(...response.conteudo);
      console.log(`✅ Página ${pagina}: ${response.conteudo.length} licitações`);
      
      pagina++;

      // Pequena pausa para não sobrecarregar a API
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`❌ Erro ao buscar página ${pagina}:`, error);
      break;
    }
  }

  console.log(`🎯 Total de licitações encontradas: ${todasContratacoes.length}`);
  return todasContratacoes;
}

// Buscar licitações que contenham um termo específico
export async function buscarPorTermo(termo: string): Promise<PNCPContratacao[]> {
  console.log(`🔍 Iniciando busca por: "${termo}"`);
  
  try {
    // Busca TODAS as licitações em aberto (sem filtros de modalidade)
    const todasLicitacoes = await buscarTodasPaginas((pagina) => 
      buscarLicitacoesEmAberto({ 
        tamanhoPagina: 100,
        pagina 
      })
    );

    console.log(`📊 Total de licitações antes do filtro: ${todasLicitacoes.length}`);

    // Remove duplicatas baseado no numeroControlePNCP
    const licitacoesUnicas = todasLicitacoes.filter((licitacao, index, self) => 
      index === self.findIndex(l => l.numeroControlePNCP === licitacao.numeroControlePNCP)
    );

    console.log(`📊 Licitações únicas: ${licitacoesUnicas.length}`);

    // Filtra por termo (busca ampla no objeto)
    const filtradas = licitacoesUnicas.filter(contratacao => {
      const termoLower = termo.toLowerCase();
      const objetoLower = contratacao.objetoCompra.toLowerCase();
      const numeroLower = contratacao.numeroContratacao.toLowerCase();
      const orgaoLower = contratacao.unidadeGestora.nome.toLowerCase();
      
      return objetoLower.includes(termoLower) || 
             numeroLower.includes(termoLower) || 
             orgaoLower.includes(termoLower);
    });

    console.log(`🎯 Licitações filtradas por "${termo}": ${filtradas.length}`);

    // Ordena por data mais recente
    const ordenadas = filtradas.sort((a, b) => 
      new Date(b.dataAberturaProposta).getTime() - new Date(a.dataAberturaProposta).getTime()
    );

    return ordenadas;
  } catch (error) {
    console.error('❌ Erro na busca por termo:', error);
    throw error;
  }
}

// Buscar licitações mais recentes (para carregamento inicial)
export async function buscarLicitacoesRecentes(): Promise<PNCPContratacao[]> {
  console.log('🚀 Carregando licitações mais recentes...');
  
  try {
    // Busca as primeiras páginas de licitações em aberto
    const licitacoes = await buscarTodasPaginas((pagina) => 
      buscarLicitacoesEmAberto({ 
        tamanhoPagina: 100,
        pagina 
      }), 5 // Busca 5 páginas para ter um bom volume inicial
    );

    // Remove duplicatas
    const licitacoesUnicas = licitacoes.filter((licitacao, index, self) => 
      index === self.findIndex(l => l.numeroControlePNCP === licitacao.numeroControlePNCP)
    );

    // Ordena por data mais recente
    const ordenadas = licitacoesUnicas.sort((a, b) => 
      new Date(b.dataAberturaProposta).getTime() - new Date(a.dataAberturaProposta).getTime()
    );

    console.log(`🎯 Licitações recentes carregadas: ${ordenadas.length}`);
    return ordenadas;
  } catch (error) {
    console.error('❌ Erro ao carregar licitações recentes:', error);
    throw error;
  }
}

