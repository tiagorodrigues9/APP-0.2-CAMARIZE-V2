import fs from 'fs';

// Ler o arquivo .env atual
const envPath = './.env';
let envContent = '';

try {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('📄 Arquivo .env atual:');
  console.log(envContent);
} catch (error) {
  console.log('❌ Erro ao ler arquivo .env:', error.message);
  process.exit(1);
}

// Adicionar configurações de email se não existirem
const emailConfigs = [
  '',
  '# Configurações de Email (Gmail)',
  'EMAIL_USER=camarize.alertas@gmail.com',
  'EMAIL_PASS=sua_senha_de_app_do_gmail',
  '',
  '# Configurações de Monitoramento Automático',
  'ENABLE_AUTO_MONITORING=true',
  'MONITORING_INTERVAL_MINUTES=5'
];

// Verificar se as configurações já existem
const hasEmailUser = envContent.includes('EMAIL_USER=');
const hasEmailPass = envContent.includes('EMAIL_PASS=');
const hasMonitoring = envContent.includes('ENABLE_AUTO_MONITORING=');

if (!hasEmailUser || !hasEmailPass || !hasMonitoring) {
  console.log('\n🔧 Adicionando configurações de email...');
  
  // Adicionar as configurações
  const newContent = envContent + emailConfigs.join('\n');
  
  try {
    fs.writeFileSync(envPath, newContent, 'utf8');
    console.log('✅ Configurações adicionadas com sucesso!');
    console.log('\n📄 Novo conteúdo do arquivo .env:');
    console.log(newContent);
    
    console.log('\n💡 PRÓXIMOS PASSOS:');
    console.log('1. Substitua "sua_senha_de_app_do_gmail" pela senha real gerada pelo Google');
    console.log('2. Execute: node test-email-config.js');
    
  } catch (error) {
    console.log('❌ Erro ao escrever arquivo .env:', error.message);
  }
} else {
  console.log('✅ Configurações de email já existem no arquivo .env');
  console.log('\n💡 Verifique se EMAIL_PASS está com a senha correta');
}
