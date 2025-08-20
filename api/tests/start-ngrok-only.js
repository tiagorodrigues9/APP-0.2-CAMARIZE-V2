#!/usr/bin/env node

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Iniciando ngrok apenas...\n');

// Verificar se o arquivo de configuração existe
function checkConfig() {
  const configPath = path.join(process.cwd(), 'ngrok.yml');
  if (!fs.existsSync(configPath)) {
    console.log('❌ Arquivo ngrok.yml não encontrado!');
    console.log('Execute primeiro: npm run setup-ngrok');
    process.exit(1);
  }
  
  const config = fs.readFileSync(configPath, 'utf8');
  if (config.includes('YOUR_AUTH_TOKEN_HERE')) {
    console.log('❌ Configure seu auth token no arquivo ngrok.yml primeiro!');
    console.log('1. Vá para: https://dashboard.ngrok.com/get-started/your-authtoken');
    console.log('2. Copie seu token');
    console.log('3. Substitua YOUR_AUTH_TOKEN_HERE no ngrok.yml pelo seu token');
    process.exit(1);
  }
  
  console.log('✅ Configuração ngrok.yml encontrada!');
}

// Verificar se ngrok está instalado
function checkNgrok() {
  const ngrokPath = 'C:\\Users\\joao.kusaka\\AppData\\Roaming\\npm\\ngrok.cmd';
  if (!fs.existsSync(ngrokPath)) {
    console.log('❌ ngrok não encontrado!');
    console.log('Execute: npm run setup-ngrok');
    process.exit(1);
  }
  console.log('✅ ngrok encontrado!');
}

// Iniciar ngrok
function startNgrok() {
  console.log('🌐 Iniciando ngrok para API (porta 4000) e Frontend (porta 3000)...\n');
  
  const ngrokPath = 'C:\\Users\\joao.kusaka\\AppData\\Roaming\\npm\\ngrok.cmd';
  const configPath = path.join(process.cwd(), 'ngrok.yml');
  
  const ngrok = spawn(ngrokPath, ['start', '--all', '--config', configPath], {
    stdio: 'inherit',
    shell: true
  });

  console.log('🎉 ngrok iniciado!');
  console.log('🌐 As URLs públicas aparecerão acima');
  console.log('⏹️  Pressione Ctrl+C para parar\n');

  // Parar com Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n🛑 Parando ngrok...');
    ngrok.kill('SIGINT');
    process.exit(0);
  });

  ngrok.on('error', (error) => {
    console.error('❌ Erro ao iniciar ngrok:', error.message);
    process.exit(1);
  });

  ngrok.on('close', (code) => {
    console.log(`\n🔚 ngrok encerrado com código ${code}`);
  });
}

// Função principal
function main() {
  console.log('🔍 Verificando requisitos...\n');
  
  checkConfig();
  checkNgrok();
  
  console.log('\n📋 IMPORTANTE:');
  console.log('Este script executa APENAS o ngrok.');
  console.log('Certifique-se de que a API e Frontend já estão rodando:');
  console.log('- API: http://localhost:4000');
  console.log('- Frontend: http://localhost:3000\n');
  
  console.log('💡 Para iniciar API e Frontend execute em outros terminais:');
  console.log('- cd api && npm start');
  console.log('- cd front-react && npm run dev\n');
  
  startNgrok();
}

main();
