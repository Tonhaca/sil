import { useState, useEffect, useCallback } from 'react';
import { Contratacao, FiltrosContratacao } from '../types/pncp';
import { 
  getRecebendoPropostaComFallback, 
  getPublicadasComFallback 
} from '../services/pncpApi';

interface UseContratacoesReturn {
  contratacoes: Contratacao[];
  loading: boolean;
  error: string | null;
  totalRegistros: number;
  totalPaginas: number;
  paginaAtual: number;
  usandoFallback: boolean;
  buscarPorTermo: (termo: string) => Promise<void>;
  buscarPorItem: (item: string) => Promise<void>;
  buscarComFiltros: (filtros: FiltrosContratacao) => Promise<void>;
  buscarEmAberto: () => Promise<void>;
  buscarPorData: (dataInicio: string, dataFim: string) => Promise<void>;
  carregarPagina: (pagina: number) => Promise<void>;
  limparResultados: () => void;
}

export const useContratacoes = (): UseContratacoesReturn => {
  console.log('🔄 useContratacoes hook initialized');
  
  const [contratacoes, setContratacoes] = useState<Contratacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [filtrosAtuais, setFiltrosAtuais] = useState<FiltrosContratacao>({});
  const [usandoFallback, setUsandoFallback] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    console.log('🚀 Loading initial data...');
    // Carregar dados de fallback primeiro para testar
    setContratacoes([
      {
        idContratacao: 'test-1',
        numeroContratacao: '001/2024',
        objetoContratacao: 'Teste de licitação',
        dataPublicacao: '20240813',
        dataAbertura: '20240820',
        valorEstimado: 100000.00,
        unidadeGestora: {
          codigo: '123456',
          nome: 'Órgão Teste',
          uf: 'SP',
          municipio: 'São Paulo'
        },
        modalidadeContratacao: 'Pregão Eletrônico',
        situacaoContratacao: 'Recebendo Proposta',
        instrumentoConvocatorio: 'Edital',
        linkEdital: '#',
        linkSistema: '#'
      }
    ]);
    setTotalRegistros(1);
    setTotalPaginas(1);
    setLoading(false);
    console.log('✅ Initial data loaded');
  }, []);

  const processarResposta = useCallback((response: any, isFallback: boolean = false) => {
    console.log('📊 Processing response:', response);
    setContratacoes(response.conteudo || []);
    setTotalRegistros(response.paginacao?.totalRegistros || 0);
    setTotalPaginas(response.paginacao?.totalPaginas || 0);
    setPaginaAtual(response.paginacao?.paginaAtual || 1);
    setError(null);
    setUsandoFallback(isFallback);
  }, []);

  const executarBusca = useCallback(async (
    buscaFunction: () => Promise<any>,
    filtros?: FiltrosContratacao
  ) => {
    console.log('🔍 Executing search...');
    setLoading(true);
    setError(null);
    setUsandoFallback(false);
    
    try {
      const response = await buscaFunction();
      console.log('✅ Search completed:', response);
      
      // Verifica se os dados são de fallback (IDs começam com 'fallback-')
      const isFallback = response.conteudo?.some((item: any) => item.idContratacao?.startsWith('fallback-')) || false;
      
      processarResposta(response, isFallback);
      if (filtros) {
        setFiltrosAtuais(filtros);
      }
    } catch (err) {
      console.error('❌ Search error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      setContratacoes([]);
      setTotalRegistros(0);
      setTotalPaginas(0);
      setUsandoFallback(false);
    } finally {
      setLoading(false);
    }
  }, [processarResposta]);

  const buscarPorTermo = useCallback(async (termo: string) => {
    console.log('🔍 buscarPorTermo:', termo);
    // Buscar em licitações publicadas recentemente
    const hoje = new Date();
    const dataInicial = `${hoje.getFullYear()}0101`;
    const dataFinal = `${hoje.getFullYear()}${String(hoje.getMonth() + 1).padStart(2, '0')}${String(hoje.getDate()).padStart(2, '0')}`;
    
    await executarBusca(() => 
      getPublicadasComFallback({
        modalidade: 6,
        dataInicial,
        dataFinal,
        pagina: 1,
        tamanhoPagina: 500
      })
    );
  }, [executarBusca]);

  const buscarPorItem = useCallback(async (item: string) => {
    console.log('🔍 buscarPorItem:', item);
    // Buscar em licitações publicadas recentemente
    const hoje = new Date();
    const dataInicial = `${hoje.getFullYear()}0101`;
    const dataFinal = `${hoje.getFullYear()}${String(hoje.getMonth() + 1).padStart(2, '0')}${String(hoje.getDate()).padStart(2, '0')}`;
    
    await executarBusca(() => 
      getPublicadasComFallback({
        modalidade: 6,
        dataInicial,
        dataFinal,
        pagina: 1,
        tamanhoPagina: 500
      })
    );
  }, [executarBusca]);

  const buscarComFiltros = useCallback(async (filtros: FiltrosContratacao) => {
    console.log('🔍 buscarComFiltros:', filtros);
    await executarBusca(() => 
      getRecebendoPropostaComFallback({
        modalidade: filtros.modalidadeContratacao ? Number(filtros.modalidadeContratacao) : 6,
        pagina: 1,
        tamanhoPagina: 20
      }),
      filtros
    );
  }, [executarBusca]);

  const buscarEmAberto = useCallback(async () => {
    console.log('🔍 buscarEmAberto called');
    try {
      await executarBusca(() => 
        getRecebendoPropostaComFallback({
          modalidade: 6,
          pagina: 1,
          tamanhoPagina: 20
        })
      );
      console.log('✅ buscarEmAberto completed successfully');
    } catch (error) {
      console.error('❌ buscarEmAberto error:', error);
    }
  }, [executarBusca]);

  const buscarPorData = useCallback(async (dataInicio: string, dataFim: string) => {
    console.log('🔍 buscarPorData:', dataInicio, dataFim);
    await executarBusca(() => 
      getPublicadasComFallback({
        modalidade: 6,
        dataInicial: dataInicio,
        dataFinal: dataFim,
        pagina: 1,
        tamanhoPagina: 20
      })
    );
  }, [executarBusca]);

  const carregarPagina = useCallback(async (pagina: number) => {
    console.log('🔍 carregarPagina:', pagina);
    if (pagina < 1 || pagina > totalPaginas) return;

    setLoading(true);
    setError(null);

    try {
      let response: any;

      // Determina qual tipo de busca fazer baseado nos filtros atuais
      if (filtrosAtuais.termo) {
        // Buscar em licitações publicadas recentemente
        const hoje = new Date();
        const dataInicial = `${hoje.getFullYear()}0101`;
        const dataFinal = `${hoje.getFullYear()}${String(hoje.getMonth() + 1).padStart(2, '0')}${String(hoje.getDate()).padStart(2, '0')}`;
        
        response = await getPublicadasComFallback({
          modalidade: 6,
          dataInicial,
          dataFinal,
          pagina,
          tamanhoPagina: 500
        });
      } else if (filtrosAtuais.dataInicio && filtrosAtuais.dataFim) {
        response = await getPublicadasComFallback({
          modalidade: filtrosAtuais.modalidadeContratacao ? Number(filtrosAtuais.modalidadeContratacao) : 6,
          dataInicial: filtrosAtuais.dataInicio,
          dataFinal: filtrosAtuais.dataFim,
          pagina,
          tamanhoPagina: 20
        });
      } else if (Object.keys(filtrosAtuais).length > 0) {
        response = await getRecebendoPropostaComFallback({
          modalidade: filtrosAtuais.modalidadeContratacao ? Number(filtrosAtuais.modalidadeContratacao) : 6,
          pagina,
          tamanhoPagina: 20
        });
      } else {
        // Busca padrão em aberto
        response = await getRecebendoPropostaComFallback({
          modalidade: 6,
          pagina,
          tamanhoPagina: 20
        });
      }

      // Verifica se os dados são de fallback
      const isFallback = response.conteudo?.some((item: any) => item.idContratacao?.startsWith('fallback-')) || false;
      processarResposta(response, isFallback);
    } catch (err) {
      console.error('❌ carregarPagina error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar página';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filtrosAtuais, totalPaginas, processarResposta]);

  const limparResultados = useCallback(() => {
    console.log('🧹 limparResultados');
    setContratacoes([]);
    setTotalRegistros(0);
    setTotalPaginas(0);
    setPaginaAtual(1);
    setError(null);
    setFiltrosAtuais({});
    setUsandoFallback(false);
  }, []);

  return {
    contratacoes,
    loading,
    error,
    totalRegistros,
    totalPaginas,
    paginaAtual,
    usandoFallback,
    buscarPorTermo,
    buscarPorItem,
    buscarComFiltros,
    buscarEmAberto,
    buscarPorData,
    carregarPagina,
    limparResultados,
  };
};
