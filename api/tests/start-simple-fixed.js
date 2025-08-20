#!/usr/bin/env node

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

console.log('🚀 Iniciando Camarize completo (API + Frontend + ngrok)...\n');

// Verificar se os diretórios existem
const apiDir = join(process.cwd(), 'api');
const frontDir = join(process.cwd(), 'front-react');

if (!existsSync(apiDir)) {
  console.log('❌ Diretório da API não encontrado!');
  process.exit(1);
}

if (!existsSync(frontDir)) {
  console.log('❌ Diretório do Frontend não encontrado!');
  process.exit(1);
}

// Verificar se package.json existem
const apiPackage = join(apiDir, 'package.json');
const frontPackage = join(frontDir, 'package.json');

if (!existsSync(apiPackage)) {
  console.log('❌ package.json da API não encontrado!');
  process.exit(1);
}

if (!existsSync(frontPackage)) {
  console.log('❌ package.json do Frontend não encontrado!');
  process.exit(1);
}

console.log('✅ Diretórios e arquivos verificados!\n');

// Comando para executar tudo usando concurrently
const command = 'npx';
const args = [
  'concurrently',
  '--kill-others',
  '--prefix-colors', 'cyan,magenta,green',
  '--names', 'API,Frontend,ngrok',
  'npm run dev-api',
  'npm run dev-front', 
  'npm run start-ngrok-single'
];

console.log('📋 Executando comandos:');
console.log('   • API: npm run dev-api');
console.log('   • Frontend: npm run dev-front');
console.log('   • ngrok: npm run start-ngrok-single');
console.log('\n⏳ Iniciando...\n');

const childProcess = spawn(command, args, {
  stdio: 'inherit',
  shell: true
});

childProcess.on('close', (code) => {
  console.log(`\n🛑 Processo finalizado com código ${code}`);
});

childProcess.on('SIGINT', () => {
  console.log('\n🛑 Interrompendo todos os serviços...');
  childProcess.kill('SIGINT');
});
