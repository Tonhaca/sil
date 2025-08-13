import axios from 'axios';
import { 
  PNCPResponse, 
  Contratacao, 
  FiltrosContratacao,
  ModalidadeContratacao,
  SituacaoContratacao,
  InstrumentoConvocatorio
} from '../types/pncp';

const BASE_URL = 'https://pncp.gov.br/api/consulta';

// Instância do axios configurada para a API do PNCP
const pncpApi = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para logs de debug
pncpApi.interceptors.request.use(
  (config) => {
    console.log('PNCP API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('PNCP API Request Error:', error);
    return Promise.reject(error);
  }
);

pncpApi.interceptors.response.use(
  (response) => {
    console.log('PNCP API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('PNCP API Response Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export class PNCPService {
  /**
   * Busca contratações por período de publicação
   */
  static async buscarContratacoesPorData(
    dataInicio: string,
    dataFim: string,
    pagina: number = 1,
    tamanhoPagina: number = 20
  ): Promise<PNCPResponse<Contratacao>> {
    try {
      const response = await pncpApi.get('/contratacoes', {
        params: {
          dataInicio,
          dataFim,
          pagina,
          tamanhoPagina,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar contratações por data:', error);
      throw new Error('Falha ao buscar contratações. Tente novamente.');
    }
  }

  /**
   * Busca contratações com período de recebimento de propostas em aberto
   */
  static async buscarContratacoesEmAberto(
    pagina: number = 1,
    tamanhoPagina: number = 20
  ): Promise<PNCPResponse<Contratacao>> {
    try {
      const response = await pncpApi.get('/contratacoes/em-aberto', {
        params: {
          pagina,
          tamanhoPagina,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar contratações em aberto:', error);
      throw new Error('Falha ao buscar contratações em aberto. Tente novamente.');
    }
  }

  /**
   * Busca contratações com filtros avançados
   */
  static async buscarContratacoesComFiltros(
    filtros: FiltrosContratacao
  ): Promise<PNCPResponse<Contratacao>> {
    try {
      const response = await pncpApi.get('/contratacoes/filtros', {
        params: {
          ...filtros,
          pagina: filtros.pagina || 1,
          tamanhoPagina: filtros.tamanhoPagina || 20,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar contratações com filtros:', error);
      throw new Error('Falha ao buscar contratações. Tente novamente.');
    }
  }

  /**
   * Busca contratação por ID específico
   */
  static async buscarContratacaoPorId(idContratacao: string): Promise<Contratacao> {
    try {
      const response = await pncpApi.get(`/contratacoes/${idContratacao}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar contratação por ID:', error);
      throw new Error('Falha ao buscar detalhes da contratação. Tente novamente.');
    }
  }

  /**
   * Busca contratações por termo de pesquisa (busca textual)
   */
  static async buscarContratacoesPorTermo(
    termo: string,
    pagina: number = 1,
    tamanhoPagina: number = 20
  ): Promise<PNCPResponse<Contratacao>> {
    try {
      const response = await pncpApi.get('/contratacoes/busca', {
        params: {
          termo,
          pagina,
          tamanhoPagina,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar contratações por termo:', error);
      throw new Error('Falha ao buscar contratações. Tente novamente.');
    }
  }

  /**
   * Busca modalidades de contratação disponíveis
   */
  static async buscarModalidadesContratacao(): Promise<ModalidadeContratacao[]> {
    try {
      const response = await pncpApi.get('/modalidades-contratacao');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar modalidades:', error);
      // Retorna lista padrão em caso de erro
      return [
        { codigo: 'PREGÃO_ELETRÔNICO', descricao: 'Pregão Eletrônico' },
        { codigo: 'PREGÃO_PRESENCIAL', descricao: 'Pregão Presencial' },
        { codigo: 'CONCORRÊNCIA', descricao: 'Concorrência' },
        { codigo: 'CONCURSO', descricao: 'Concurso' },
        { codigo: 'LEILÃO', descricao: 'Leilão' },
        { codigo: 'CONTRATAÇÃO_DIRETA', descricao: 'Contratação Direta' },
      ];
    }
  }

  /**
   * Busca situações de contratação disponíveis
   */
  static async buscarSituacoesContratacao(): Promise<SituacaoContratacao[]> {
    try {
      const response = await pncpApi.get('/situacoes-contratacao');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar situações:', error);
      // Retorna lista padrão em caso de erro
      return [
        { codigo: 'RECEBENDO_PROPOSITAS', descricao: 'Recebendo Propostas' },
        { codigo: 'EM_ANÁLISE', descricao: 'Em Análise' },
        { codigo: 'HOMOLOGADA', descricao: 'Homologada' },
        { codigo: 'ADJUDICADA', descricao: 'Adjudicada' },
        { codigo: 'SUSPENSA', descricao: 'Suspensa' },
        { codigo: 'REVOGADA', descricao: 'Revogada' },
        { codigo: 'ANULADA', descricao: 'Anulada' },
      ];
    }
  }

  /**
   * Busca instrumentos convocatórios disponíveis
   */
  static async buscarInstrumentosConvocatorios(): Promise<InstrumentoConvocatorio[]> {
    try {
      const response = await pncpApi.get('/instrumentos-convocatorios');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar instrumentos convocatórios:', error);
      // Retorna lista padrão em caso de erro
      return [
        { codigo: 'EDITAL', descricao: 'Edital' },
        { codigo: 'AVISO', descricao: 'Aviso' },
        { codigo: 'CONVITE', descricao: 'Convite' },
        { codigo: 'CARTA_CONVITE', descricao: 'Carta Convite' },
      ];
    }
  }

  /**
   * Busca contratações por item específico (busca semântica)
   */
  static async buscarContratacoesPorItem(
    descricaoItem: string,
    pagina: number = 1,
    tamanhoPagina: number = 20
  ): Promise<PNCPResponse<Contratacao>> {
    try {
      const response = await pncpApi.get('/contratacoes/por-item', {
        params: {
          descricaoItem,
          pagina,
          tamanhoPagina,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar contratações por item:', error);
      throw new Error('Falha ao buscar contratações por item. Tente novamente.');
    }
  }
}

export default PNCPService;
