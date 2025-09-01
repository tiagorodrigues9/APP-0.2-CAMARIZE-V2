# 📡 Integração ESP32 com API CAMARIZE

## 🎯 Endpoint para Dados dos Sensores

### **POST** `/api/parametros/cadastrar`

Endpoint para receber dados dos sensores (temperatura, pH e amônia) vindos do ESP32.

---

## 📋 Estrutura dos Dados

### **Request Body (JSON)**
```json
{
  "id_cativeiro": "507f1f77bcf86cd799439011",
  "temperatura": 26.5,
  "ph": 7.2,
  "amonia": 0.05
}
```

### **Campos Obrigatórios**
- `id_cativeiro` (string): ID do cativeiro no banco de dados
- `temperatura` (number): Temperatura em graus Celsius
- `ph` (number): Nível de pH (0-14)
- `amonia` (number): Concentração de amônia em mg/L

---

## 🔄 Exemplos de Uso

### **Exemplo 1: Dados Válidos**
```bash
curl -X POST http://localhost:4000/api/parametros/cadastrar \
  -H "Content-Type: application/json" \
  -d '{
    "id_cativeiro": "507f1f77bcf86cd799439011",
    "temperatura": 26.5,
    "ph": 7.2,
    "amonia": 0.05
  }'
```

### **Exemplo 2: Código ESP32 (Arduino)**
```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "SUA_REDE_WIFI";
const char* password = "SUA_SENHA_WIFI";
const char* apiUrl = "http://localhost:4000/api/parametros/cadastrar";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Conectando ao WiFi...");
  }
  Serial.println("Conectado ao WiFi!");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(apiUrl);
    http.addHeader("Content-Type", "application/json");
    
    // Simular leitura dos sensores
    float temperatura = lerSensorTemperatura();
    float ph = lerSensorPH();
    float amonia = lerSensorAmonia();
    
    // Criar JSON
    String jsonData = "{\"id_cativeiro\":\"507f1f77bcf86cd799439011\",";
    jsonData += "\"temperatura\":" + String(temperatura, 2) + ",";
    jsonData += "\"ph\":" + String(ph, 2) + ",";
    jsonData += "\"amonia\":" + String(amonia, 2) + "}";
    
    int httpResponseCode = http.POST(jsonData);
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("Resposta: " + response);
    } else {
      Serial.println("Erro na requisição: " + http.errorToString(httpResponseCode));
    }
    
    http.end();
  }
  
  delay(300000); // Enviar dados a cada 5 minutos
}

// Funções para ler os sensores (implementar conforme seus sensores)
float lerSensorTemperatura() {
  // Implementar leitura do sensor de temperatura
  return 26.5;
}

float lerSensorPH() {
  // Implementar leitura do sensor de pH
  return 7.2;
}

float lerSensorAmonia() {
  // Implementar leitura do sensor de amônia
  return 0.05;
}
```

---

## 📊 Respostas da API

### **Sucesso (201 Created)**
```json
{
  "success": true,
  "message": "Parâmetros cadastrados com sucesso",
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "cativeiro": "Cativeiro A",
    "temperatura": 26.5,
    "ph": 7.2,
    "amonia": 0.05,
    "datahora": "2024-01-15T10:30:00.000Z"
  }
}
```

### **Erro - Cativeiro não encontrado (404)**
```json
{
  "error": "Cativeiro não encontrado"
}
```

### **Erro - Dados inválidos (400)**
```json
{
  "error": "Temperatura, pH e amônia são obrigatórios"
}
```

### **Erro - Tipos inválidos (400)**
```json
{
  "error": "Temperatura, pH e amônia devem ser números"
}
```

---

## ⚠️ Considerações Importantes

1. **Frequência de Envio**: Recomenda-se enviar dados a cada 5-15 minutos
2. **Validação**: Todos os valores devem ser números válidos
3. **Cativeiro**: O ID do cativeiro deve existir no banco de dados
4. **Rede**: Certifique-se de que o ESP32 tem acesso à rede WiFi
5. **Timeout**: Configure timeout adequado para requisições HTTP

---

## 🔧 Configuração no ESP32

### **Bibliotecas Necessárias**
```cpp
#include <WiFi.h>        // Para conexão WiFi
#include <HTTPClient.h>   // Para requisições HTTP
#include <ArduinoJson.h>  // Para manipulação de JSON (opcional)
```

### **Variáveis de Configuração**
```cpp
const char* ssid = "SUA_REDE_WIFI";
const char* password = "SUA_SENHA_WIFI";
const char* apiUrl = "http://SEU_IP:4000/api/parametros/cadastrar";
const char* cativeiroId = "507f1f77bcf86cd799439011";
```

---

## 🚀 Próximos Passos

1. **Configure o WiFi** no ESP32
2. **Implemente as funções** de leitura dos sensores
3. **Teste a conexão** com a API
4. **Ajuste a frequência** de envio conforme necessário
5. **Monitore os dados** no dashboard da aplicação 