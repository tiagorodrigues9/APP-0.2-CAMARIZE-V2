# Funcionalidades de Segurança - Camarize

## Limpeza Automática de Token

### Como Funciona

O sistema agora implementa limpeza automática de tokens de autenticação para garantir a segurança do usuário:

1. **Fechamento da Página**: Quando o usuário fecha a aba/navegador, o token é automaticamente removido do localStorage
2. **Aba Ocultada**: Se a aba ficar oculta por mais de 30 minutos, o token é removido automaticamente
3. **Sessão Expirada**: Se o servidor retornar erro 401, o token é removido e o usuário é redirecionado para login

### Eventos Monitorados

- `beforeunload`: Disparado quando a página é fechada
- `visibilitychange`: Disparado quando a aba fica visível/oculta
- `401 Unauthorized`: Resposta do servidor indicando token inválido

### Arquivos Modificados

- `src/hooks/useAuth.js`: Adicionada função `clearAuthData()` e listeners de segurança
- `src/pages/_app.js`: Adicionado `SecurityProvider` para proteção global

### Benefícios

✅ **Segurança Aprimorada**: Token não fica persistente após fechamento da página
✅ **Proteção contra Acesso Não Autorizado**: Limpeza automática em situações de risco
✅ **Experiência do Usuário**: Redirecionamento automático para login quando necessário
✅ **Conformidade**: Melhor aderência a práticas de segurança web

### Configuração

O tempo de timeout para aba oculta pode ser ajustado no arquivo `_app.js`:

```javascript
setTimeout(() => {
  if (document.hidden) {
    clearAuthData();
  }
}, 30 * 60 * 1000); // 30 minutos - ajuste conforme necessário
```

### Teste

Para testar a funcionalidade:
1. Faça login na aplicação
2. Feche a aba/navegador
3. Abra novamente a aplicação
4. Verifique que o token foi removido e você precisa fazer login novamente 