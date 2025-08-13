import axios from 'axios';
import { 
  PNCPResponse, 
  Contratacao, 
  FiltrosContratacao,
  ModalidadeContratacao,
  SituacaoContratacao,
  InstrumentoConvocatorio
} from '../types/pncp';

import { ContratacaoResumo } from '../types/pncpApi';
import { formatDateToISO } from '../utils/date';

// Cliente para nosso backend
const backendApi = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Dados de fallback para quando a API estiver indisponível
const dadosFallback = {
  contratacoes: [
    {
      idContratacao: 'fallback-001',
      numeroContratacao: '001/2025',
      objetoContratacao: 'Aquisição de equipamentos de informática para órgãos públicos',
      numeroProcesso: '001/2025',
      dataPublicacaoPncp: '2025-08-13T00:00:00.000Z',
      dataAberturaProposta: '2025-08-20T10:00:00.000Z',
      dataEncerramentoProposta: '2025-08-25T18:00:00.000Z',
      dataHomologacao: '',
      dataAdjudicacao: '',
      dataAssinatura: '',
      dataVigenciaInicio: '',
      dataVigenciaFim: '',
      valorEstimado: 50000.00,
      valorHomologado: 0,
      valorAdjudicado: 0,
      valorContrato: 0,
      modalidadeContratacao: 'PREGÃO_ELETRÔNICO',
      instrumentoConvocatorio: 'EDITAL',
      modoDisputa: 'MENOR_PRECO',
      criterioJulgamento: 'MENOR_PRECO',
      situacaoContratacao: 'RECEBENDO_PROPOSITAS',
      tipoContrato: 'SERVIÇO',
      tipoTermoContrato: 'CONTRATO',
      categoriaProcesso: 'SERVIÇO',
      naturezaJuridica: 'ADMINISTRATIVA',
      amparoLegal: 'LEI_14133_2021',
      orgaoEntidade: {
        cnpj: '00000000000000',
        nome: 'Órgão Público Federal',
        uf: 'DF',
        municipio: 'Brasília'
      },
      itensContratacao: [
        {
          idItemContratacao: 'item-fallback-001',
          numeroItem: 1,
          descricaoItem: 'Computadores desktop com especificações técnicas conforme edital',
          quantidade: 50,
          unidadeFornecimento: 'UN',
          valorUnitario: 1000.00,
          valorTotal: 50000.00,
          situacaoItem: 'ATIVO',
          classificacaoSuperior: 'MATERIAL',
          classificacaoDetalhada: 'EQUIPAMENTOS',
          categoriaItem: 'MATERIAL',
          codigoMaterial: '',
          codigoServico: '',
          especificacaoTecnica: 'Computadores com processador Intel i5, 8GB RAM, SSD 256GB',
          criterioJulgamento: 'MENOR_PRECO'
        }
      ],
      documentos: [
        {
          idDocumento: 'doc-fallback-001',
          nomeDocumento: 'Edital de Licitação',
          tipoDocumento: 'EDITAL',
          urlDocumento: 'https://pncp.gov.br',
          dataPublicacao: '2025-08-13T00:00:00.000Z'
        }
      ]
    },
    {
      idContratacao: 'fallback-002',
      numeroContratacao: '002/2025',
      objetoContratacao: 'Contratação de serviços de limpeza e conservação',
      numeroProcesso: '002/2025',
      dataPublicacaoPncp: '2025-08-12T00:00:00.000Z',
      dataAberturaProposta: '2025-08-19T10:00:00.000Z',
      dataEncerramentoProposta: '2025-08-24T18:00:00.000Z',
      dataHomologacao: '',
      dataAdjudicacao: '',
      dataAssinatura: '',
      dataVigenciaInicio: '',
      dataVigenciaFim: '',
      valorEstimado: 25000.00,
      valorHomologado: 0,
      valorAdjudicado: 0,
      valorContrato: 0,
      modalidadeContratacao: 'PREGÃO_ELETRÔNICO',
      instrumentoConvocatorio: 'EDITAL',
      modoDisputa: 'MENOR_PRECO',
      criterioJulgamento: 'MENOR_PRECO',
      situacaoContratacao: 'RECEBENDO_PROPOSITAS',
      tipoContrato: 'SERVIÇO',
      tipoTermoContrato: 'CONTRATO',
      categoriaProcesso: 'SERVIÇO',
      naturezaJuridica: 'ADMINISTRATIVA',
      amparoLegal: 'LEI_14133_2021',
      orgaoEntidade: {
        cnpj: '00000000000000',
        nome: 'Órgão Público Estadual',
        uf: 'SP',
        municipio: 'São Paulo'
      },
      itensContratacao: [
        {
          idItemContratacao: 'item-fallback-002',
          numeroItem: 1,
          descricaoItem: 'Serviços de limpeza e conservação de prédios públicos',
          quantidade: 12,
          unidadeFornecimento: 'MES',
          valorUnitario: 2083.33,
          valorTotal: 25000.00,
          situacaoItem: 'ATIVO',
          classificacaoSuperior: 'SERVIÇO',
          classificacaoDetalhada: 'SERVIÇOS_GERAIS',
          categoriaItem: 'SERVIÇO',
          codigoMaterial: '',
          codigoServico: '',
          especificacaoTecnica: 'Serviços de limpeza e conservação conforme especificações do edital',
          criterioJulgamento: 'MENOR_PRECO'
        }
      ],
      documentos: [
        {
          idDocumento: 'doc-fallback-002',
          nomeDocumento: 'Edital de Licitação',
          tipoDocumento: 'EDITAL',
          urlDocumento: 'https://pncp.gov.br',
          dataPublicacao: '2025-08-12T00:00:00.000Z'
        }
      ]
    }
  ]
};

