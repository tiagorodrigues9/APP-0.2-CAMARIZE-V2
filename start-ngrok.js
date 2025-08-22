import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Iniciando ngrok...');

// Verificar se o ngrok está instalado
const checkNgrok = spawn('./ngrok.exe', ['version'], { stdio: 'pipe' });

checkNgrok.on('error', (error) => {
  console.error('❌ Ngrok não encontrado. Instale o ngrok primeiro:');
  console.error('   https://ngrok.com/download');
  process.exit(1);
});

checkNgrok.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Ngrok encontrado, iniciando túneis...');
    startNgrok();
  } else {
    console.error('❌ Erro ao verificar versão do ngrok');
    process.exit(1);
  }
});

function startNgrok() {
  // Usar o arquivo de configuração fixo para URLs estáveis
  const configFile = path.join(__dirname, 'ngrok-fixed.yml');
  
  const ngrok = spawn('./ngrok.exe', ['start', '--config', configFile, 'api', 'frontend'], {
    stdio: 'inherit',
    shell: true
  });

  ngrok.on('error', (error) => {
    console.error('❌ Erro ao iniciar ngrok:', error.message);
    process.exit(1);
  });

  ngrok.on('close', (code) => {
    if (code !== 0) {
      console.error(`❌ Ngrok encerrado com código ${code}`);
    } else {
      console.log('✅ Ngrok encerrado normalmente');
    }
  });

  // Capturar Ctrl+C para encerrar graciosamente
  process.on('SIGINT', () => {
    console.log('\n🛑 Encerrando ngrok...');
    ngrok.kill('SIGINT');
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Encerrando ngrok...');
    ngrok.kill('SIGTERM');
  });
}

console.log('📋 Configuração:');
console.log('   - API: http://localhost:4000 → https://camarize-api.ngrok.io');
console.log('   - Frontend: http://localhost:3000 → https://camarize-frontend.ngrok.io');
console.log('');
console.log('💡 Pressione Ctrl+C para parar o ngrok');
