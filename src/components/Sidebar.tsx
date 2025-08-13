import { useState, useEffect } from 'react';
import { Filter, Calendar, MapPin, DollarSign, FileText, X } from 'lucide-react';
import { FiltrosContratacao, ModalidadeContratacao, SituacaoContratacao } from '../types/pncp';
import { modalidadesContratacao, situacoesContratacao } from '../services/pncpApi';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onAplicarFiltros: (filtros: FiltrosContratacao) => void;
  filtrosAtuais: FiltrosContratacao;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  onAplicarFiltros, 
  filtrosAtuais 
}) => {
  const [filtros, setFiltros] = useState<FiltrosContratacao>(filtrosAtuais);
  const [modalidades, setModalidades] = useState<ModalidadeContratacao[]>([]);
  const [situacoes, setSituacoes] = useState<SituacaoContratacao[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFiltros(filtrosAtuais);
  }, [filtrosAtuais]);

  useEffect(() => {
    const carregarDados = () => {
      setLoading(true);
      try {
        setModalidades(modalidadesContratacao);
        setSituacoes(situacoesContratacao);
      } catch (error) {
        console.error('Erro ao carregar dados dos filtros:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  const handleInputChange = (field: keyof FiltrosContratacao, value: any) => {
    setFiltros(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAplicarFiltros = () => {
    onAplicarFiltros(filtros);
    onClose();
  };

  const handleLimparFiltros = () => {
    const filtrosLimpos: FiltrosContratacao = {};
    setFiltros(filtrosLimpos);
    onAplicarFiltros(filtrosLimpos);
  };



  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 right-0 z-50 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        md:relative md:translate-x-0 md:shadow-none md:border-l md:border-gray-200
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filtros Avançados
            </h2>
            <button
              onClick={onClose}
              className="md:hidden p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Conteúdo */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Período */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Período de Publicação
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Data Início</label>
                  <input
                    type="date"
                    value={filtros.dataInicio || ''}
                    onChange={(e) => handleInputChange('dataInicio', e.target.value)}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Data Fim</label>
                  <input
                    type="date"
                    value={filtros.dataFim || ''}
                    onChange={(e) => handleInputChange('dataFim', e.target.value)}
                    className="input-field text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Localização */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                Localização
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">UF</label>
                  <input
                    type="text"
                    placeholder="Ex: SP, RJ, MG..."
                    value={filtros.uf || ''}
                    onChange={(e) => handleInputChange('uf', e.target.value)}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Município</label>
                  <input
                    type="text"
                    placeholder="Nome do município"
                    value={filtros.municipio || ''}
                    onChange={(e) => handleInputChange('municipio', e.target.value)}
                    className="input-field text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Valor */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Valor Estimado
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Valor Mínimo</label>
                  <input
                    type="number"
                    placeholder="0,00"
                    value={filtros.valorMinimo || ''}
                    onChange={(e) => handleInputChange('valorMinimo', parseFloat(e.target.value) || undefined)}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Valor Máximo</label>
                  <input
                    type="number"
                    placeholder="0,00"
                    value={filtros.valorMaximo || ''}
                    onChange={(e) => handleInputChange('valorMaximo', parseFloat(e.target.value) || undefined)}
                    className="input-field text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Modalidade */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Modalidade de Contratação
              </h3>
              <select
                value={filtros.modalidadeContratacao || ''}
                onChange={(e) => handleInputChange('modalidadeContratacao', e.target.value || undefined)}
                className="input-field text-sm"
              >
                <option value="">Todas as modalidades</option>
                {modalidades.map((modalidade) => (
                  <option key={modalidade.codigo} value={modalidade.codigo}>
                    {modalidade.descricao}
                  </option>
                ))}
              </select>
            </div>

            {/* Situação */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Situação</h3>
              <select
                value={filtros.situacaoContratacao || ''}
                onChange={(e) => handleInputChange('situacaoContratacao', e.target.value || undefined)}
                className="input-field text-sm"
              >
                <option value="">Todas as situações</option>
                {situacoes.map((situacao) => (
                  <option key={situacao.codigo} value={situacao.codigo}>
                    {situacao.descricao}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 space-y-3">
            <button
              onClick={handleAplicarFiltros}
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Carregando...' : 'Aplicar Filtros'}
            </button>
            <button
              onClick={handleLimparFiltros}
              className="btn-secondary w-full"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
