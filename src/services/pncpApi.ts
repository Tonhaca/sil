import axios from 'axios';
import { Contratacao, PNCPResponse } from '../types/pncp';

// Cliente Axios para o backend local
const backendApi = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Dados de fallback para quando a API do PNCP está indisponível
const dadosFallback: Contratacao[] = [
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
];

// Função para converter dados da API do PNCP para o formato interno
function converterContratacaoResumo(dados: any): Contratacao {
  return {
    idContratacao: dados.idContratacao || `pncp-${Date.now()}`,
    numeroContratacao: dados.numeroContratacao || 'N/A',
    objetoContratacao: dados.objetoContratacao || 'Objeto não informado',
    dataPublicacao: dados.dataPublicacao || '',
    dataAbertura: dados.dataAbertura || '',
    valorEstimado: dados.valorEstimado || 0,
    unidadeGestora: {
      codigo: dados.unidadeGestora?.codigo || '',
      nome: dados.unidadeGestora?.nome || 'Unidade não informada',
      uf: dados.unidadeGestora?.uf || '',
      municipio: dados.unidadeGestora?.municipio || ''
    },
    modalidadeContratacao: dados.modalidadeContratacao || 'Não informada',
    situacaoContratacao: dados.situacaoContratacao || 'Não informada',
    instrumentoConvocatorio: dados.instrumentoConvocatorio || 'Não informado',
    linkEdital: dados.linkEdital || '',
    linkSistema: dados.linkSistema || ''
  };
}

export class PNCPService {
  // Buscar licitações recebendo propostas
  static async buscarContratacoesEmAberto(
    pagina: number = 1,
    tamanhoPagina: number = 20
  ): Promise<PNCPResponse<Contratacao>> {
    try {
      const response = await backendApi.get('/pncp/recebendo-proposta', {
        params: {
          modalidade: 6,
          pagina,
          tamanhoPagina,
          todasPaginas: false
        }
      });

      if (response.data && response.data.conteudo) {
        const contratacoes = response.data.conteudo.map(converterContratacaoResumo);
        return {
          data: contratacoes,
          paginacao: response.data.paginacao || {
            paginaAtual: pagina,
            totalPaginas: 1,
            totalRegistros: contratacoes.length,
            tamanhoPagina
          }
        };
      } else {
        throw new Error('Resposta inválida da API');
      }
    } catch (error) {
      console.warn('Erro ao buscar licitações em aberto, usando dados de fallback:', error);
      return {
        data: dadosFallback,
        paginacao: {
          paginaAtual: 1,
          totalPaginas: 1,
          totalRegistros: dadosFallback.length,
          tamanhoPagina: dadosFallback.length
        }
      };
    }
  }

  // Buscar licitações publicadas por período
  static async buscarContratacoesPorData(
    dataInicial: string,
    dataFinal: string,
    pagina: number = 1,
    tamanhoPagina: number = 20
  ): Promise<PNCPResponse<Contratacao>> {
    try {
      const response = await backendApi.get('/pncp/publicadas', {
        params: {
          modalidade: 6,
          dataInicial,
          dataFinal,
          pagina,
          tamanhoPagina,
          todasPaginas: false
        }
      });

      if (response.data && response.data.conteudo) {
        const contratacoes = response.data.conteudo.map(converterContratacaoResumo);
        return {
          data: contratacoes,
          paginacao: response.data.paginacao || {
            paginaAtual: pagina,
            totalPaginas: 1,
            totalRegistros: contratacoes.length,
            tamanhoPagina
          }
        };
      } else {
        throw new Error('Resposta inválida da API');
      }
    } catch (error) {
      console.warn('Erro ao buscar licitações por data, usando dados de fallback:', error);
      return {
        data: dadosFallback,
        paginacao: {
          paginaAtual: 1,
          totalPaginas: 1,
          totalRegistros: dadosFallback.length,
          tamanhoPagina: dadosFallback.length
        }
      };
    }
  }

