#!/usr/bin/env node

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

console.log('🚀 Iniciando Camarize completo...\n');

// Verificar diretórios
const apiDir = join(process.cwd(), 'api');
const frontDir = join(process.cwd(), 'front-react');

if (!existsSync(apiDir) || !existsSync(frontDir)) {
  console.log('❌ Diretórios não encontrados!');
  process.exit(1);
}

// Função para iniciar processo
function startProcess(command, args, cwd, name) {
  console.log(`▶️  Iniciando ${name}...`);
  
  return spawn(command, args, {
    cwd,
    stdio: 'inherit',
    shell: true
  });
}

// Função principal
async function main() {
  try {
    // 1. Iniciar API
    const api = startProcess('npm', ['start'], apiDir, 'API');
    
    // Aguardar API inicializar
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 2. Iniciar Frontend
    const frontend = startProcess('npm', ['run', 'dev'], frontDir, 'Frontend');
    
    // Aguardar Frontend inicializar
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // 3. Iniciar ngrok
    console.log('\n▶️  Iniciando ngrok...');
    console.log('⏳ Aguarde alguns segundos para o ngrok aparecer...\n');
    
    const ngrok = startProcess(
      'C:\\Users\\joao.kusaka\\AppData\\Roaming\\npm\\ngrok.cmd',
      ['start', '--all', '--config', join(process.cwd(), 'ngrok.yml')],
      process.cwd(),
      'ngrok'
    );
    
    // Aguardar um pouco para o ngrok inicializar
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('\n🎉 Tudo iniciado!');
    console.log('📱 URLs: API (4000), Frontend (3000)');
    console.log('🌐 ngrok: aguarde aparecer as URLs acima');
    console.log('⏹️  Ctrl+C para parar tudo\n');
    
    // Parar tudo com Ctrl+C
    process.on('SIGINT', () => {
      console.log('\n🛑 Parando tudo...');
      [api, frontend, ngrok].forEach(p => p?.kill('SIGINT'));
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

main();
