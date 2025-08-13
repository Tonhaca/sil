import { Request, Response } from 'express';
import { listarRecebendoProposta } from '../../lib/pncpService';

export async function handler(req: Request, res: Response) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    console.log('📥 Recebida requisição para /api/pncp/recebendo-proposta', req.query);
    
    const data = await listarRecebendoProposta(req.query);
    
    console.log(`✅ Retornando ${data.conteudo.length} licitações`);
    
    res.status(200).json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
      source: "PNCP"
    });
  } catch (err: any) {
    console.error('❌ Erro na rota recebendo-proposta:', err);
    
    const msg = err?.message ?? "Erro ao consultar PNCP";
    const status = msg.toLowerCase().includes("aaaammdd") || msg.toLowerCase().includes("validation") ? 400 : 502;
    
    res.status(status).json({ 
      success: false,
      error: msg,
      timestamp: new Date().toISOString()
    });
  }
}
