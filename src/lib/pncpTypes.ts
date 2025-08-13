export interface PaginacaoPNCP {
  paginaAtual: number;
  totalPaginas: number;
  totalRegistros: number;
  tamanhoPagina: number;
}

export interface UnidadeGestora {
  nome: string;
  cnpj: string;
  razaoSocial?: string;
  poderId?: string;
  esferaId?: string;
  uf?: string;
  ibge?: string;
}

export interface ContratacaoResumo {
  numeroControlePNCP: string;
  modalidadeId: number;
  modalidadeNome?: string;
  objetoCompra?: string;
  informacaoComplementar?: string;
  orgaoEntidade?: UnidadeGestora;
  dataAberturaProposta?: string;     // AAAA-MM-DDTHH:mm:ssZ ou AAAAMMDD se vier assim
  dataEncerramentoProposta?: string;
  dataPublicacaoPncp?: string;
  linkSistemaOrigem?: string;        // URL do sistema original
  valorTotalEstimado?: number;
  processo?: string;
  numeroCompra?: string;
}

export interface RespostaContratacoes {
  conteudo: ContratacaoResumo[];
  paginacao: PaginacaoPNCP;
}

// Tipos para parâmetros de consulta
export interface PropostaQueryParams {
  modalidade: number;
  dataFinal: string;
  pagina?: number;
  tamanhoPagina?: number;
  todasPaginas?: boolean;
}

export interface PublicadasQueryParams {
  modalidade: number;
  dataInicial: string;
  dataFinal: string;
  pagina?: number;
  tamanhoPagina?: number;
  todasPaginas?: boolean;
}
