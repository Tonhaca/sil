import { z } from "zod";
import { getContratacoesPropostaRaw, getContratacoesPublicacaoRaw } from "./pncpClient";
import { isYYYYMMDD } from "../utils/date";
import { RespostaContratacoes } from "../types/pncpApi";

const PropostaQuery = z.object({
  modalidade: z.coerce.number().int().min(1).default(6),
  dataFinal: z.string().refine(isYYYYMMDD, "dataFinal deve ser AAAAMMDD").default(() => {
    const d = new Date();
    return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`;
  }),
  pagina: z.coerce.number().int().min(1).default(1),
  tamanhoPagina: z.coerce.number().int().min(10).max(500).default(500),
  todasPaginas: z.coerce.boolean().default(true),
});

const PublicadasQuery = z.object({
  modalidade: z.coerce.number().int().min(1),
  dataInicial: z.string().refine(isYYYYMMDD, "dataInicial deve ser AAAAMMDD"),
  dataFinal: z.string().refine(isYYYYMMDD, "dataFinal deve ser AAAAMMDD"),
  pagina: z.coerce.number().int().min(1).default(1),
  tamanhoPagina: z.coerce.number().int().min(10).max(500).default(500),
  todasPaginas: z.coerce.boolean().default(true),
});

export async function listarRecebendoProposta(qs: unknown): Promise<RespostaContratacoes> {
  const q = PropostaQuery.parse(qs);

  console.log(`🔍 Buscando licitações recebendo proposta: modalidade=${q.modalidade}, dataFinal=${q.dataFinal}`);

  const first = await getContratacoesPropostaRaw({
    dataFinal: q.dataFinal,
    codigoModalidadeContratacao: q.modalidade,
    pagina: q.pagina,
    tamanhoPagina: q.tamanhoPagina,
  });

  const results = Array.isArray(first?.conteudo) ? [...first.conteudo] : [];
  const totalPaginas = first?.paginacao?.totalPaginas ?? 1;

  if (q.todasPaginas && q.pagina === 1 && totalPaginas > 1) {
    console.log(`📄 Buscando ${totalPaginas} páginas de resultados...`);
    for (let p = 2; p <= totalPaginas; p++) {
      console.log(`📄 Buscando página ${p}/${totalPaginas}...`);
      const page = await getContratacoesPropostaRaw({
        dataFinal: q.dataFinal,
        codigoModalidadeContratacao: q.modalidade,
        pagina: p,
        tamanhoPagina: q.tamanhoPagina,
      });
      if (Array.isArray(page?.conteudo)) results.push(...page.conteudo);
    }
  }

  console.log(`✅ Encontradas ${results.length} licitações recebendo proposta`);

  return {
    paginacao: first?.paginacao ?? { 
      paginaAtual: q.pagina, 
      totalPaginas, 
      totalRegistros: results.length, 
      tamanhoPagina: q.tamanhoPagina 
    },
    conteudo: results,
  };
}

export async function listarPublicadas(qs: unknown): Promise<RespostaContratacoes> {
  const q = PublicadasQuery.parse(qs);

  console.log(`🔍 Buscando licitações publicadas: modalidade=${q.modalidade}, período=${q.dataInicial} a ${q.dataFinal}`);

  const first = await getContratacoesPublicacaoRaw({
    dataInicial: q.dataInicial,
    dataFinal: q.dataFinal,
    codigoModalidadeContratacao: q.modalidade,
    pagina: q.pagina,
    tamanhoPagina: q.tamanhoPagina,
  });

  const results = Array.isArray(first?.conteudo) ? [...first.conteudo] : [];
  const totalPaginas = first?.paginacao?.totalPaginas ?? 1;

  if (q.todasPaginas && q.pagina === 1 && totalPaginas > 1) {
    console.log(`📄 Buscando ${totalPaginas} páginas de resultados...`);
    for (let p = 2; p <= totalPaginas; p++) {
      console.log(`📄 Buscando página ${p}/${totalPaginas}...`);
      const page = await getContratacoesPublicacaoRaw({
        dataInicial: q.dataInicial,
        dataFinal: q.dataFinal,
        codigoModalidadeContratacao: q.modalidade,
        pagina: p,
        tamanhoPagina: q.tamanhoPagina,
      });
      if (Array.isArray(page?.conteudo)) results.push(...page.conteudo);
    }
  }

  console.log(`✅ Encontradas ${results.length} licitações publicadas`);

  return {
    paginacao: first?.paginacao ?? { 
      paginaAtual: q.pagina, 
      totalPaginas, 
      totalRegistros: results.length, 
      tamanhoPagina: q.tamanhoPagina 
    },
    conteudo: results,
  };
}
