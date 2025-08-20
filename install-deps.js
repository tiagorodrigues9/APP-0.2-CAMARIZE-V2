#!/usr/bin/env node

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

console.log('📦 Instalando dependências da API e Frontend...\n');

// Verificar diretórios
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

// Função para instalar dependências
function installDeps(dir, name) {
  return new Promise((resolve, reject) => {
    console.log(`📦 Instalando dependências do ${name}...`);
    
    const childProcess = spawn('npm', ['install'], {
      cwd: dir,
      stdio: 'inherit',
      shell: true
    });
    
    childProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${name} - Dependências instaladas com sucesso!`);
        resolve();
      } else {
        console.log(`❌ ${name} - Erro ao instalar dependências (código ${code})`);
        reject(new Error(`Erro código ${code}`));
      }
    });
    
    childProcess.on('error', (error) => {
      console.log(`❌ ${name} - Erro:`, error.message);
      reject(error);
    });
  });
}

// Função principal
async function main() {
  try {
    // Instalar dependências da API
    await installDeps(apiDir, 'API');
    
    console.log('\n');
    
    // Instalar dependências do Frontend
    await installDeps(frontDir, 'Frontend');
    
    console.log('\n🎉 Todas as dependências foram instaladas com sucesso!');
    console.log('\n🚀 Agora você pode executar:');
    console.log('   npm run start-simple');
    
  } catch (error) {
    console.error('\n❌ Erro ao instalar dependências:', error.message);
    process.exit(1);
  }
}

main();
