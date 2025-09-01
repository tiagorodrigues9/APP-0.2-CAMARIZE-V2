#!/usr/bin/env node

console.log('🚀 Teste Rápido da API');
console.log('======================\n');

// Testa se a API está rodando
import http from 'http';

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/condicoes-ideais',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`📡 Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log(`✅ Resposta: ${jsonData.length || 0} registros`);
    } catch (e) {
      console.log(`📄 Resposta: ${data.substring(0, 100)}...`);
    }
  });
});

req.on('error', (e) => {
  console.log(`❌ Erro: ${e.message}`);
  console.log('\n💡 Certifique-se que a API está rodando:');
  console.log('   cd api && npm start');
});

req.end(); 