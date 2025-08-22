import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Atualizando variáveis de ambiente com URLs fixas...\n');

// URLs fixas do ngrok
const FIXED_URLS = {
  API: 'https://camarize-api.ngrok.io',
  FRONTEND: 'https://camarize-frontend.ngrok.io'
};

// Atualizar arquivo .env do frontend
const frontendEnvPath = path.join(__dirname, 'front-react', '.env.local');
const frontendEnvContent = `# URLs fixas do ngrok
NEXT_PUBLIC_API_URL=${FIXED_URLS.API}
NEXT_PUBLIC_FRONTEND_URL=${FIXED_URLS.FRONTEND}

# Outras configurações
NEXT_PUBLIC_APP_NAME=Camarize
`;

try {
  fs.writeFileSync(frontendEnvPath, frontendEnvContent);
  console.log('✅ Frontend .env.local atualizado!');
  console.log(`   API URL: ${FIXED_URLS.API}`);
  console.log(`   Frontend URL: ${FIXED_URLS.FRONTEND}`);
} catch (error) {
  console.log('⚠️ Erro ao atualizar frontend .env.local:', error.message);
}

// Atualizar arquivo .env da API
const apiEnvPath = path.join(__dirname, 'api', '.env');
const apiEnvContent = `# Configurações do MongoDB Atlas
MONGO_URL=mongodb+srv://joaokusaka27:Oi2cWcwnYEzBXL7X@joaocluster.t5exvmz.mongodb.net/camarize?retryWrites=true&w=majority&appName=JoaoCluster

# Configurações de Email (Gmail)
EMAIL_USER=camarize.alertas@gmail.com
EMAIL_PASS=zscl altx edtz ojkt

# URL do Frontend (fixa)
FRONTEND_URL=${FIXED_URLS.FRONTEND}

# Configurações de Monitoramento Automático
ENABLE_AUTO_MONITORING=true
MONITORING_INTERVAL_MINUTES=5

# Configurações de Validação de Email
VALIDATE_EMAIL_ON_REGISTER=false

# Configurações do Servidor
PORT=4000
NODE_ENV=development

# Chaves VAPID para Push Notifications
VAPID_PUBLIC_KEY=sua_chave_publica_vapid
VAPID_PRIVATE_KEY=sua_chave_privada_vapid
`;

try {
  fs.writeFileSync(apiEnvPath, apiEnvContent);
  console.log('✅ API .env atualizado!');
} catch (error) {
  console.log('⚠️ Erro ao atualizar API .env:', error.message);
}

console.log('\n🎯 URLs fixas configuradas:');
console.log(`   🔗 API: ${FIXED_URLS.API}`);
console.log(`   🔗 Frontend: ${FIXED_URLS.FRONTEND}`);
console.log('\n💡 Agora você pode usar essas URLs sempre!');
