import { Request, Response } from 'express';
import { listarPublicadas } from '../../lib/pncpService';

export async function handler(req: Request, res: Response) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    console.log('📥 Recebida requisição para /api/pncp/publicadas', req.query);
    
    const data = await listarPublicadas(req.query);
    
    console.log(`✅ Retornando ${data.conteudo.length} licitações`);
    
    res.status(200).json(data);
  } catch (err: any) {
    console.error('❌ Erro na rota publicadas:', err);
    
    const msg = err?.message ?? "Erro ao consultar PNCP";
    const status = msg.toLowerCase().includes("aaaammdd") || msg.toLowerCase().includes("validation") ? 400 : 502;
    
    res.status(status).json({ 
      success: false,
      error: msg,
      timestamp: new Date().toISOString()
    });
  }
}
