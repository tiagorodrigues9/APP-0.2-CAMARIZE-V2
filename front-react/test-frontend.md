# Teste do Frontend - Relação Sensor-Cativeiro

## ✅ O que foi ajustado:

1. **Campo `sensorId` adicionado** ao FormData
2. **Primeiro sensor selecionado** é enviado automaticamente
3. **Interface melhorada** com explicação clara
4. **Notificação específica** quando sensor é relacionado

## 🧪 Como testar:

### 1. Acesse o formulário de cadastro de cativeiro:
```
http://localhost:3000/create-cativeiros
```

### 2. Preencha o formulário:
- Selecione uma fazenda
- Escolha a data de instalação
- Selecione o tipo de camarão
- Preencha as condições ideais
- **IMPORTANTE:** Selecione um sensor no primeiro dropdown

### 3. Cadastre o cativeiro:
- Clique em "Cadastrar"
- Deve aparecer: "Cativeiro cadastrado com sucesso! Sensor relacionado automaticamente."

### 4. Verifique no MongoDB Atlas:
- Acesse: https://cloud.mongodb.com
- Clique em "Browse Collections"
- Procure pela coleção `SensoresxCativeiros`
- Deve aparecer a relação criada

## 🔍 Logs para verificar:

No console do navegador (F12), você deve ver:
```
🔗 Sensor relacionado: [ID_DO_SENSOR]
```

## 🎯 Resultado esperado:

- ✅ Cativeiro criado
- ✅ Relação sensor-cativeiro criada automaticamente
- ✅ Aparece na coleção `SensoresxCativeiros` no Atlas
- ✅ Notificação específica no frontend 