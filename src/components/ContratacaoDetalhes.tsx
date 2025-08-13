import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  X, 
  MapPin, 
  Calendar, 
  DollarSign, 
  FileText, 
  ExternalLink, 
  Download,
  Building,

  Package,
  Award
} from 'lucide-react';
import { Contratacao } from '../types/pncp';
import { getRecebendoPropostaComFallback, getPublicadasComFallback } from '../services/pncpApi';

interface ContratacaoDetalhesProps {
  idContratacao: string;
  onClose: () => void;
}

const ContratacaoDetalhes: React.FC<ContratacaoDetalhesProps> = ({ idContratacao, onClose }) => {
  const [contratacao, setContratacao] = useState<Contratacao | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const carregarDetalhes = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Buscar em licitações em aberto primeiro
        const emAberto = await getRecebendoPropostaComFallback({
          modalidade: 6,
          pagina: 1,
          tamanhoPagina: 500
        });
        
        let dados = emAberto.conteudo?.find(c => c.idContratacao === idContratacao);
        
        // Se não encontrou, buscar em licitações publicadas
        if (!dados) {
          const hoje = new Date();
          const dataInicial = `${hoje.getFullYear()}0101`;
          const dataFinal = `${hoje.getFullYear()}${String(hoje.getMonth() + 1).padStart(2, '0')}${String(hoje.getDate()).padStart(2, '0')}`;
          
          const publicadas = await getPublicadasComFallback({
            modalidade: 6,
            dataInicial,
            dataFinal,
            pagina: 1,
            tamanhoPagina: 500
          });
          
          dados = publicadas.conteudo?.find(c => c.idContratacao === idContratacao);
        }
        
        setContratacao(dados || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar detalhes');
      } finally {
        setLoading(false);
      }
    };

    carregarDetalhes();
  }, [idContratacao]);

  const formatarData = (data: string) => {
    try {
      return format(new Date(data), 'dd/MM/yyyy HH:mm', { locale: ptBR });
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

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-gray-700">Carregando detalhes...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !contratacao) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar detalhes</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="btn-primary"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-lg">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {contratacao.objetoContratacao}
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{contratacao.orgaoEntidade.municipio} - {contratacao.orgaoEntidade.uf}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Publicado em {formatarData(contratacao.dataPublicacaoPncp)}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-6">
          {/* Informações Gerais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Informações do Órgão
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Nome</p>
                  <p className="font-medium">{contratacao.orgaoEntidade.nome}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">CNPJ</p>
                  <p className="font-medium">{contratacao.orgaoEntidade.cnpj}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Localização</p>
                  <p className="font-medium">{contratacao.orgaoEntidade.municipio} - {contratacao.orgaoEntidade.uf}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Detalhes da Contratação
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Número da Contratação</p>
                  <p className="font-medium">{contratacao.numeroContratacao}</p>
                </div>
                {contratacao.numeroProcesso && (
                  <div>
                    <p className="text-sm text-gray-500">Número do Processo</p>
                    <p className="font-medium">{contratacao.numeroProcesso}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Modalidade</p>
                  <p className="font-medium">{getModalidadeLabel(contratacao.modalidadeContratacao)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Situação</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSituacaoColor(contratacao.situacaoContratacao)}`}>
                    {contratacao.situacaoContratacao.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Valores */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Valores
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {contratacao.valorEstimado > 0 && (
                <div>
                  <p className="text-sm text-gray-500">Valor Estimado</p>
                  <p className="text-lg font-bold text-primary-600">{formatarValor(contratacao.valorEstimado)}</p>
                </div>
              )}
              {contratacao.valorHomologado > 0 && (
                <div>
                  <p className="text-sm text-gray-500">Valor Homologado</p>
                  <p className="text-lg font-bold text-green-600">{formatarValor(contratacao.valorHomologado)}</p>
                </div>
              )}
              {contratacao.valorAdjudicado > 0 && (
                <div>
                  <p className="text-sm text-gray-500">Valor Adjudicado</p>
                  <p className="text-lg font-bold text-purple-600">{formatarValor(contratacao.valorAdjudicado)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Datas Importantes */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Cronograma
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contratacao.dataAberturaProposta && (
                <div>
                  <p className="text-sm text-gray-500">Abertura de Propostas</p>
                  <p className="font-medium">{formatarData(contratacao.dataAberturaProposta)}</p>
                </div>
              )}
              {contratacao.dataEncerramentoProposta && (
                <div>
                  <p className="text-sm text-gray-500">Encerramento de Propostas</p>
                  <p className="font-medium">{formatarData(contratacao.dataEncerramentoProposta)}</p>
                </div>
              )}
              {contratacao.dataHomologacao && (
                <div>
                  <p className="text-sm text-gray-500">Homologação</p>
                  <p className="font-medium">{formatarData(contratacao.dataHomologacao)}</p>
                </div>
              )}
              {contratacao.dataAdjudicacao && (
                <div>
                  <p className="text-sm text-gray-500">Adjudicação</p>
                  <p className="font-medium">{formatarData(contratacao.dataAdjudicacao)}</p>
                </div>
              )}
              {contratacao.dataAssinatura && (
                <div>
                  <p className="text-sm text-gray-500">Assinatura do Contrato</p>
                  <p className="font-medium">{formatarData(contratacao.dataAssinatura)}</p>
                </div>
              )}
              {contratacao.dataVigenciaInicio && (
                <div>
                  <p className="text-sm text-gray-500">Início da Vigência</p>
                  <p className="font-medium">{formatarData(contratacao.dataVigenciaInicio)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Itens da Contratação */}
          {contratacao.itensContratacao && contratacao.itensContratacao.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Itens da Contratação ({contratacao.itensContratacao.length})
              </h3>
              <div className="space-y-4">
                {contratacao.itensContratacao.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">
                        Item {item.numeroItem} - {item.descricaoItem}
                      </h4>
                      <span className="text-sm text-gray-500">
                        {formatarValor(item.valorTotal)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Quantidade</p>
                        <p className="font-medium">{item.quantidade} {item.unidadeFornecimento}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Valor Unitário</p>
                        <p className="font-medium">{formatarValor(item.valorUnitario)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Classificação</p>
                        <p className="font-medium">{item.classificacaoSuperior}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Situação</p>
                        <p className="font-medium">{item.situacaoItem}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fornecedor (se houver) */}
          {contratacao.fornecedor && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Fornecedor Vencedor
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Nome/Razão Social</p>
                  <p className="font-medium">{contratacao.fornecedor.nomeRazaoSocialFornecedor}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tipo de Pessoa</p>
                  <p className="font-medium">{contratacao.fornecedor.tipoPessoa}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">CNPJ/CPF</p>
                  <p className="font-medium">{contratacao.fornecedor.niFornecedor}</p>
                </div>
              </div>
            </div>
          )}

          {/* Documentos */}
          {contratacao.documentos && contratacao.documentos.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Download className="h-5 w-5 mr-2" />
                Documentos ({contratacao.documentos.length})
              </h3>
              <div className="space-y-2">
                {contratacao.documentos.map((documento, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{documento.nomeDocumento}</p>
                      <p className="text-sm text-gray-500">{documento.tipoDocumento}</p>
                    </div>
                    <a
                      href={documento.urlDocumento}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-primary-600 hover:text-primary-700"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Abrir
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContratacaoDetalhes;
