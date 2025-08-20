#!/usr/bin/env node

import { spawn } from 'child_process';
import net from 'net';

console.log('🔍 Verificando se os serviços estão rodando...\n');

// Função para verificar se uma porta está em uso
function checkPort(port, serviceName) {
  return new Promise((resolve) => {
    const client = new net.Socket();
    
    client.connect(port, 'localhost', () => {
      console.log(`✅ ${serviceName} está rodando na porta ${port}`);
      client.destroy();
      resolve(true);
    });
    
    client.on('error', () => {
      console.log(`❌ ${serviceName} NÃO está rodando na porta ${port}`);
      console.log(`   Execute: npm run dev-${serviceName.toLowerCase()}`);
      client.destroy();
      resolve(false);
    });
    
    // Timeout de 3 segundos
    setTimeout(() => {
      console.log(`⏰ Timeout ao verificar ${serviceName} na porta ${port}`);
      client.destroy();
      resolve(false);
    }, 3000);
  });
}

// Função principal
async function main() {
  console.log('📋 Verificando serviços...\n');
  
  const apiRunning = await checkPort(4000, 'API');
  const frontendRunning = await checkPort(3000, 'Frontend');
  
  console.log('\n📊 Status dos serviços:');
  console.log(`   API (porta 4000): ${apiRunning ? '✅ Rodando' : '❌ Parado'}`);
  console.log(`   Frontend (porta 3000): ${frontendRunning ? '✅ Rodando' : '❌ Parado'}`);
  
  console.log('\n🚀 Recomendações:');
  
  if (!apiRunning && !frontendRunning) {
    console.log('   • Nenhum serviço está rodando');
    console.log('   • Execute: npm run start-simple (recomendado)');
    console.log('   • OU execute: npm run dev-both');
  } else if (!apiRunning) {
    console.log('   • API não está rodando');
    console.log('   • Execute: npm run dev-api');
  } else if (!frontendRunning) {
    console.log('   • Frontend não está rodando');
    console.log('   • Execute: npm run dev-front');
  } else {
    console.log('   • Todos os serviços estão rodando!');
    console.log('   • Pode iniciar o ngrok: npm run start-ngrok-both');
  }
  
  console.log('\n💡 Dica: Use "npm run start-simple" para iniciar tudo automaticamente!');
}

main().catch(console.error);
