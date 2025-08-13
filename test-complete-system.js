#!/usr/bin/env node

import axios from 'axios';

async function testCompleteSystem() {
  console.log('🧪 Testando Sistema SIL Completo...\n');

  try {
    // Teste 1: Backend direto
    console.log('1️⃣ Testando Backend (porta 3000)...');
    const backendHealth = await axios.get('http://localhost:3000/api/health');
    console.log('✅ Backend Health:', backendHealth.data);

    // Teste 2: Frontend via proxy
    console.log('\n2️⃣ Testando Frontend via Proxy (porta 5173)...');
    const frontendHealth = await axios.get('http://localhost:5173/api/health');
    console.log('✅ Frontend Health via Proxy:', frontendHealth.data);

    // Teste 3: Frontend React
    console.log('\n3️⃣ Testando Frontend React...');
    const frontendResponse = await axios.get('http://localhost:5173/');
    const isReact = frontendResponse.data.includes('React') || 
                   frontendResponse.data.includes('SIL') ||
                   frontendResponse.data.includes('vite');
    
    if (isReact) {
      console.log('✅ Frontend React carregado corretamente');
    } else {
      console.log('⚠️  Frontend não parece ser React');
    }

    // Teste 4: API PNCP via proxy
    console.log('\n4️⃣ Testando API PNCP via Proxy...');
    try {
      const pncpResponse = await axios.get('http://localhost:5173/api/pncp/recebendo-proposta', {
        params: {
          modalidade: 6,
          pagina: 1,
          tamanhoPagina: 10
        }
      });
      console.log('✅ API PNCP via Proxy:', pncpResponse.data);
    } catch (error) {
      console.log('⚠️  API PNCP com erro (pode ser normal):', error.response?.status, error.response?.data?.error);
    }

    // Teste 5: Verificar processos
    console.log('\n5️⃣ Verificando processos...');
    const { execSync } = await import('child_process');
    try {
      const viteProcess = execSync('lsof -i :5173', { encoding: 'utf8' });
      console.log('✅ Vite rodando na porta 5173');
    } catch {
      console.log('❌ Vite não encontrado na porta 5173');
    }

    try {
      const backendProcess = execSync('lsof -i :3000', { encoding: 'utf8' });
      console.log('✅ Backend rodando na porta 3000');
    } catch {
      console.log('❌ Backend não encontrado na porta 3000');
    }

    console.log('\n🎉 Teste do Sistema Completo Concluído!');
    console.log('\n📱 Links para acesso:');
    console.log('   Frontend: http://localhost:5173');
    console.log('   Backend: http://localhost:3000');
    console.log('   Health Check: http://localhost:5173/api/health');
    console.log('\n💡 Para parar os servidores: Ctrl+C');

  } catch (error) {
    console.error('❌ Erro nos testes:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Dicas:');
      console.log('   1. Certifique-se de que o backend está rodando: npm run start:dev');
      console.log('   2. Certifique-se de que o frontend está rodando: npm run dev');
      console.log('   3. Verifique se as portas 3000 e 5173 estão livres');
    }
  }
}

testCompleteSystem();
