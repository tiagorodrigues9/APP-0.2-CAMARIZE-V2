#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Configurando ngrok para acesso externo...\n');

// Verificar se o ngrok está instalado
function checkNgrok() {
  try {
    execSync('ngrok version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

// Instalar ngrok se não estiver instalado
function installNgrok() {
  console.log('📦 Instalando ngrok...');
  try {
    execSync('npm install -g ngrok', { stdio: 'inherit' });
    console.log('✅ ngrok instalado com sucesso!\n');
  } catch (error) {
    console.log('❌ Erro ao instalar ngrok. Tente instalar manualmente:');
    console.log('   npm install -g ngrok');
    console.log('   ou baixe de: https://ngrok.com/download\n');
    process.exit(1);
  }
}

// Criar arquivo de configuração do ngrok
function createNgrokConfig() {
  const configPath = path.join(process.cwd(), 'ngrok.yml');
  const config = `version: "2"
authtoken: 31YfjYVZPdNKtbIajMOPG8NiUsf_5HyfbZd48iKgXKmshK6jz
tunnels:
  api:
    addr: 4000
    proto: http
    subdomain: camarize-api
  frontend:
    addr: 3000
    proto: http
    subdomain: camarize-frontend
`;

  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, config);
    console.log('📝 Arquivo de configuração ngrok.yml criado!');
    console.log('🔑 Adicione seu auth token no arquivo ngrok.yml\n');
  }
}

// Função principal
function main() {
  console.log('🔍 Verificando se ngrok está instalado...');
  
  if (!checkNgrok()) {
    console.log('❌ ngrok não encontrado!');
    installNgrok();
  } else {
    console.log('✅ ngrok já está instalado!\n');
  }

  createNgrokConfig();

  console.log('📋 PRÓXIMOS PASSOS:');
  console.log('1. Crie uma conta em https://ngrok.com');
  console.log('2. Obtenha seu auth token em https://dashboard.ngrok.com/get-started/your-authtoken');
  console.log('3. Substitua YOUR_AUTH_TOKEN_HERE no arquivo ngrok.yml pelo seu token');
  console.log('4. Execute: npm run start-ngrok\n');

  console.log('🚀 Para iniciar os túneis:');
  console.log('   npm run start-ngrok-api    # Para a API (porta 4000)');
  console.log('   npm run start-ngrok-front  # Para o Frontend (porta 3000)');
  console.log('   npm run start-ngrok-both   # Para ambos simultaneamente\n');
}

main();
