import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listarRecebendoProposta, listarPublicadas } from '../src/lib/pncpService';
import { getContratacoesPropostaRaw, getContratacoesPublicacaoRaw } from '../src/lib/pncpClient';

// Mock do cliente PNCP
vi.mock('../src/lib/pncpClient', () => ({
  getContratacoesPropostaRaw: vi.fn(),
  getContratacoesPublicacaoRaw: vi.fn(),
}));

describe('PNCP Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listarRecebendoProposta', () => {
    it('should fetch licitações recebendo proposta with default params', async () => {
      const mockResponse = {
        conteudo: [
          {
            numeroControlePNCP: '123456',
            modalidadeId: 6,
            objetoCompra: 'Teste',
            orgaoEntidade: { nome: 'Órgão Teste', cnpj: '12345678901234' }
          }
        ],
        paginacao: {
          paginaAtual: 1,
          totalPaginas: 1,
          totalRegistros: 1,
          tamanhoPagina: 500
        }
      };

      vi.mocked(getContratacoesPropostaRaw).mockResolvedValue(mockResponse);

      const result = await listarRecebendoProposta({});

      expect(getContratacoesPropostaRaw).toHaveBeenCalledWith({
        dataFinal: expect.stringMatching(/^\d{8}$/), // AAAAMMDD format
        codigoModalidadeContratacao: 6,
        pagina: 1,
        tamanhoPagina: 500
      });

      expect(result.conteudo).toHaveLength(1);
      expect(result.conteudo[0].numeroControlePNCP).toBe('123456');
    });

    it('should handle pagination correctly', async () => {
      const mockResponse1 = {
        conteudo: [{ numeroControlePNCP: '1', modalidadeId: 6, objetoCompra: 'Item 1' }],
        paginacao: { paginaAtual: 1, totalPaginas: 2, totalRegistros: 2, tamanhoPagina: 1 }
      };

      const mockResponse2 = {
        conteudo: [{ numeroControlePNCP: '2', modalidadeId: 6, objetoCompra: 'Item 2' }],
        paginacao: { paginaAtual: 2, totalPaginas: 2, totalRegistros: 2, tamanhoPagina: 1 }
      };

      vi.mocked(getContratacoesPropostaRaw)
        .mockResolvedValueOnce(mockResponse1)
        .mockResolvedValueOnce(mockResponse2);

      const result = await listarRecebendoProposta({ todasPaginas: true });

      expect(getContratacoesPropostaRaw).toHaveBeenCalledTimes(2);
      expect(result.conteudo).toHaveLength(2);
    });

    it('should validate modalidade parameter', async () => {
      await expect(listarRecebendoProposta({ modalidade: 0 }))
        .rejects.toThrow();
    });

    it('should validate dataFinal format', async () => {
      await expect(listarRecebendoProposta({ dataFinal: '2025-08-13' }))
        .rejects.toThrow('dataFinal deve ser AAAAMMDD');
    });
  });

  describe('listarPublicadas', () => {
    it('should fetch licitações publicadas with required params', async () => {
      const mockResponse = {
        conteudo: [
          {
            numeroControlePNCP: '789012',
            modalidadeId: 4,
            objetoCompra: 'Teste Publicadas',
            orgaoEntidade: { nome: 'Órgão Teste', cnpj: '12345678901234' }
          }
        ],
        paginacao: {
          paginaAtual: 1,
          totalPaginas: 1,
          totalRegistros: 1,
          tamanhoPagina: 500
        }
      };

      vi.mocked(getContratacoesPublicacaoRaw).mockResolvedValue(mockResponse);

      const result = await listarPublicadas({
        modalidade: 4,
        dataInicial: '20250801',
        dataFinal: '20250813'
      });

      expect(getContratacoesPublicacaoRaw).toHaveBeenCalledWith({
        dataInicial: '20250801',
        dataFinal: '20250813',
        codigoModalidadeContratacao: 4,
        pagina: 1,
        tamanhoPagina: 500
      });

      expect(result.conteudo).toHaveLength(1);
    });

    it('should require modalidade parameter', async () => {
      await expect(listarPublicadas({ dataInicial: '20250801', dataFinal: '20250813' }))
        .rejects.toThrow();
    });

    it('should validate date formats', async () => {
      await expect(listarPublicadas({
        modalidade: 4,
        dataInicial: '2025-08-01',
        dataFinal: '2025-08-13'
      })).rejects.toThrow('dataInicial deve ser AAAAMMDD');
    });
  });
});
