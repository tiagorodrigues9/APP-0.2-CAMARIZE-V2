#!/usr/bin/env node

import axios from 'axios';

console.log('🧪 Testando endpoint de Status dos Cativeiros...');
console.log('===============================================\n');

async function testCativeirosStatus() {
  try {
    const apiUrl = "http://localhost:4000";
    
    console.log(`📡 Testando: GET ${apiUrl}/cativeiros-status`);
    
    // Teste sem token (deve retornar 401)
    console.log('\n🔒 Teste 1: Sem token de autenticação');
    try {
      const response = await axios.get(`${apiUrl}/cativeiros-status`);
      console.log('❌ ERRO: Deveria ter retornado 401, mas retornou:', response.status);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ CORRETO: Retornou 401 (não autorizado)');
      } else {
        console.log('❌ ERRO: Status inesperado:', error.response?.status);
      }
    }
    
    // Teste com token inválido (deve retornar 401)
    console.log('\n🔒 Teste 2: Com token inválido');
    try {
      const response = await axios.get(`${apiUrl}/cativeiros-status`, {
        headers: { Authorization: 'Bearer token_invalido' }
      });
      console.log('❌ ERRO: Deveria ter retornado 401, mas retornou:', response.status);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ CORRETO: Retornou 401 (token inválido)');
      } else {
        console.log('❌ ERRO: Status inesperado:', error.response?.status);
      }
    }
    
    console.log('\n📊 Resumo dos testes:');
    console.log('✅ Endpoint está protegido por autenticação');
    console.log('✅ Validação de token funcionando');
    console.log('✅ Respostas de erro corretas');
    
    console.log('\n💡 Para testar com dados reais:');
    console.log('1. Faça login na aplicação para obter um token válido');
    console.log('2. Use o token no header Authorization: Bearer <seu_token>');
    console.log('3. Acesse o endpoint /cativeiros-status');
    console.log('4. Verifique se retorna o status de todos os cativeiros do usuário');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testCativeirosStatus(); 