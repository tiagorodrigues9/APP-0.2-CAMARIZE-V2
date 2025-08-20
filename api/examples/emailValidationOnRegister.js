// Exemplo de como funciona a validação de email no cadastro de usuários

/*
Quando um usuário tenta se cadastrar, o sistema agora:

1. ✅ Verifica se o email já existe no banco
2. 🔍 Valida se o email realmente existe (formato + domínio + SMTP)
3. 📧 Só permite o cadastro se o email for válido

Exemplos de cenários:

=== CENÁRIO 1: Email válido ===
POST /users/register
{
  "nome": "João Silva",
  "email": "joao@gmail.com",
  "senha": "123456"
}

✅ RESULTADO: Usuário cadastrado com sucesso
📧 LOG: "✅ [REGISTER] Email validado com sucesso"

=== CENÁRIO 2: Email inválido (formato) ===
POST /users/register
{
  "nome": "João Silva",
  "email": "joao@",
  "senha": "123456"
}

❌ RESULTADO: Erro 400
📧 LOG: "❌ [REGISTER] Email inválido: Formato de email inválido"
💬 MENSAGEM: "Email inválido: Formato de email inválido. Por favor, verifique se o email está correto."

=== CENÁRIO 3: Email inválido (domínio inexistente) ===
POST /users/register
{
  "nome": "João Silva",
  "email": "joao@dominioinexistente.com",
  "senha": "123456"
}

❌ RESULTADO: Erro 400
📧 LOG: "❌ [REGISTER] Email inválido: Domínio não possui servidores de email válidos"
💬 MENSAGEM: "Email inválido: Domínio não possui servidores de email válidos. Por favor, verifique se o email está correto."

=== CENÁRIO 4: Email com aviso ===
POST /users/register
{
  "nome": "João Silva",
  "email": "joao@empresa.com",
  "senha": "123456"
}

⚠️ RESULTADO: Usuário cadastrado (com aviso)
📧 LOG: "⚠️ [REGISTER] Aviso na validação do email: Formato válido e domínio com MX, mas não foi possível verificar via SMTP"

=== CENÁRIO 5: Email já cadastrado ===
POST /users/register
{
  "nome": "João Silva",
  "email": "joao@gmail.com", // já existe
  "senha": "123456"
}

❌ RESULTADO: Erro 400
📧 LOG: "❌ [REGISTER] Usuário já existe: joao@gmail.com"
💬 MENSAGEM: "Usuário com o email 'joao@gmail.com' já existe. Tente usar um email diferente ou faça login."

=== CENÁRIO 6: Validação desabilitada ===
# No arquivo .env:
VALIDATE_EMAIL_ON_REGISTER=false

POST /users/register
{
  "nome": "João Silva",
  "email": "email_invalido",
  "senha": "123456"
}

✅ RESULTADO: Usuário cadastrado (sem validação)
📧 LOG: "⏭️ [REGISTER] Validação de email desabilitada"

*/

// Função para testar validação de email
async function testarValidacaoEmail() {
  const emailsParaTestar = [
    'joao@gmail.com',           // ✅ Válido
    'maria@hotmail.com',        // ✅ Válido
    'admin@camarize.com.br',    // ✅ Válido
    'joao@',                    // ❌ Formato inválido
    'emailinvalido',            // ❌ Formato inválido
    'teste@dominioinexistente.com', // ❌ Domínio inexistente
    'joao@empresa.com'          // ⚠️ Pode ter aviso
  ];
  
  console.log('🧪 Testando validação de emails...\n');
  
  for (const email of emailsParaTestar) {
    try {
      console.log(`📧 Testando: ${email}`);
      
      // Simular requisição de cadastro
      const response = await fetch('/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nome: 'Usuário Teste',
          email: email,
          senha: '123456'
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ Sucesso: ${email}`);
      } else {
        console.log(`❌ Erro: ${data.error}`);
      }
      
      console.log('---');
      
    } catch (error) {
      console.log(`❌ Erro na requisição: ${error.message}`);
    }
  }
}

// Configurações disponíveis
const configuracoes = {
  // Habilitar/desabilitar validação
  VALIDATE_EMAIL_ON_REGISTER: 'true', // ou 'false'
  
  // Níveis de validação (no emailService)
  validacaoFormato: true,      // Sempre ativo
  validacaoDominio: true,      // Verifica MX
  validacaoSMTP: true,         // Tenta conectar
  
  // Comportamento
  bloquearCadastro: true,      // Se email inválido
  permitirComAviso: true,      // Se não conseguir verificar SMTP
  logDetalhado: true           // Logs no console
};

export {
  testarValidacaoEmail,
  configuracoes
};


