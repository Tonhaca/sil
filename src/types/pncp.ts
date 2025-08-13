// Tipos baseados na documentação da API do PNCP

export interface PNCPResponse<T> {
  data: T[];
  totalRegistros: number;
  totalPaginas: number;
  paginaAtual: number;
  tamanhoPagina: number;
}

export interface Contratacao {
  idContratacao: string;
  numeroContratacao: string;
  objetoContratacao: string;
  numeroProcesso: string;
  dataPublicacaoPncp: string;
  dataAberturaProposta: string;
  dataEncerramentoProposta: string;
  dataHomologacao: string;
  dataAdjudicacao: string;
  dataAssinatura: string;
  dataVigenciaInicio: string;
  dataVigenciaFim: string;
  valorEstimado: number;
  valorHomologado: number;
  valorAdjudicado: number;
  valorContrato: number;
  modalidadeContratacao: string;
  instrumentoConvocatorio: string;
  modoDisputa: string;
  criterioJulgamento: string;
  situacaoContratacao: string;
  tipoContrato: string;
  tipoTermoContrato: string;
  categoriaProcesso: string;
  naturezaJuridica: string;
  amparoLegal: string;
  orgaoEntidade: {
    cnpj: string;
    nome: string;
    uf: string;
    municipio: string;
  };
  fornecedor?: {
    tipoPessoa: string;
    niFornecedor: string;
    nomeRazaoSocialFornecedor: string;
  };
  itensContratacao: ItemContratacao[];
  documentos: Documento[];
}

export interface ItemContratacao {
  idItemContratacao: string;
  numeroItem: number;
  descricaoItem: string;
  quantidade: number;
  unidadeFornecimento: string;
  valorUnitario: number;
  valorTotal: number;
  situacaoItem: string;
  classificacaoSuperior: string;
  classificacaoDetalhada: string;
  categoriaItem: string;
  codigoMaterial: string;
  codigoServico: string;
  especificacaoTecnica: string;
  criterioJulgamento: string;
  resultadoItem?: ResultadoItem;
}

export interface ResultadoItem {
  idResultadoItem: string;
  situacaoResultado: string;
  valorUnitario: number;
  valorTotal: number;
  fornecedor: {
    tipoPessoa: string;
    niFornecedor: string;
    nomeRazaoSocialFornecedor: string;
  };
}

export interface Documento {
  idDocumento: string;
  nomeDocumento: string;
  tipoDocumento: string;
  urlDocumento: string;
  dataPublicacao: string;
}

export interface FiltrosContratacao {
  dataInicio?: string;
  dataFim?: string;
  modalidadeContratacao?: string;
  situacaoContratacao?: string;
  uf?: string;
  municipio?: string;
  valorMinimo?: number;
  valorMaximo?: number;
  termo?: string;
  pagina?: number;
  tamanhoPagina?: number;
}

export interface ModalidadeContratacao {
  codigo: string;
  descricao: string;
}

export interface SituacaoContratacao {
  codigo: string;
  descricao: string;
}

export interface InstrumentoConvocatorio {
  codigo: string;
  descricao: string;
}
