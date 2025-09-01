import mongoose from 'mongoose';

// URL do MongoDB Atlas
const ATLAS_URL = 'mongodb+srv://joaokusaka27:Oi2cWcwnYEzBXL7X@joaocluster.t5exvmz.mongodb.net/camarize?retryWrites=true&w=majority&appName=JoaoCluster';

// API URL
const API_URL = 'http://localhost:4000';

async function testPasswordValidation() {
  try {
    console.log('🧪 Testando validação de senha no registro...\n');

    const testCases = [
      // ✅ Senhas válidas
      {
        name: "Teste Válido 1",
        email: "teste1@teste.com",
        password: "Senha123@",
        expected: "SUCCESS"
      },
      {
        name: "Teste Válido 2", 
        email: "teste2@teste.com",
        password: "MinhaSenha_123",
        expected: "SUCCESS"
      },
      {
        name: "Teste Válido 3",
        email: "teste3@teste.com", 
        password: "abc123*.",
        expected: "SUCCESS"
      },
      {
        name: "Teste Válido 4",
        email: "teste4@teste.com", 
        password: "Minha-Senha_123",
        expected: "SUCCESS"
      },
      
      // ❌ Senhas inválidas
      {
        name: "Senha muito curta",
        email: "teste5@teste.com",
        password: "123",
        expected: "ERROR: A senha deve ter pelo menos 8 caracteres"
      },
      {
        name: "Senha muito longa",
        email: "teste6@teste.com",
        password: "EstaSenhaETaoLongaQueUltrapassaOLimiteDe30Caracteres",
        expected: "ERROR: A senha deve ter no máximo 30 caracteres"
      },
      {
        name: "Caracteres inválidos (espaço)",
        email: "teste7@teste.com",
        password: "Senha 123",
        expected: "ERROR: A senha pode conter apenas letras (A-Z, a-z), números (0-9) e símbolos (@, _, *, ., -)"
      },
      {
        name: "Caracteres inválidos (aspas)",
        email: "teste8@teste.com",
        password: "Senha'123",
        expected: "ERROR: A senha pode conter apenas letras (A-Z, a-z), números (0-9) e símbolos (@, _, *, ., -)"
      },
      {
        name: "Caracteres inválidos (exclamação)",
        email: "teste9@teste.com",
        password: "Senha!123",
        expected: "ERROR: A senha pode conter apenas letras (A-Z, a-z), números (0-9) e símbolos (@, _, *, ., -)"
      }
    ];

    let passedTests = 0;
    let totalTests = testCases.length;

    for (const testCase of testCases) {
      console.log(`📋 Testando: ${testCase.name}`);
      console.log(`   Email: ${testCase.email}`);
      console.log(`   Senha: ${testCase.password}`);
      
      try {
        const response = await fetch(`${API_URL}/users/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            nome: testCase.name,
            email: testCase.email,
            senha: testCase.password,
            foto_perfil: null
          })
        });

        const responseText = await response.text();
        let responseData;
        
        try {
          responseData = JSON.parse(responseText);
        } catch {
          responseData = { error: responseText };
        }

        if (testCase.expected === "SUCCESS") {
          if (response.ok) {
            console.log(`   ✅ PASSOU: Registro realizado com sucesso`);
            passedTests++;
          } else {
            console.log(`   ❌ FALHOU: Esperava sucesso, mas recebeu erro`);
            console.log(`      Status: ${response.status}`);
            console.log(`      Erro: ${responseData.error || responseText}`);
          }
        } else {
          if (!response.ok && responseData.error && responseData.error.includes(testCase.expected.split(": ")[1])) {
            console.log(`   ✅ PASSOU: Erro esperado capturado corretamente`);
            console.log(`      Erro: ${responseData.error}`);
            passedTests++;
          } else {
            console.log(`   ❌ FALHOU: Esperava erro específico, mas recebeu diferente`);
            console.log(`      Status: ${response.status}`);
            console.log(`      Recebido: ${responseData.error || responseText}`);
            console.log(`      Esperado: ${testCase.expected}`);
          }
        }
      } catch (error) {
        console.log(`   ❌ FALHOU: Erro de conexão - ${error.message}`);
      }
      
      console.log(''); // Linha em branco
    }

    console.log(`📊 RESULTADO DOS TESTES:`);
    console.log(`   ✅ Passou: ${passedTests}/${totalTests}`);
    console.log(`   ❌ Falhou: ${totalTests - passedTests}/${totalTests}`);
    console.log(`   📈 Taxa de sucesso: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    if (passedTests === totalTests) {
      console.log('\n🎉 TODOS OS TESTES PASSARAM! A validação de senha está funcionando corretamente!');
    } else {
      console.log('\n⚠️ Alguns testes falharam. Verifique a implementação da validação.');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Função para limpar dados de teste
async function cleanupTestData() {
  try {
    console.log('\n🧹 Limpando dados de teste...');
    
    await mongoose.connect(ATLAS_URL);
    
    // Remover usuários de teste
    const result = await mongoose.connection.db.collection('users').deleteMany({
      email: { $regex: /^teste\d+@teste\.com$/ }
    });
    
    console.log(`🗑️ Removidos ${result.deletedCount} usuários de teste`);
    
    await mongoose.disconnect();
    console.log('✅ Limpeza concluída!');
    
  } catch (error) {
    console.error('❌ Erro na limpeza:', error);
  }
}

// Executar testes
async function runTests() {
  await testPasswordValidation();
  await cleanupTestData();
}

runTests();
