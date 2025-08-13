#!/usr/bin/env node

import axios from 'axios';

async function testServer() {
  console.log('🧪 Testando servidor SIL...\n');

  try {
    // Teste 1: Health Check
    console.log('1️⃣ Testando Health Check...');
    const healthResponse = await axios.get('http://localhost:3000/api/health');
    console.log('✅ Health Check:', healthResponse.data);

    // Teste 2: Frontend
    console.log('\n2️⃣ Testando Frontend...');
    const frontendResponse = await axios.get('http://localhost:3000/');
    console.log(`✅ Frontend carregado (status: ${frontendResponse.status})`);

    // Teste 3: Verificar se é uma página React
    const isReact = frontendResponse.data.includes('React') || 
                   frontendResponse.data.includes('root') ||
                   frontendResponse.data.includes('vite');
    
    if (isReact) {
      console.log('✅ Página React detectada');
    } else {
      console.log('⚠️  Página não parece ser React (pode ser normal em dev)');
    }

    console.log('\n🎉 Todos os testes passaram!');
    console.log('📱 Acesse a aplicação em: http://localhost:3000');
    console.log('🔗 Health Check: http://localhost:3000/api/health');
    console.log('\n💡 Para parar o servidor: Ctrl+C');

  } catch (error) {
    console.error('❌ Erro nos testes:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Dica: Certifique-se de que o servidor está rodando:');
      console.log('   npm run start:dev');
    }
  }
}

testServer();