  // Buscar licitações com filtros avançados
  static async buscarContratacoesComFiltros(
    filtros: {
      modalidade?: number;
      uf?: string;
      municipio?: string;
      valorMin?: number;
      valorMax?: number;
      dataInicial?: string;
      dataFinal?: string;
    },
    pagina: number = 1,
    tamanhoPagina: number = 20
  ): Promise<PNCPResponse<Contratacao>> {
    try {
      const params: any = {
        modalidade: filtros.modalidade || 6,
        pagina,
        tamanhoPagina,
        todasPaginas: false
      };

      if (filtros.dataInicial && filtros.dataFinal) {
        params.dataInicial = filtros.dataInicial;
        params.dataFinal = filtros.dataFinal;
      }

      const response = await backendApi.get('/pncp/publicadas', { params });

      if (response.data && response.data.conteudo) {
        let contratacoes = response.data.conteudo.map(converterContratacaoResumo);

                 // Aplicar filtros adicionais no frontend
         if (filtros.uf) {
           contratacoes = contratacoes.filter((c: Contratacao) => c.unidadeGestora.uf === filtros.uf);
         }
         if (filtros.municipio) {
           contratacoes = contratacoes.filter((c: Contratacao) => 
             c.unidadeGestora.municipio.toLowerCase().includes(filtros.municipio!.toLowerCase())
           );
         }
                 if (filtros.valorMin) {
           contratacoes = contratacoes.filter((c: Contratacao) => c.valorEstimado >= filtros.valorMin!);
         }
         if (filtros.valorMax) {
           contratacoes = contratacoes.filter((c: Contratacao) => c.valorEstimado <= filtros.valorMax!);
         }

        return {
          data: contratacoes,
          paginacao: response.data.paginacao || {
            paginaAtual: pagina,
            totalPaginas: 1,
            totalRegistros: contratacoes.length,
            tamanhoPagina
          }
        };
      } else {
        throw new Error('Resposta inválida da API');
      }
    } catch (error) {
      console.warn('Erro ao buscar licitações com filtros, usando dados de fallback:', error);
      return {
        data: dadosFallback,
        paginacao: {
          paginaAtual: 1,
          totalPaginas: 1,
          totalRegistros: dadosFallback.length,
          tamanhoPagina: dadosFallback.length
        }
      };
    }
  }

  // Buscar licitação por ID
  static async buscarContratacaoPorId(id: string): Promise<Contratacao | null> {
    try {
      // Como a API do PNCP não tem endpoint específico por ID, vamos buscar em todas as categorias
      const [emAberto, publicadas] = await Promise.all([
        this.buscarContratacoesEmAberto(1, 500),
        this.buscarContratacoesPorData('20240101', '20241231', 1, 500)
      ]);

      const todasContratacoes = [...emAberto.data, ...publicadas.data];
      return todasContratacoes.find(c => c.idContratacao === id) || null;
    } catch (error) {
      console.warn('Erro ao buscar licitação por ID:', error);
      return dadosFallback.find(c => c.idContratacao === id) || null;
    }
  }

  // Buscar licitações por termo
  static async buscarContratacoesPorTermo(
    termo: string,
    pagina: number = 1,
    tamanhoPagina: number = 20
  ): Promise<PNCPResponse<Contratacao>> {
    try {
      // Buscar em licitações publicadas recentemente
      const hoje = new Date();
      const dataInicial = `${hoje.getFullYear()}0101`;
      const dataFinal = `${hoje.getFullYear()}${String(hoje.getMonth() + 1).padStart(2, '0')}${String(hoje.getDate()).padStart(2, '0')}`;

      const response = await this.buscarContratacoesPorData(dataInicial, dataFinal, 1, 500);
      
      // Filtrar por termo no frontend
      const contratacoesFiltradas = response.data.filter(c =>
        c.objetoContratacao.toLowerCase().includes(termo.toLowerCase()) ||
        c.numeroContratacao.toLowerCase().includes(termo.toLowerCase()) ||
        c.unidadeGestora.nome.toLowerCase().includes(termo.toLowerCase())
      );

      const inicio = (pagina - 1) * tamanhoPagina;
      const fim = inicio + tamanhoPagina;
      const paginadas = contratacoesFiltradas.slice(inicio, fim);

      return {
        data: paginadas,
        paginacao: {
          paginaAtual: pagina,
          totalPaginas: Math.ceil(contratacoesFiltradas.length / tamanhoPagina),
          totalRegistros: contratacoesFiltradas.length,
          tamanhoPagina
        }
      };
    } catch (error) {
      console.warn('Erro ao buscar licitações por termo, usando dados de fallback:', error);
      const contratacoesFiltradas = dadosFallback.filter(c =>
        c.objetoContratacao.toLowerCase().includes(termo.toLowerCase())
      );

      return {
        data: contratacoesFiltradas,
        paginacao: {
          paginaAtual: 1,
          totalPaginas: 1,
          totalRegistros: contratacoesFiltradas.length,
          tamanhoPagina: contratacoesFiltradas.length
        }
      };
    }
  }