export class PNCPService {
  /**
   * Converte dados da API para o formato da aplicação
   */
  private static converterContratacaoResumo(resumo: ContratacaoResumo): Contratacao {
    return {
      idContratacao: resumo.numeroControlePNCP,
      numeroContratacao: resumo.numeroCompra || resumo.numeroControlePNCP,
      objetoContratacao: resumo.objetoCompra || 'Objeto não especificado',
      numeroProcesso: resumo.processo || resumo.numeroControlePNCP,
      dataPublicacaoPncp: formatDateToISO(resumo.dataPublicacaoPncp || ''),
      dataAberturaProposta: formatDateToISO(resumo.dataAberturaProposta || ''),
      dataEncerramentoProposta: formatDateToISO(resumo.dataEncerramentoProposta || ''),
      dataHomologacao: '',
      dataAdjudicacao: '',
      dataAssinatura: '',
      dataVigenciaInicio: '',
      dataVigenciaFim: '',
      valorEstimado: resumo.valorTotalEstimado || 0,
      valorHomologado: 0,
      valorAdjudicado: 0,
      valorContrato: 0,
      modalidadeContratacao: resumo.modalidadeNome || `Modalidade ${resumo.modalidadeId}`,
      instrumentoConvocatorio: 'EDITAL',
      modoDisputa: 'MENOR_PRECO',
      criterioJulgamento: 'MENOR_PRECO',
      situacaoContratacao: 'RECEBENDO_PROPOSITAS',
      tipoContrato: 'SERVIÇO',
      tipoTermoContrato: 'CONTRATO',
      categoriaProcesso: 'SERVIÇO',
      naturezaJuridica: 'ADMINISTRATIVA',
      amparoLegal: 'LEI_14133_2021',
      orgaoEntidade: {
        cnpj: resumo.orgaoEntidade?.cnpj || '00000000000000',
        nome: resumo.orgaoEntidade?.razaoSocial || resumo.orgaoEntidade?.nome || 'Órgão não especificado',
        uf: resumo.orgaoEntidade?.uf || 'BR',
        municipio: 'Não especificado'
      },
      itensContratacao: [
        {
          idItemContratacao: `item-${resumo.numeroControlePNCP}`,
          numeroItem: 1,
          descricaoItem: resumo.objetoCompra || 'Item não especificado',
          quantidade: 1,
          unidadeFornecimento: 'UN',
          valorUnitario: resumo.valorTotalEstimado || 0,
          valorTotal: resumo.valorTotalEstimado || 0,
          situacaoItem: 'ATIVO',
          classificacaoSuperior: 'MATERIAL',
          classificacaoDetalhada: 'EQUIPAMENTOS',
          categoriaItem: 'MATERIAL',
          codigoMaterial: '',
          codigoServico: '',
          especificacaoTecnica: resumo.informacaoComplementar || 'Especificação não disponível',
          criterioJulgamento: 'MENOR_PRECO'
        }
      ],
      documentos: [
        {
          idDocumento: `doc-${resumo.numeroControlePNCP}`,
          nomeDocumento: 'Edital de Licitação',
          tipoDocumento: 'EDITAL',
          urlDocumento: resumo.linkSistemaOrigem || `https://pncp.gov.br/app/editais?numeroControlePNCP=${resumo.numeroControlePNCP}`,
          dataPublicacao: formatDateToISO(resumo.dataPublicacaoPncp || '')
        }
      ]
    };
  }

