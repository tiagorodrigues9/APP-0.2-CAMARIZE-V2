import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Iniciando Camarize com ngrok fixo...\n');

// URLs fixas
const FIXED_URLS = {
  API: 'https://camarize-api.ngrok.io',
  FRONTEND: 'https://camarize-frontend.ngrok.io'
};

console.log('🎯 URLs fixas configuradas:');
console.log(`   🔗 API: ${FIXED_URLS.API}`);
console.log(`   🔗 Frontend: ${FIXED_URLS.FRONTEND}\n`);

// Verificar se o arquivo de configuração existe
const configFile = path.join(__dirname, 'ngrok-fixed.yml');
if (!fs.existsSync(configFile)) {
  console.log('❌ Arquivo ngrok-fixed.yml não encontrado!');
  console.log('📝 Criando arquivo de configuração...');
  
  const config = `version: "2"
authtoken: 31YfjYVZPdNKtbIajMOPG8NiUsf_5HyfbZd48iKgXKmshK6jz
tunnels:
  api:
    addr: 4000
    proto: http
    host_header: "localhost:4000"
    subdomain: "camarize-api"
  frontend:
    addr: 3000
    proto: http
    host_header: "localhost:3000"
    subdomain: "camarize-frontend"`;
  
  fs.writeFileSync(configFile, config);
  console.log('✅ Arquivo de configuração criado!');
}

// Iniciar ngrok com configuração fixa
console.log('📡 Iniciando ngrok...');
const ngrok = spawn('ngrok', ['start', '--config', configFile, 'api', 'frontend']);

ngrok.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output);
  
  // Detectar URLs fixas
  if (output.includes('camarize-api.ngrok.io')) {
    console.log('\n🎯 API URL FIXA: https://camarize-api.ngrok.io');
  }
  if (output.includes('camarize-frontend.ngrok.io')) {
    console.log('🎯 FRONTEND URL FIXA: https://camarize-frontend.ngrok.io');
  }
});

ngrok.stderr.on('data', (data) => {
  console.error(`❌ Erro: ${data}`);
});

ngrok.on('close', (code) => {
  console.log(`\n🔌 Ngrok encerrado com código: ${code}`);
});

// Tratar interrupção
process.on('SIGINT', () => {
  console.log('\n🛑 Encerrando ngrok...');
  ngrok.kill('SIGINT');
  process.exit(0);
});




