import { useState } from 'react';
import { Filter, Search, AlertCircle, Loader2, WifiOff } from 'lucide-react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ContratacaoCard from './components/ContratacaoCard';
import Pagination from './components/Pagination';
import ContratacaoDetalhes from './components/ContratacaoDetalhes';
import { useContratacoes } from './hooks/useContratacoes';
import { FiltrosContratacao } from './types/pncp';

function App() {
  console.log('🚀 App component rendering...');
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [contratacaoSelecionada, setContratacaoSelecionada] = useState<string | null>(null);
  const [filtrosAtuais, setFiltrosAtuais] = useState<FiltrosContratacao>({});

  const {
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
  } = useContratacoes();

  console.log('📊 App state:', { contratacoes: contratacoes.length, loading, error });

  const handleSearch = (termo: string) => {
    // Tenta buscar por item primeiro, depois por termo geral
    buscarPorItem(termo).catch(() => {
      buscarPorTermo(termo);
    });
  };

  const handleAplicarFiltros = (filtros: FiltrosContratacao) => {
    setFiltrosAtuais(filtros);
    buscarComFiltros(filtros);
  };

  const handleVerDetalhes = (id: string) => {
    setContratacaoSelecionada(id);
  };

  const handleCloseDetalhes = () => {
    setContratacaoSelecionada(null);
  };

  const handlePageChange = (pagina: number) => {
    carregarPagina(pagina);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        onSearch={handleSearch}
        onToggleMenu={() => setIsSidebarOpen(!isSidebarOpen)}
        isMenuOpen={isSidebarOpen}
      />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onAplicarFiltros={handleAplicarFiltros}
          filtrosAtuais={filtrosAtuais}
        />

        {/* Conteúdo Principal */}
        <main className="flex-1">
          {/* Notificação de Modo Offline */}
          {usandoFallback && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <WifiOff className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Modo Offline:</strong> A API do PNCP está temporariamente indisponível. 
                    Exibindo dados de demonstração. A funcionalidade completa será restaurada quando a API voltar ao normal.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Barra de Ações */}
          <div className="bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                >
                  <Filter className="h-5 w-5" />
                </button>
                
                <div className="hidden md:flex items-center space-x-4">
                  <button
                    onClick={buscarEmAberto}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Em Aberto
                  </button>
                  <button
                    onClick={() => {
                      const hoje = new Date();
                      const umMesAtras = new Date();
                      umMesAtras.setMonth(hoje.getMonth() - 1);
                      
                      buscarPorData(
                        umMesAtras.toISOString().split('T')[0].replace(/-/g, ''),
                        hoje.toISOString().split('T')[0].replace(/-/g, '')
                      );
                    }}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Último Mês
                  </button>
                  <button
                    onClick={limparResultados}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Limpar
                  </button>
                </div>
              </div>

              {totalRegistros > 0 && (
                <div className="text-sm text-gray-600">
                  {totalRegistros} resultado{totalRegistros !== 1 ? 's' : ''} encontrado{totalRegistros !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>

          {/* Conteúdo */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Estado de Loading */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
                  <p className="text-gray-600">Carregando licitações...</p>
                </div>
              </div>
            )}

            {/* Estado de Erro */}
            {error && !loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center max-w-md">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Erro ao carregar dados
                  </h3>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <button
                    onClick={buscarEmAberto}
                    className="btn-primary"
                  >
                    Tentar Novamente
                  </button>
                </div>
              </div>
            )}

            {/* Lista de Contratações */}
            {!loading && !error && contratacoes.length > 0 && (
              <div className="space-y-6">
                {contratacoes.map((contratacao) => (
                  <ContratacaoCard
                    key={contratacao.idContratacao}
                    contratacao={contratacao}
                    onVerDetalhes={handleVerDetalhes}
                  />
                ))}
              </div>
            )}

            {/* Estado Vazio */}
            {!loading && !error && contratacoes.length === 0 && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center max-w-md">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Nenhuma licitação encontrada
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Tente ajustar os filtros ou fazer uma nova pesquisa.
                  </p>
                  <button
                    onClick={buscarEmAberto}
                    className="btn-primary"
                  >
                    Ver Licitações em Aberto
                  </button>
                </div>
              </div>
            )}

            {/* Paginação */}
            {!loading && !error && totalPaginas > 1 && (
              <div className="mt-8">
                <Pagination
                  paginaAtual={paginaAtual}
                  totalPaginas={totalPaginas}
                  totalRegistros={totalRegistros}
                  onPageChange={handlePageChange}
                  loading={loading}
                />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal de Detalhes */}
      {contratacaoSelecionada && (
        <ContratacaoDetalhes
          idContratacao={contratacaoSelecionada}
          onClose={handleCloseDetalhes}
        />
      )}
    </div>
  );
}

export default App;