  /**
   * Busca contratações com período de recebimento de propostas em aberto
   */
  static async buscarContratacoesEmAberto(
    pagina: number = 1,
    tamanhoPagina: number = 20
  ): Promise<PNCPResponse<Contratacao>> {
    try {
      console.log(`🔍 Buscando licitações em aberto via backend`);
      
      const response = await backendApi.get('/pncp/recebendo-proposta', {
        params: {
          modalidade: 6, // Pregão Eletrônico
          pagina,
          tamanhoPagina,
          todasPaginas: false
        }
      });

      if (response.data.success) {
        const contratacoes = response.data.data.conteudo.map((resumo: ContratacaoResumo) => 
          this.converterContratacaoResumo(resumo)
        );

        console.log(`✅ Backend retornou ${contratacoes.length} licitações em aberto`);
        
        return {
          data: contratacoes,
          totalRegistros: response.data.data.paginacao.totalRegistros,
          totalPaginas: response.data.data.paginacao.totalPaginas,
          paginaAtual: response.data.data.paginacao.paginaAtual,
          tamanhoPagina: response.data.data.paginacao.tamanhoPagina
        };
      } else {
        throw new Error(response.data.error || 'Erro no backend');
      }
    } catch (error) {
      console.error('❌ Erro no backend para licitações em aberto:', error);
      console.log('🔄 Usando dados de fallback devido a erro no backend');
      
      return {
        data: dadosFallback.contratacoes,
        totalRegistros: dadosFallback.contratacoes.length,
        totalPaginas: 1,
        paginaAtual: 1,
        tamanhoPagina: dadosFallback.contratacoes.length
      };
    }
  }

  /**
   * Busca contratações por termo de pesquisa
   */
  static async buscarContratacoesPorTermo(
    termo: string,
    pagina: number = 1,
    tamanhoPagina: number = 20
  ): Promise<PNCPResponse<Contratacao>> {
    try {
      console.log(`🔍 Buscando por termo via backend: "${termo}"`);
      
      // Buscar licitações em aberto e filtrar pelo termo
      const response = await backendApi.get('/pncp/recebendo-proposta', {
        params: {
          modalidade: 6,
          pagina,
          tamanhoPagina: 500, // Buscar mais dados para ter mais chances de encontrar
          todasPaginas: false
        }
      });

      if (response.data.success) {
        // Filtrar resultados que contenham o termo buscado
        const resultadosFiltrados = response.data.data.conteudo.filter((item: ContratacaoResumo) => 
          item.objetoCompra?.toLowerCase().includes(termo.toLowerCase()) ||
          item.informacaoComplementar?.toLowerCase().includes(termo.toLowerCase()) ||
          item.orgaoEntidade?.razaoSocial?.toLowerCase().includes(termo.toLowerCase())
        );

        const contratacoes = resultadosFiltrados.map((resumo: ContratacaoResumo) => 
          this.converterContratacaoResumo(resumo)
        );

        console.log(`✅ Backend retornou ${contratacoes.length} licitações para: "${termo}"`);
        
        return {
          data: contratacoes,
          totalRegistros: contratacoes.length,
          totalPaginas: 1,
          paginaAtual: pagina,
          tamanhoPagina: tamanhoPagina
        };
      } else {
        throw new Error(response.data.error || 'Erro no backend');
      }
    } catch (error) {
      console.error('❌ Erro no backend para termo:', error);
      console.log('🔄 Usando dados de fallback devido a erro no backend');
      
      // Filtrar dados de fallback baseado no termo
      const contratacoesFiltradas = dadosFallback.contratacoes.filter(contratacao =>
        contratacao.objetoContratacao.toLowerCase().includes(termo.toLowerCase()) ||
        contratacao.orgaoEntidade.nome.toLowerCase().includes(termo.toLowerCase())
      );
      
      return {
        data: contratacoesFiltradas,
        totalRegistros: contratacoesFiltradas.length,
        totalPaginas: 1,
        paginaAtual: pagina,
        tamanhoPagina: tamanhoPagina
      };
    }
  }

