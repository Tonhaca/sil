import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Testando API do SIL...\n');

  try {
    // Teste 1: Health Check
    console.log('1️⃣ Testando Health Check...');
    const health = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Health Check:', health.data);
    console.log('');

    // Teste 2: Frontend
    console.log('2️⃣ Testando Frontend...');
    const frontend = await axios.get(`${BASE_URL}/`);
    console.log('✅ Frontend carregado (status:', frontend.status, ')');
    console.log('');

    console.log('🎉 Todos os testes passaram!');
    console.log('📱 Acesse a aplicação em: http://localhost:3000');
    console.log('🔗 Health Check: http://localhost:3000/api/health');

  } catch (error) {
    console.error('❌ Erro nos testes:', error.message);
  }
}

testAPI();