  // Buscar licitações por item específico
  static async buscarContratacoesPorItem(
    item: string,
    pagina: number = 1,
    tamanhoPagina: number = 20
  ): Promise<PNCPResponse<Contratacao>> {
    try {
      // Buscar em licitações publicadas recentemente
      const hoje = new Date();
      const dataInicial = `${hoje.getFullYear()}0101`;
      const dataFinal = `${hoje.getFullYear()}${String(hoje.getMonth() + 1).padStart(2, '0')}${String(hoje.getDate()).padStart(2, '0')}`;

      const response = await this.buscarContratacoesPorData(dataInicial, dataFinal, 1, 500);
      
      // Filtrar por item no frontend
      const contratacoesFiltradas = response.data.filter(c =>
        c.objetoContratacao.toLowerCase().includes(item.toLowerCase())
      );

      const inicio = (pagina - 1) * tamanhoPagina;
      const fim = inicio + tamanhoPagina;
      const paginadas = contratacoesFiltradas.slice(inicio, fim);

      return {
        data: paginadas,
        paginacao: {
          paginaAtual: pagina,
          totalPaginas: Math.ceil(contratacoesFiltradas.length / tamanhoPagina),
          totalRegistros: contratacoesFiltradas.length,
          tamanhoPagina
        }
      };
    } catch (error) {
      console.warn('Erro ao buscar licitações por item, usando dados de fallback:', error);
      const contratacoesFiltradas = dadosFallback.filter(c =>
        c.objetoContratacao.toLowerCase().includes(item.toLowerCase())
      );

      return {
        data: contratacoesFiltradas,
        paginacao: {
          paginaAtual: 1,
          totalPaginas: 1,
          totalRegistros: contratacoesFiltradas.length,
          tamanhoPagina: contratacoesFiltradas.length
        }
      };
    }
  }

  // Lista estática de modalidades de contratação
  static buscarModalidadesContratacao(): Array<{ codigo: number; nome: string }> {
    return [
      { codigo: 6, nome: 'Pregão Eletrônico' },
      { codigo: 4, nome: 'Concorrência Eletrônica' },
      { codigo: 5, nome: 'Concorrência Presencial' },
      { codigo: 8, nome: 'Dispensa' },
      { codigo: 9, nome: 'Inexigibilidade' }
    ];
  }

  // Lista estática de situações de contratação
  static buscarSituacoesContratacao(): Array<{ codigo: string; nome: string }> {
    return [
      { codigo: 'recebendo-proposta', nome: 'Recebendo Proposta' },
      { codigo: 'homologada', nome: 'Homologada' },
      { codigo: 'suspensa', nome: 'Suspensa' },
      { codigo: 'revogada', nome: 'Revogada' },
      { codigo: 'anulada', nome: 'Anulada' }
    ];
  }

  // Lista estática de instrumentos convocatórios
  static buscarInstrumentosConvocatorios(): Array<{ codigo: string; nome: string }> {
    return [
      { codigo: 'edital', nome: 'Edital' },
      { codigo: 'aviso', nome: 'Aviso' },
      { codigo: 'convocacao', nome: 'Convocação' }
    ];
  }
}

