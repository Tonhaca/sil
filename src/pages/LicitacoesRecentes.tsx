import React, { useState, useEffect } from 'react';
import { buscarLicitacoesRecentes, PNCPContratacao } from '../services/pncpApi';

function LicitacoesRecentes() {
  const [licitacoes, setLicitacoes] = useState<PNCPContratacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    carregarLicitacoesRecentes();
  }, []);

  const carregarLicitacoesRecentes = async () => {
    setLoading(true);
    setError(null);

    try {
      const licitacoesRecentes = await buscarLicitacoesRecentes();
      setLicitacoes(licitacoesRecentes);
    } catch (err) {
      setError('Erro ao carregar licitações recentes. Tente novamente.');
      console.error('Erro ao carregar licitações recentes:', err);
    } finally {
      setLoading(false);
    }
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                📋 Licitações Mais Recentes
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Licitações mais recentemente adicionadas ao PNCP
              </p>
            </div>
            <a
              href="/"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              ← Voltar à Busca
            </a>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Estatísticas */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Licitações em Aberto
              </h2>
              <p className="text-sm text-gray-600">
                Todas as licitações estão "Recebendo Proposta"
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {licitacoes.length}
              </div>
              <div className="text-sm text-gray-500">
                licitações encontradas
              </div>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">
              Carregando licitações mais recentes...
            </p>
          </div>
        )}

        {/* Erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Lista de Licitações */}
        {!loading && !error && licitacoes.length > 0 && (
          <div className="space-y-4">
            {licitacoes.map((licitacao, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {licitacao.numeroContratacao}
                    </h3>
                    <p className="text-gray-600 mb-2">
                      <strong>Objeto:</strong> {licitacao.objetoCompra}
                    </p>
                  </div>
                  <div className="text-right ml-4">
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
                    <strong>Adicionada ao PNCP:</strong>
                    <p className="text-gray-600">{formatarData(licitacao.dataInclusao)}</p>
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

        {/* Sem resultados */}
        {!loading && !error && licitacoes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">
              Nenhuma licitação encontrada.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default LicitacoesRecentes;