  /**
   * Busca contratações por item específico
   */
  static async buscarContratacoesPorItem(
    descricaoItem: string,
    pagina: number = 1,
    tamanhoPagina: number = 20
  ): Promise<PNCPResponse<Contratacao>> {
    try {
      console.log(`🔍 Buscando por item via backend: "${descricaoItem}"`);
      
      // Buscar licitações em aberto e filtrar pelo item
      const response = await backendApi.get('/pncp/recebendo-proposta', {
        params: {
          modalidade: 6,
          pagina,
          tamanhoPagina: 500,
          todasPaginas: false
        }
      });

      if (response.data.success) {
        // Filtrar resultados que contenham o item buscado
        const resultadosFiltrados = response.data.data.conteudo.filter((item: ContratacaoResumo) => 
          item.objetoCompra?.toLowerCase().includes(descricaoItem.toLowerCase()) ||
          item.informacaoComplementar?.toLowerCase().includes(descricaoItem.toLowerCase())
        );

        const contratacoes = resultadosFiltrados.map((resumo: ContratacaoResumo) => 
          this.converterContratacaoResumo(resumo)
        );

        console.log(`✅ Backend retornou ${contratacoes.length} licitações para item: "${descricaoItem}"`);
        
        return {
          data: contratacoes,
          totalRegistros: contratacoes.length,
          totalPaginas: 1,
          paginaAtual: pagina,
          tamanhoPagina: tamanhoPagina
        };
      } else {
        throw new Error(response.data.error || 'Erro no backend');
      }
    } catch (error) {
      console.error('❌ Erro no backend para item:', error);
      console.log('🔄 Usando dados de fallback devido a erro no backend');
      
      // Filtrar dados de fallback baseado no item
      const contratacoesFiltradas = dadosFallback.contratacoes.filter(contratacao =>
        contratacao.itensContratacao.some(item =>
          item.descricaoItem.toLowerCase().includes(descricaoItem.toLowerCase())
        )
      );
      
      return {
        data: contratacoesFiltradas,
        totalRegistros: contratacoesFiltradas.length,
        totalPaginas: 1,
        paginaAtual: pagina,
        tamanhoPagina: tamanhoPagina
      };
    }
  }

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
      console.log(`🔍 Buscando por data via backend: ${dataInicio} a ${dataFim}`);
      
      const response = await backendApi.get('/pncp/publicadas', {
        params: {
          modalidade: 6,
          dataInicial: dataInicio.replace(/-/g, ''),
          dataFinal: dataFim.replace(/-/g, ''),
          pagina,
          tamanhoPagina,
          todasPaginas: false
        }
      });

