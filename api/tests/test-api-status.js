#!/usr/bin/env node

import axios from 'axios';

console.log('🔍 Testando Status da API');
console.log('========================\n');

const apiUrl = 'http://localhost:4000';

async function testEndpoint(endpoint, description) {
  try {
    console.log(`📡 Testando: ${description}`);
    const response = await axios.get(`${apiUrl}${endpoint}`);
    console.log(`✅ Status: ${response.status} - OK`);
    console.log(`📊 Dados: ${response.data.length || 0} registros\n`);
  } catch (error) {
    console.log(`❌ Erro: ${error.response?.status || 'Sem resposta'}`);
    console.log(`💬 Mensagem: ${error.response?.data?.error || error.message}\n`);
  }
}

async function testAll() {
  console.log('🚀 Iniciando testes...\n');
  
  await testEndpoint('/fazendas', 'Fazendas');
  await testEndpoint('/tipos-camarao', 'Tipos de Camarão');
  await testEndpoint('/sensores', 'Sensores');
  await testEndpoint('/condicoes-ideais', 'Condições Ideais');
  await testEndpoint('/cativeiros', 'Cativeiros');
  
  console.log('🏁 Testes concluídos!');
}

testAll().catch(console.error); 