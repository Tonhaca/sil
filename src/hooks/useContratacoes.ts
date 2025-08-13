import { useState, useEffect, useCallback } from 'react';
import { Contratacao, FiltrosContratacao, PNCPResponse } from '../types/pncp';
import PNCPService from '../services/pncpApi';

interface UseContratacoesReturn {
  contratacoes: Contratacao[];
  loading: boolean;
  error: string | null;
  totalRegistros: number;
  totalPaginas: number;
  paginaAtual: number;
  buscarPorTermo: (termo: string) => Promise<void>;
  buscarPorItem: (item: string) => Promise<void>;
  buscarComFiltros: (filtros: FiltrosContratacao) => Promise<void>;
  buscarEmAberto: () => Promise<void>;
  buscarPorData: (dataInicio: string, dataFim: string) => Promise<void>;
  carregarPagina: (pagina: number) => Promise<void>;
  limparResultados: () => void;
}

export const useContratacoes = (): UseContratacoesReturn => {
  const [contratacoes, setContratacoes] = useState<Contratacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [filtrosAtuais, setFiltrosAtuais] = useState<FiltrosContratacao>({});

  const processarResposta = useCallback((response: PNCPResponse<Contratacao>) => {
    setContratacoes(response.data);
    setTotalRegistros(response.totalRegistros);
    setTotalPaginas(response.totalPaginas);
    setPaginaAtual(response.paginaAtual);
    setError(null);
  }, []);

  const executarBusca = useCallback(async (
    buscaFunction: () => Promise<PNCPResponse<Contratacao>>,
    filtros?: FiltrosContratacao
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await buscaFunction();
      processarResposta(response);
      if (filtros) {
        setFiltrosAtuais(filtros);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      setContratacoes([]);
      setTotalRegistros(0);
      setTotalPaginas(0);
    } finally {
      setLoading(false);
    }
  }, [processarResposta]);

  const buscarPorTermo = useCallback(async (termo: string) => {
    await executarBusca(() => 
      PNCPService.buscarContratacoesPorTermo(termo, 1, 20)
    );
  }, [executarBusca]);

  const buscarPorItem = useCallback(async (item: string) => {
    await executarBusca(() => 
      PNCPService.buscarContratacoesPorItem(item, 1, 20)
    );
  }, [executarBusca]);

  const buscarComFiltros = useCallback(async (filtros: FiltrosContratacao) => {
    await executarBusca(() => 
      PNCPService.buscarContratacoesComFiltros({ ...filtros, pagina: 1, tamanhoPagina: 20 })
    );
  }, [executarBusca]);

  const buscarEmAberto = useCallback(async () => {
    await executarBusca(() => 
      PNCPService.buscarContratacoesEmAberto(1, 20)
    );
  }, [executarBusca]);

  const buscarPorData = useCallback(async (dataInicio: string, dataFim: string) => {
    await executarBusca(() => 
      PNCPService.buscarContratacoesPorData(dataInicio, dataFim, 1, 20)
    );
  }, [executarBusca]);

  const carregarPagina = useCallback(async (pagina: number) => {
    if (pagina < 1 || pagina > totalPaginas) return;

    setLoading(true);
    setError(null);

    try {
      let response: PNCPResponse<Contratacao>;

      // Determina qual tipo de busca fazer baseado nos filtros atuais
      if (filtrosAtuais.termo) {
        response = await PNCPService.buscarContratacoesPorTermo(
          filtrosAtuais.termo, 
          pagina, 
          20
        );
      } else if (filtrosAtuais.dataInicio && filtrosAtuais.dataFim) {
        response = await PNCPService.buscarContratacoesPorData(
          filtrosAtuais.dataInicio,
          filtrosAtuais.dataFim,
          pagina,
          20
        );
      } else if (Object.keys(filtrosAtuais).length > 0) {
        response = await PNCPService.buscarContratacoesComFiltros({
          ...filtrosAtuais,
          pagina,
          tamanhoPagina: 20
        });
      } else {
        // Busca padrão em aberto
        response = await PNCPService.buscarContratacoesEmAberto(pagina, 20);
      }

      processarResposta(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar página';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filtrosAtuais, totalPaginas, processarResposta]);

  const limparResultados = useCallback(() => {
    setContratacoes([]);
    setTotalRegistros(0);
    setTotalPaginas(0);
    setPaginaAtual(1);
    setError(null);
    setFiltrosAtuais({});
  }, []);

  // Carrega contratações em aberto ao inicializar
  useEffect(() => {
    buscarEmAberto();
  }, [buscarEmAberto]);

  return {
    contratacoes,
    loading,
    error,
    totalRegistros,
    totalPaginas,
    paginaAtual,
    buscarPorTermo,
    buscarPorItem,
    buscarComFiltros,
    buscarEmAberto,
    buscarPorData,
    carregarPagina,
    limparResultados,
  };
};
