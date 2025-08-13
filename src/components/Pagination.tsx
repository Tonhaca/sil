
import { Fragment } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  paginaAtual: number;
  totalPaginas: number;
  totalRegistros: number;
  onPageChange: (pagina: number) => void;
  loading?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  paginaAtual,
  totalPaginas,
  totalRegistros,
  onPageChange,
  loading = false
}) => {
  if (totalPaginas <= 1) {
    return null;
  }

  const getPaginasVisiveis = () => {
    const paginas = [];
    const maxPaginasVisiveis = 5;
    
    if (totalPaginas <= maxPaginasVisiveis) {
      // Mostra todas as páginas se o total for menor ou igual a 5
      for (let i = 1; i <= totalPaginas; i++) {
        paginas.push(i);
      }
    } else {
      // Lógica para mostrar páginas com elipses
      if (paginaAtual <= 3) {
        // Páginas iniciais
        for (let i = 1; i <= 4; i++) {
          paginas.push(i);
        }
        paginas.push('...');
        paginas.push(totalPaginas);
      } else if (paginaAtual >= totalPaginas - 2) {
        // Páginas finais
        paginas.push(1);
        paginas.push('...');
        for (let i = totalPaginas - 3; i <= totalPaginas; i++) {
          paginas.push(i);
        }
      } else {
        // Páginas do meio
        paginas.push(1);
        paginas.push('...');
        for (let i = paginaAtual - 1; i <= paginaAtual + 1; i++) {
          paginas.push(i);
        }
        paginas.push('...');
        paginas.push(totalPaginas);
      }
    }
    
    return paginas;
  };

  const handlePageChange = (pagina: number) => {
    if (pagina >= 1 && pagina <= totalPaginas && pagina !== paginaAtual && !loading) {
      onPageChange(pagina);
    }
  };

  const paginasVisiveis = getPaginasVisiveis();

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
      {/* Informações sobre registros */}
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => handlePageChange(paginaAtual - 1)}
          disabled={paginaAtual === 1 || loading}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>
        <button
          onClick={() => handlePageChange(paginaAtual + 1)}
          disabled={paginaAtual === totalPaginas || loading}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Próxima
        </button>
      </div>

      {/* Paginação desktop */}
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Mostrando{' '}
            <span className="font-medium">
              {((paginaAtual - 1) * 20) + 1}
            </span>
            {' '}a{' '}
            <span className="font-medium">
              {Math.min(paginaAtual * 20, totalRegistros)}
            </span>
            {' '}de{' '}
            <span className="font-medium">{totalRegistros}</span>
            {' '}resultados
          </p>
        </div>

        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            {/* Primeira página */}
            <button
              onClick={() => handlePageChange(1)}
              disabled={paginaAtual === 1 || loading}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Primeira página</span>
              <ChevronsLeft className="h-5 w-5" />
            </button>

            {/* Página anterior */}
            <button
              onClick={() => handlePageChange(paginaAtual - 1)}
              disabled={paginaAtual === 1 || loading}
              className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Página anterior</span>
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Números das páginas */}
                         {paginasVisiveis.map((pagina, index) => (
               <Fragment key={index}>
                 {pagina === '...' ? (
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    ...
                  </span>
                ) : (
                  <button
                    onClick={() => handlePageChange(pagina as number)}
                    disabled={loading}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      pagina === paginaAtual
                        ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {pagina}
                  </button>
                )}
                             </Fragment>
            ))}

            {/* Próxima página */}
            <button
              onClick={() => handlePageChange(paginaAtual + 1)}
              disabled={paginaAtual === totalPaginas || loading}
              className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Próxima página</span>
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Última página */}
            <button
              onClick={() => handlePageChange(totalPaginas)}
              disabled={paginaAtual === totalPaginas || loading}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Última página</span>
              <ChevronsRight className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