      if (response.data.success) {
        const contratacoes = response.data.data.conteudo.map((resumo: ContratacaoResumo) => 
          this.converterContratacaoResumo(resumo)
        );

        console.log(`✅ Backend retornou ${contratacoes.length} licitações para o período`);
        
        return {
          data: contratacoes,
          totalRegistros: response.data.data.paginacao.totalRegistros,
          totalPaginas: response.data.data.paginacao.totalPaginas,
          paginaAtual: response.data.data.paginacao.paginaAtual,
          tamanhoPagina: response.data.data.paginacao.tamanhoPagina
        };
      } else {
        throw new Error(response.data.error || 'Erro no backend');
      }
    } catch (error) {
      console.error('❌ Erro no backend para data:', error);
      console.log('🔄 Usando dados de fallback devido a erro no backend');
      
      return {
        data: dadosFallback.contratacoes,
        totalRegistros: dadosFallback.contratacoes.length,
        totalPaginas: 1,
        paginaAtual: 1,
        tamanhoPagina: dadosFallback.contratacoes.length
      };
    }
  }

  /**
   * Busca contratações com filtros avançados
   */
  static async buscarContratacoesComFiltros(
    filtros: FiltrosContratacao
  ): Promise<PNCPResponse<Contratacao>> {
    try {
      console.log(`🔍 Buscando com filtros via backend:`, filtros);
      
      // Por enquanto, usar busca em aberto e aplicar filtros no frontend
      const response = await backendApi.get('/pncp/recebendo-proposta', {
        params: {
          modalidade: 6,
          pagina: filtros.pagina || 1,
          tamanhoPagina: filtros.tamanhoPagina || 20,
          todasPaginas: false
        }
      });

      if (response.data.success) {
        let contratacoes = response.data.data.conteudo.map((resumo: ContratacaoResumo) => 
          this.converterContratacaoResumo(resumo)
        );

                 // Aplicar filtros no frontend
         if (filtros.uf) {
           contratacoes = contratacoes.filter((c: Contratacao) => c.orgaoEntidade.uf === filtros.uf);
         }
         if (filtros.valorMinimo) {
           contratacoes = contratacoes.filter((c: Contratacao) => c.valorEstimado >= filtros.valorMinimo!);
         }
         if (filtros.valorMaximo) {
           contratacoes = contratacoes.filter((c: Contratacao) => c.valorEstimado <= filtros.valorMaximo!);
         }

        console.log(`✅ Backend retornou ${contratacoes.length} licitações com filtros`);
        
        return {
          data: contratacoes,
          totalRegistros: contratacoes.length,
          totalPaginas: 1,
          paginaAtual: filtros.pagina || 1,
          tamanhoPagina: filtros.tamanhoPagina || 20
        };
      } else {
        throw new Error(response.data.error || 'Erro no backend');
      }
    } catch (error) {
      console.error('❌ Erro no backend para filtros:', error);
      console.log('🔄 Usando dados de fallback devido a erro no backend');
      
      return {
        data: dadosFallback.contratacoes,
        totalRegistros: dadosFallback.contratacoes.length,
        totalPaginas: 1,
        paginaAtual: 1,
        tamanhoPagina: dadosFallback.contratacoes.length
      };
    }
  }

  /**
   * Busca contratação por ID específico
   */
  static async buscarContratacaoPorId(idContratacao: string): Promise<Contratacao> {
    try {
      // Por enquanto, buscar em todas as licitações em aberto
      const response = await backendApi.get('/pncp/recebendo-proposta', {
        params: {
          modalidade: 6,
          pagina: 1,
          tamanhoPagina: 500,
          todasPaginas: false
        }
      });

      if (response.data.success) {
        const contratacao = response.data.data.conteudo.find(
          (item: ContratacaoResumo) => item.numeroControlePNCP === idContratacao
        );

        if (contratacao) {
          return this.converterContratacaoResumo(contratacao);
        }
      }

      // Se não encontrou, verificar dados de fallback
      const fallback = dadosFallback.contratacoes.find(c => c.idContratacao === idContratacao);
      if (fallback) {
        return fallback;
      }

      throw new Error('Contratação não encontrada');
    } catch (error) {
      console.error('Erro ao buscar contratação por ID:', error);
      throw new Error('Falha ao buscar detalhes da contratação. Tente novamente.');
    }
  }

  /**
   * Busca modalidades de contratação disponíveis
   */
  static async buscarModalidadesContratacao(): Promise<ModalidadeContratacao[]> {
    // Retorna lista padrão
    return [
      { codigo: 'PREGÃO_ELETRÔNICO', descricao: 'Pregão Eletrônico' },
      { codigo: 'PREGÃO_PRESENCIAL', descricao: 'Pregão Presencial' },
      { codigo: 'CONCORRÊNCIA', descricao: 'Concorrência' },
      { codigo: 'CONCURSO', descricao: 'Concurso' },
      { codigo: 'LEILÃO', descricao: 'Leilão' },
      { codigo: 'CONTRATAÇÃO_DIRETA', descricao: 'Contratação Direta' },
    ];
  }

  /**
   * Busca situações de contratação disponíveis
   */
  static async buscarSituacoesContratacao(): Promise<SituacaoContratacao[]> {
    // Retorna lista padrão
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

  /**
   * Busca instrumentos convocatórios disponíveis
   */
  static async buscarInstrumentosConvocatorios(): Promise<InstrumentoConvocatorio[]> {
    // Retorna lista padrão
    return [
      { codigo: 'EDITAL', descricao: 'Edital' },
      { codigo: 'AVISO', descricao: 'Aviso' },
      { codigo: 'CONVITE', descricao: 'Convite' },
      { codigo: 'CARTA_CONVITE', descricao: 'Carta Convite' },
    ];
  }
}

export default PNCPService;

