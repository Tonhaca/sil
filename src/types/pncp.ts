// Tipos baseados na documentação da API do PNCP

export interface PNCPResponse<T> {
  data: T[];
  paginacao: {
    paginaAtual: number;
    totalPaginas: number;
    totalRegistros: number;
    tamanhoPagina: number;
  };
}

export interface Contratacao {
  idContratacao: string;
  numeroContratacao: string;
  objetoContratacao: string;
  dataPublicacao: string;
  dataAbertura: string;
  valorEstimado: number;
  unidadeGestora: {
    codigo: string;
    nome: string;
    uf: string;
    municipio: string;
  };
  modalidadeContratacao: string;
  situacaoContratacao: string;
  instrumentoConvocatorio: string;
  linkEdital: string;
  linkSistema: string;
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
  codigo: number;
  nome: string;
}

export interface SituacaoContratacao {
  codigo: string;
  nome: string;
}

export interface InstrumentoConvocatorio {
  codigo: string;
  nome: string;
}
