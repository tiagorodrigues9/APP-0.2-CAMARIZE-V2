#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🧪 Testando configuração do ngrok...\n');

// Verificar se o arquivo de configuração existe
function checkConfig() {
  if (!fs.existsSync('ngrok.yml')) {
    console.log('❌ Arquivo ngrok.yml não encontrado!');
    console.log('Execute: npm run setup-ngrok');
    return false;
  }
  
  const config = fs.readFileSync('ngrok.yml', 'utf8');
  if (config.includes('YOUR_AUTH_TOKEN_HERE')) {
    console.log('⚠️  Auth token não configurado!');
    console.log('Edite o arquivo ngrok.yml e adicione seu token');
    return false;
  }
  
  console.log('✅ Arquivo de configuração OK');
  return true;
}

// Verificar se o ngrok está instalado
function checkNgrok() {
  try {
    const version = execSync('ngrok version', { encoding: 'utf8' });
    console.log('✅ ngrok instalado:', version.trim());
    return true;
  } catch (error) {
    console.log('❌ ngrok não encontrado!');
    console.log('Execute: npm install -g ngrok');
    return false;
  }
}

// Verificar se as portas estão disponíveis
async function checkPorts() {
  const ports = [3000, 4000];
  
  for (const port of ports) {
    try {
      // Tentar conectar na porta para ver se está em uso
      const net = await import('net');
      const client = new net.Socket();
      
      return new Promise((resolve) => {
        client.connect(port, 'localhost', () => {
          console.log(`✅ Porta ${port} está em uso (serviço rodando)`);
          client.destroy();
          resolve(true);
        });
        
        client.on('error', () => {
          console.log(`⚠️  Porta ${port} não está em uso`);
          console.log(`   Para API: npm run dev-api`);
          console.log(`   Para Frontend: npm run dev-front`);
          client.destroy();
          resolve(false);
        });
      });
    } catch (error) {
      console.log(`❌ Erro ao verificar porta ${port}`);
      return false;
    }
  }
}

// Função principal
async function main() {
  console.log('🔍 Verificando configuração...\n');
  
  const configOk = checkConfig();
  const ngrokOk = checkNgrok();
  
  console.log('\n🚀 PRÓXIMOS PASSOS:');
  
  if (!configOk || !ngrokOk) {
    console.log('1. Configure o auth token no ngrok.yml');
    console.log('2. Instale o ngrok se necessário');
    console.log('3. Execute novamente este teste');
    return;
  }
  
  console.log('1. Inicie os serviços:');
  console.log('   npm run dev-api     # Para API');
  console.log('   npm run dev-front   # Para Frontend');
  console.log('   npm run dev-both    # Para ambos');
  
  console.log('\n2. Em outro terminal, inicie o ngrok:');
  console.log('   npm run start-ngrok-api    # Para API');
  console.log('   npm run start-ngrok-front  # Para Frontend');
  console.log('   npm run start-ngrok-both   # Para ambos');
  
  console.log('\n3. Use a URL fornecida pelo ngrok no seu celular!');
  console.log('\n📖 Para mais detalhes, consulte: NGROK_SETUP.md');
}

main().catch(console.error);
