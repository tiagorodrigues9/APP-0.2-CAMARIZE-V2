import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Iniciando LocalTunnel com URLs fixas...');

// Verificar se o localtunnel está instalado
const checkLT = spawn('lt', ['--version'], { stdio: 'pipe' });

checkLT.on('error', (error) => {
  console.error('❌ LocalTunnel não encontrado. Instale primeiro:');
  console.error('   npm install -g localtunnel');
  process.exit(1);
});

checkLT.on('close', (code) => {
  if (code === 0) {
    console.log('✅ LocalTunnel encontrado, iniciando túneis...');
    startTunnels();
  } else {
    console.error('❌ Erro ao verificar LocalTunnel');
    process.exit(1);
  }
});

function startTunnels() {
  console.log('📋 Configuração:');
  console.log('   - API: http://localhost:4000 → https://camarize-api.loca.lt');
  console.log('   - Frontend: http://localhost:3000 → https://camarize-frontend.loca.lt');
  console.log('');
  console.log('💡 Pressione Ctrl+C para parar os túneis');
  console.log('');

  // Iniciar túnel para API
  const apiTunnel = spawn('lt', ['--port', '4000', '--subdomain', 'camarize-api'], {
    stdio: 'inherit',
    shell: true
  });

  // Iniciar túnel para Frontend
  const frontendTunnel = spawn('lt', ['--port', '3000', '--subdomain', 'camarize-frontend'], {
    stdio: 'inherit',
    shell: true
  });

  // Tratamento de erros
  apiTunnel.on('error', (error) => {
    console.error('❌ Erro no túnel da API:', error.message);
  });

  frontendTunnel.on('error', (error) => {
    console.error('❌ Erro no túnel do Frontend:', error.message);
  });

  // Capturar Ctrl+C para encerrar graciosamente
  process.on('SIGINT', () => {
    console.log('\n🛑 Encerrando túneis...');
    apiTunnel.kill('SIGINT');
    frontendTunnel.kill('SIGINT');
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Encerrando túneis...');
    apiTunnel.kill('SIGTERM');
    frontendTunnel.kill('SIGTERM');
  });
}
