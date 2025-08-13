
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MapPin, Calendar, DollarSign, FileText, ChevronRight } from 'lucide-react';
import { Contratacao } from '../types/pncp';

interface ContratacaoCardProps {
  contratacao: Contratacao;
  onVerDetalhes: (id: string) => void;
}

const ContratacaoCard: React.FC<ContratacaoCardProps> = ({ contratacao, onVerDetalhes }) => {
  const formatarData = (data: string) => {
    try {
      return format(new Date(data), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return 'Data não disponível';
    }
  };

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const getSituacaoColor = (situacao: string) => {
    const cores = {
      'RECEBENDO_PROPOSITAS': 'bg-green-100 text-green-800',
      'EM_ANÁLISE': 'bg-yellow-100 text-yellow-800',
      'HOMOLOGADA': 'bg-blue-100 text-blue-800',
      'ADJUDICADA': 'bg-purple-100 text-purple-800',
      'SUSPENSA': 'bg-orange-100 text-orange-800',
      'REVOGADA': 'bg-red-100 text-red-800',
      'ANULADA': 'bg-gray-100 text-gray-800',
    };
    return cores[situacao as keyof typeof cores] || 'bg-gray-100 text-gray-800';
  };

  const getModalidadeLabel = (modalidade: string) => {
    const modalidades = {
      'PREGÃO_ELETRÔNICO': 'Pregão Eletrônico',
      'PREGÃO_PRESENCIAL': 'Pregão Presencial',
      'CONCORRÊNCIA': 'Concorrência',
      'CONCURSO': 'Concurso',
      'LEILÃO': 'Leilão',
      'CONTRATAÇÃO_DIRETA': 'Contratação Direta',
    };
    return modalidades[modalidade as keyof typeof modalidades] || modalidade;
  };

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {contratacao.objetoContratacao}
          </h3>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{contratacao.orgaoEntidade.municipio} - {contratacao.orgaoEntidade.uf}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Publicado em {formatarData(contratacao.dataPublicacaoPncp)}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-1" />
              <span>{getModalidadeLabel(contratacao.modalidadeContratacao)}</span>
            </div>
            {contratacao.valorEstimado > 0 && (
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                <span className="font-medium">{formatarValor(contratacao.valorEstimado)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSituacaoColor(contratacao.situacaoContratacao)}`}>
            {contratacao.situacaoContratacao.replace('_', ' ')}
          </span>
          
          <button
            onClick={() => onVerDetalhes(contratacao.idContratacao)}
            className="flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            Ver detalhes
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>

      {/* Informações do órgão */}
      <div className="border-t border-gray-100 pt-3">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-gray-900">
              {contratacao.orgaoEntidade.nome}
            </p>
            <p className="text-xs text-gray-500">
              CNPJ: {contratacao.orgaoEntidade.cnpj}
            </p>
          </div>
          
          {contratacao.numeroProcesso && (
            <div className="text-right">
              <p className="text-xs text-gray-500">Processo</p>
              <p className="text-sm font-medium text-gray-900">
                {contratacao.numeroProcesso}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Itens da contratação (resumo) */}
      {contratacao.itensContratacao && contratacao.itensContratacao.length > 0 && (
        <div className="border-t border-gray-100 pt-3 mt-3">
          <p className="text-xs text-gray-500 mb-2">
            {contratacao.itensContratacao.length} item(s) na contratação
          </p>
          <div className="space-y-1">
            {contratacao.itensContratacao.slice(0, 3).map((item, index) => (
              <div key={index} className="text-sm text-gray-700">
                • {item.descricaoItem.substring(0, 80)}
                {item.descricaoItem.length > 80 && '...'}
              </div>
            ))}
            {contratacao.itensContratacao.length > 3 && (
              <p className="text-xs text-gray-500">
                +{contratacao.itensContratacao.length - 3} mais itens
              </p>
            )}
          </div>
        </div>
      )}

      {/* Datas importantes */}
      <div className="border-t border-gray-100 pt-3 mt-3">
        <div className="grid grid-cols-2 gap-4 text-xs">
          {contratacao.dataAberturaProposta && (
            <div>
              <p className="text-gray-500">Abertura de Propostas</p>
              <p className="font-medium">{formatarData(contratacao.dataAberturaProposta)}</p>
            </div>
          )}
          {contratacao.dataEncerramentoProposta && (
            <div>
              <p className="text-gray-500">Encerramento</p>
              <p className="font-medium">{formatarData(contratacao.dataEncerramentoProposta)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContratacaoCard;
