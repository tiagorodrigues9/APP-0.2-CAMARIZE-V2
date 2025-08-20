// Exemplo de como usar a validação de email no projeto Camarize

import emailService from '../services/emailService.js';

// Exemplo 1: Validar um email específico
async function validarEmailExemplo() {
  const email = 'joao@gmail.com';
  
  console.log(`🔍 Validando email: ${email}`);
  
  const resultado = await emailService.validateEmailForSettings(email);
  
  if (resultado.valid) {
    console.log(`✅ Email válido: ${resultado.message}`);
    if (resultado.warning) {
      console.log(`⚠️ Aviso: ${resultado.message}`);
    }
  } else {
    console.log(`❌ Email inválido: ${resultado.message}`);
  }
}

// Exemplo 2: Verificar se email existe (verificação mais profunda)
async function verificarExistenciaEmail() {
  const emails = [
    'joao@gmail.com',
    'maria@hotmail.com',
    'teste@dominioinexistente.com',
    'emailinvalido'
  ];
  
  console.log('🔍 Verificando existência de emails...');
  
  for (const email of emails) {
    const resultado = await emailService.verifyEmailExists(email);
    
    console.log(`📧 ${email}:`);
    console.log(`   Existe: ${resultado.exists}`);
    console.log(`   Motivo: ${resultado.reason}`);
    console.log('---');
  }
}

// Exemplo 3: Validar múltiplos emails de uma vez
async function validarMultiplosEmails() {
  const emails = [
    'joao@gmail.com',
    'maria@hotmail.com',
    'admin@camarize.com.br'
  ];
  
  console.log('🔍 Validando múltiplos emails...');
  
  const resultados = await emailService.verifyMultipleEmails(emails);
  
  resultados.forEach(resultado => {
    const status = resultado.exists === true ? '✅' : 
                   resultado.exists === 'unknown' ? '⚠️' : '❌';
    
    console.log(`${status} ${resultado.email}: ${resultado.reason}`);
  });
}

// Exemplo 4: Como usar via API REST
/*
POST /api/email/validate
Content-Type: application/json
Authorization: Bearer seu_token_aqui

{
  "email": "joao@gmail.com"
}

Resposta esperada:
{
  "success": true,
  "validation": {
    "valid": true,
    "message": "Email válido e verificado"
  }
}
*/

// Exemplo 5: Validação automática ao atualizar configurações
/*
PUT /api/email/settings
Content-Type: application/json
Authorization: Bearer seu_token_aqui

{
  "emailAddress": "novo.email@gmail.com",
  "emailEnabled": true,
  "alertTypes": {
    "temperatura": {
      "enabled": true,
      "severity": {
        "alta": true,
        "media": true,
        "baixa": false
      }
    }
  }
}

O sistema automaticamente:
1. Valida o email antes de salvar
2. Retorna erro se o email for inválido
3. Salva apenas se o email for válido
*/

// Executar exemplos
async function executarExemplos() {
  console.log('🚀 Iniciando exemplos de validação de email...\n');
  
  try {
    await validarEmailExemplo();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await verificarExistenciaEmail();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await validarMultiplosEmails();
    
  } catch (error) {
    console.error('❌ Erro ao executar exemplos:', error);
  }
}

// Descomente a linha abaixo para executar os exemplos
// executarExemplos();

export {
  validarEmailExemplo,
  verificarExistenciaEmail,
  validarMultiplosEmails,
  executarExemplos
};


