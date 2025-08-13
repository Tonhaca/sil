import React, { useState, useEffect } from 'react';
import { buscarPorTermo, buscarLicitacoesEmAberto, buscarLicitacoesRecentes, PNCPContratacao } from './services/pncpApi';

function App() {
  const [termoBusca, setTermoBusca] = useState('');
  const [licitacoes, setLicitacoes] = useState<PNCPContratacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [carregandoInicial, setCarregandoInicial] = useState(true);

  // Carregar licitações recentes ao abrir a página
  useEffect(() => {
    carregarLicitacoesRecentes();
  }, []);

  const carregarLicitacoesRecentes = async () => {
    setCarregandoInicial(true);
    setError(null);

    try {
      const licitacoesRecentes = await buscarLicitacoesRecentes();
      setLicitacoes(licitacoesRecentes);
    } catch (err) {
      setError('Erro ao carregar licitações recentes. Tente novamente.');
      console.error('Erro ao carregar licitações recentes:', err);
    } finally {
      setCarregandoInicial(false);
    }
  };

  const handleBuscar = async () => {
    if (!termoBusca.trim()) {
      // Se não há termo, volta para licitações recentes
      await carregarLicitacoesRecentes();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const resultados = await buscarPorTermo(termoBusca);
      setLicitacoes(resultados);
    } catch (err) {
      setError('Erro ao buscar licitações. Tente novamente.');
      console.error('Erro na busca:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuscarEmAberto = async () => {
    setLoading(true);
    setError(null);

    try {
      const resultados = await buscarLicitacoesEmAberto();
      setLicitacoes(resultados.conteudo);
    } catch (err) {
      setError('Erro ao buscar licitações em aberto. Tente novamente.');
      console.error('Erro na busca:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLimpar = () => {
    setTermoBusca('');
    carregarLicitacoesRecentes();
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            🚀 SIL - Sistema Inteligente de Licitações
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Busque licitações públicas em todo o Brasil - Dados reais do PNCP
          </p>
        </div>
      </header>

      {/* Busca */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex gap-4">
            <input
              type="text"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              placeholder="Digite o item que deseja buscar (ex: equipamentos, serviços, mamadeira...)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleBuscar()}
            />
            <button
              onClick={handleBuscar}
              disabled={loading || carregandoInicial}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
            <button
              onClick={handleBuscarEmAberto}
              disabled={loading || carregandoInicial}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Em Aberto
            </button>
            <button
              onClick={handleLimpar}
              disabled={loading || carregandoInicial}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              Limpar
            </button>
          </div>
        </div>

        {/* Resultados */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {(loading || carregandoInicial) && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">
              {carregandoInicial ? 'Carregando licitações recentes...' : 'Buscando licitações...'}
            </p>
          </div>
        )}

        {!loading && !carregandoInicial && licitacoes.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                {licitacoes.length} licitação{licitacoes.length !== 1 ? 'ões' : ''} encontrada{licitacoes.length !== 1 ? 's' : ''}
                {termoBusca && ` para "${termoBusca}"`}
              </h2>
              <div className="text-sm text-gray-500">
                Todas as licitações estão "Recebendo Proposta"
              </div>
            </div>

            {licitacoes.map((licitacao, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {licitacao.numeroContratacao}
                    </h3>
                    <p className="text-gray-600 mb-2">
                      <strong>Objeto:</strong> {licitacao.objetoCompra}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded">
                      {licitacao.modalidadeNome}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <strong>Órgão:</strong>
                    <p className="text-gray-600">{licitacao.unidadeGestora.nome}</p>
                    <p className="text-gray-500">{licitacao.unidadeGestora.municipio} - {licitacao.unidadeGestora.uf}</p>
                  </div>
                  <div>
                    <strong>Valor Estimado:</strong>
                    <p className="text-gray-600">{formatarValor(licitacao.valorEstimado)}</p>
                  </div>
                  <div>
                    <strong>Abertura:</strong>
                    <p className="text-gray-600">{formatarData(licitacao.dataAberturaProposta)}</p>
                  </div>
                  <div>
                    <strong>Encerramento:</strong>
                    <p className="text-gray-600">{formatarData(licitacao.dataEncerramentoProposta)}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <span className="text-sm text-gray-500">
                      <strong>Situação:</strong> {licitacao.situacaoContratacao}
                    </span>
                    <span className="text-sm text-gray-500">
                      <strong>Instrumento:</strong> {licitacao.instrumentoConvocatorio}
                    </span>
                  </div>
                  {licitacao.linkEdital && (
                    <a
                      href={licitacao.linkEdital}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-blue-600 hover:underline text-sm"
                    >
                      📄 Ver Edital
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !carregandoInicial && licitacoes.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-gray-600">
              {termoBusca ? 'Nenhuma licitação encontrada para este termo.' : 'Nenhuma licitação encontrada.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
