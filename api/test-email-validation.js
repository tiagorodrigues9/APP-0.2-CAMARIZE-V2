import emailService from './services/emailService.js';

async function testEmailValidation() {
  console.log('🧪 Testando validação de email...\n');
  
  const testEmails = [
    'teste@gmail.com',
    'usuario@yahoo.com',
    'invalid-email',
    'teste@dominioinexistente123456.com',
    'camarize.fatec04@gmail.com'
  ];
  
  for (const email of testEmails) {
    console.log(`📧 Testando: ${email}`);
    
    try {
      const startTime = Date.now();
      const result = await emailService.validateEmailForSettings(email);
      const endTime = Date.now();
      
      console.log(`   ⏱️  Tempo: ${endTime - startTime}ms`);
      console.log(`   ✅ Válido: ${result.valid}`);
      console.log(`   📝 Mensagem: ${result.message}`);
      if (result.warning) {
        console.log(`   ⚠️  Aviso: ${result.warning}`);
      }
      console.log('');
      
    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}`);
      console.log('');
    }
  }
  
  console.log('🎉 Teste concluído!');
}

testEmailValidation();
