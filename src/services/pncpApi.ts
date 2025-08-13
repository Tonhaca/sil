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
  dataPublicacaoPncp: string; // Data de divulgação no PNCP
  dataInclusao: string; // Data quando foi adicionada ao PNCP
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
    dataPublicacaoPncp: dados.dataPublicacaoPncp || '', // Data de divulgação no PNCP
    dataInclusao: dados.dataInclusao || '', // Data quando foi adicionada ao PNCP
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

  // Usa uma data bem futura para pegar todas as licitações em aberto
  const dataFinal = '20301231'; // 31/12/2030

  console.log('🔍 Buscando licitações em aberto (sem filtros):', { dataFinal, pagina, tamanhoPagina });

  const response = await pncpApi.get('/v1/contratacoes/proposta', {
    params: {
      dataFinal, // Data futura para pegar todas as licitações em aberto
      pagina,
      tamanhoPagina
    }
  });

  console.log('✅ Resposta da API:', response.data);

  // Mapeia os dados para nosso formato
  const conteudo = Array.isArray(response.data.data) 
    ? response.data.data.map(mapearContratacao)
    : [];

  // Ordena por data de inclusão no PNCP (mais recentes primeiro)
  const ordenadas = conteudo.sort((a: PNCPContratacao, b: PNCPContratacao) => 
    new Date(b.dataInclusao).getTime() - new Date(a.dataInclusao).getTime()
  );

  return {
    conteudo: ordenadas,
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
        tamanhoPagina: 50,
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

    // Ordena por data de inclusão no PNCP (mais recentes primeiro)
    const ordenadas = filtradas.sort((a: PNCPContratacao, b: PNCPContratacao) => 
      new Date(b.dataInclusao).getTime() - new Date(a.dataInclusao).getTime()
    );

    return ordenadas;
  } catch (error) {
    console.error('❌ Erro na busca por termo:', error);
    throw error;
  }
}

// Buscar licitações mais recentemente adicionadas ao PNCP
export async function buscarLicitacoesRecentes(): Promise<PNCPContratacao[]> {
  console.log('🚀 Carregando licitações mais recentemente adicionadas ao PNCP...');
  
  try {
    // Busca licitações publicadas nos últimos 7 dias para pegar as mais recentes
    const dataFinal = formatDate(new Date());
    const dataInicial = formatDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)); // 7 dias atrás
    
    console.log('📅 Buscando licitações publicadas entre:', { dataInicial, dataFinal });

    // Busca em múltiplas modalidades para ter mais variedade
    const modalidades = [6, 4, 5, 8, 7, 12]; // Pregão Eletrônico, Concorrência, Dispensa, Pregão Presencial, Credenciamento
    const todasLicitacoes: PNCPContratacao[] = [];

    for (const modalidade of modalidades) {
      try {
        const response = await pncpApi.get('/v1/contratacoes/publicacao', {
          params: {
            dataInicial,
            dataFinal,
            codigoModalidadeContratacao: modalidade,
            pagina: 1,
            tamanhoPagina: 50
          }
        });

        if (Array.isArray(response.data.data)) {
          const licitacoes = response.data.data.map(mapearContratacao);
          todasLicitacoes.push(...licitacoes);
          console.log(`✅ Modalidade ${modalidade}: ${licitacoes.length} licitações`);
        }
      } catch (error) {
        console.warn(`⚠️ Erro ao buscar modalidade ${modalidade}:`, error);
      }
    }

    // Remove duplicatas baseado no numeroControlePNCP
    const licitacoesUnicas = todasLicitacoes.filter((licitacao, index, self) => 
      index === self.findIndex(l => l.numeroControlePNCP === licitacao.numeroControlePNCP)
    );

    // Ordena por data de inclusão (mais recentes primeiro)
    const ordenadas = licitacoesUnicas.sort((a: PNCPContratacao, b: PNCPContratacao) => 
      new Date(b.dataInclusao).getTime() - new Date(a.dataInclusao).getTime()
    );

    console.log(`🎯 Licitações mais recentes carregadas: ${ordenadas.length}`);
    return ordenadas;
  } catch (error) {
    console.error('❌ Erro ao carregar licitações recentes:', error);
    throw error;
  }
}