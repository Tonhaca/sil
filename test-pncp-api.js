#!/usr/bin/env node

import axios from 'axios';

async function testPNCPAPI() {
  console.log('🧪 Testando API do PNCP diretamente...\n');

  const PNCP_BASE = "https://pncp.gov.br/api/consulta";
  
  try {
    // Teste 1: Health check da API do PNCP
    console.log('1️⃣ Testando health check do PNCP...');
    const healthResponse = await axios.get(`${PNCP_BASE}/v1/contratacoes/proposta`, {
      params: {
        codigoModalidadeContratacao: 6,
        dataFinal: '20250813',
        pagina: 1,
        tamanhoPagina: 10
      },
      timeout: 10000
    });
    
    console.log('✅ Resposta do PNCP:', JSON.stringify(healthResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Erro ao testar PNCP:', error.response?.status, error.response?.data || error.message);
    
    if (error.response?.status === 400) {
      console.log('\n🔍 Detalhes do erro 400:');
      console.log('Headers:', error.response.headers);
      console.log('Data:', error.response.data);
    }
  }
}

testPNCPAPI();
