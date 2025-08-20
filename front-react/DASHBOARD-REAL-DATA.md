# Dashboard com Dados Reais

## 📋 Descrição

O dashboard foi modificado para buscar dados reais da API em vez de usar dados mockados. Agora ele exibe informações reais dos sensores baseadas no último registro do banco de dados.

## 🔄 Mudanças Implementadas

### ❌ **Removido**:
- Dados mockados estáticos (`sensoresMock`)
- Arrays fixos de temperatura, pH e amônia
- Valores hardcoded no gráfico

### ✅ **Adicionado**:
- Estado para dados atuais e semanais
- Função `buscarDadosDashboard()` para buscar dados da API
- Estados de loading e error
- Tratamento de erros de autenticação
- Dados dinâmicos baseados na resposta da API

## 🚀 Como Funciona

### 1. **Busca de Dados**
```javascript
const buscarDadosDashboard = async () => {
  // Busca dados do endpoint /parametros/dashboard/:cativeiroId
  const response = await axios.get(`${apiUrl}/parametros/dashboard/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  setDadosAtuais(response.data.dadosAtuais);
  setDadosSemanais(response.data.dadosSemanais);
};
```

### 2. **Dados dos Sensores**
Os dados dos sensores são calculados dinamicamente:
- **Temperatura**: Valor real do banco + "°C"
- **pH**: Valor real do banco (1 casa decimal)
- **Amônia total**: Valor real do banco + " mg/L"
- **Amônia não ionizada**: 20% do valor total (simulação)

### 3. **Gráfico Semanal**
O gráfico usa dados reais dos últimos 7 dias:
- Se há dados reais: usa os valores do banco
- Se não há dados: usa valores padrão como fallback

## 📡 Endpoint Utilizado

```
GET /parametros/dashboard/:cativeiroId
```

**Resposta esperada**:
```json
{
  "cativeiro": {
    "id": "...",
    "nome": "Cativeiro Junior"
  },
  "dadosAtuais": {
    "temperatura": 20.0,
    "ph": 6.5,
    "amonia": 0.20,
    "datahora": "2024-01-01T10:00:00.000Z"
  },
  "dadosSemanais": [
    { "temperatura": 20.0, "ph": 6.5, "amonia": 0.20 },
    // ... 7 dias de dados
  ]
}
```

## 🎯 Estados da Interface

### 1. **Loading**
- Mostra "Carregando dados..." enquanto busca informações
- Interface limpa e informativa

### 2. **Error**
- Exibe mensagem de erro específica
- Botão "Tentar Novamente" para nova tentativa
- Redirecionamento automático para login se token expirado

### 3. **Success**
- Exibe dados reais dos sensores
- Gráfico com dados semanais reais
- Título dinâmico com ID do cativeiro

## 🔧 Configuração

### Variável de Ambiente
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Token de Autenticação
O dashboard usa o token armazenado em `localStorage.getItem('token')`

## 🐛 Troubleshooting

### Erro: "Token não encontrado"
- Verifique se o usuário está logado
- Confirme se o token está no localStorage

### Erro: "Sessão expirada"
- O usuário será redirecionado automaticamente para /login
- Token será removido do localStorage

### Erro: "Erro ao carregar dados"
- Verifique se a API está rodando
- Confirme se o endpoint está funcionando
- Verifique se há dados no banco para o cativeiro

### Dados não aparecem
- Execute o script de população: `npm run populate-parametros`
- Verifique se o ID do cativeiro está correto na URL
- Confirme se há registros na tabela `parametros_atuais`

## 🎉 Benefícios

✅ **Dados Reais**: Informações atualizadas dos sensores  
✅ **Performance**: Loading states para melhor UX  
✅ **Segurança**: Autenticação via token  
✅ **Robustez**: Tratamento de erros completo  
✅ **Flexibilidade**: Dados dinâmicos baseados no banco  
✅ **Fallback**: Valores padrão quando não há dados  

## 🔄 Próximos Passos

1. **Testar a integração** com dados reais
2. **Implementar refresh automático** dos dados
3. **Adicionar filtros** por período
4. **Melhorar visualização** dos dados históricos 