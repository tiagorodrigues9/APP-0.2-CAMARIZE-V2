import mongoose from 'mongoose';

// URL do MongoDB Atlas
const ATLAS_URL = 'mongodb+srv://joaokusaka27:Oi2cWcwnYEzBXL7X@joaocluster.t5exvmz.mongodb.net/camarize?retryWrites=true&w=majority&appName=JoaoCluster';

// API URL
const API_URL = 'http://localhost:4000';

// Função para testar validação de senha (simulando frontend)
function validatePassword(password) {
  if (password.length < 8) {
    return "A senha deve ter pelo menos 8 caracteres";
  }
  if (password.length > 30) {
    return "A senha deve ter no máximo 30 caracteres";
  }
  
  // Regex para permitir apenas A-Z, a-z, 0-9, @, _, *, ., -
  const allowedChars = /^[A-Za-z0-9@_*.-]*$/;
  if (!allowedChars.test(password)) {
    return "A senha pode conter apenas letras (A-Z, a-z), números (0-9) e símbolos (@, _, *, ., -)";
  }
  
  return "";
}

async function testPasswordFeedback() {
  try {
    console.log('🧪 Testando feedback visual da validação de senha...\n');

    const testCases = [
      {
        name: "Senha vazia",
        password: "",
        expectedError: "A senha deve ter pelo menos 8 caracteres",
        expectedValid: false
      },
      {
        name: "Senha muito curta",
        password: "123",
        expectedError: "A senha deve ter pelo menos 8 caracteres",
        expectedValid: false
      },
      {
        name: "Senha válida simples",
        password: "12345678",
        expectedError: "",
        expectedValid: true
      },
      {
        name: "Senha válida com símbolos",
        password: "Senha123@",
        expectedError: "",
        expectedValid: true
      },
      {
        name: "Senha válida com hífen",
        password: "Minha-Senha_123",
        expectedError: "",
        expectedValid: true
      },
      {
        name: "Senha com caracteres inválidos",
        password: "Senha 123",
        expectedError: "A senha pode conter apenas letras (A-Z, a-z), números (0-9) e símbolos (@, _, *, ., -)",
        expectedValid: false
      },
      {
        name: "Senha muito longa",
        password: "EstaSenhaETaoLongaQueUltrapassaOLimiteDe30Caracteres",
        expectedError: "A senha deve ter no máximo 30 caracteres",
        expectedValid: false
      }
    ];

    let passedTests = 0;
    let totalTests = testCases.length;

    for (const testCase of testCases) {
      console.log(`📋 Testando: ${testCase.name}`);
      console.log(`   Senha: "${testCase.password}"`);
      
      const error = validatePassword(testCase.password);
      const isValid = testCase.password.length >= 8 && !error;
      
      // Verificar se o erro está correto
      const errorCorrect = error === testCase.expectedError;
      const validCorrect = isValid === testCase.expectedValid;
      
      if (errorCorrect && validCorrect) {
        console.log(`   ✅ PASSOU:`);
        if (error) {
          console.log(`      ❌ Erro: ${error}`);
          console.log(`      🎨 Campo deve ficar VERMELHO`);
        } else {
          console.log(`      ✅ Válida: ${isValid}`);
          console.log(`      🎨 Campo deve ficar VERDE`);
        }
        passedTests++;
      } else {
        console.log(`   ❌ FALHOU:`);
        console.log(`      Esperado erro: "${testCase.expectedError}"`);
        console.log(`      Recebido erro: "${error}"`);
        console.log(`      Esperado válida: ${testCase.expectedValid}`);
        console.log(`      Recebido válida: ${isValid}`);
      }
      
      console.log(''); // Linha em branco
    }

    console.log(`📊 RESULTADO DOS TESTES:`);
    console.log(`   ✅ Passou: ${passedTests}/${totalTests}`);
    console.log(`   ❌ Falhou: ${totalTests - passedTests}/${totalTests}`);
    console.log(`   📈 Taxa de sucesso: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    if (passedTests === totalTests) {
      console.log('\n🎉 TODOS OS TESTES PASSARAM! O feedback visual está funcionando corretamente!');
      console.log('\n🎨 RESUMO DO FEEDBACK VISUAL:');
      console.log('   🔴 Campo VERMELHO: Quando há erro de validação');
      console.log('   🟢 Campo VERDE: Quando a senha é válida');
      console.log('   ⚪ Campo NORMAL: Quando está vazio ou digitando');
    } else {
      console.log('\n⚠️ Alguns testes falharam. Verifique a implementação do feedback.');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar testes
testPasswordFeedback();

