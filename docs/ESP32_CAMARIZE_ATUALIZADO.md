# 📡 Código ESP32 Atualizado - CAMARIZE V2

## 🎯 Funcionalidades
- Envio de dados dos sensores para a API na nuvem
- Busca automática da dieta atual do cativeiro
- Controle automático de alimentação baseado na dieta
- Sincronização de tempo via NTP

## 📋 Configuração

### **Variáveis de Configuração**
```cpp
const char* ssid = "SUA_REDE_WIFI";
const char* password = "SUA_SENHA_WIFI";
const char* apiBaseUrl = "http://SEU_HOST_OU_IP:4000"; // base da API (sem "/api")
```

### **Pinos dos Sensores**
```cpp
const int pHPin = 32;
const int amoniaPin = 35;
const int tempPin = 26;
const int servoPin = 25;
```

## 🔧 Código Completo

```cpp
#include <WiFi.h>
#include <NTPClient.h>
#include <WiFiUdp.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <ESP32Servo.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Preferences.h>

// Configurações WiFi
const char* ssid = "SUA_REDE_WIFI";
const char* password = "SUA_SENHA_WIFI";

// Configurações da API
const char* apiBaseUrl = "http://SEU_HOST_OU_IP:4000"; // sem "/api"

// Armazenamento do cativeiroId (persistido em NVS)
Preferences prefs;
String cativeiroId; // ObjectId como string

// NTP Client
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", -10800);

// Pinos dos sensores
const int pHPin = 32;
const int amoniaPin = 35;
const int tempPin = 26;
OneWire oneWire(tempPin);
DallasTemperature sensors(&oneWire);

// Servo para alimentação
Servo servo360;
const int servoPin = 25;

// Variáveis de controle
int horaAlvo = 17;
int minutoAlvo = 0;
float racaoDesejada = 25.0;
const float racaoPorGiro = 10.0;
String ultimaDataGiro = "";

// Controle de timing
unsigned long ultimoFetch = 0;
const unsigned long intervaloFetch = 60000; // 1 minuto

void setup() {
  Serial.begin(115200);
  analogSetAttenuation(ADC_11db);
  
  Serial.println("Conectando ao WiFi...");
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\nWiFi conectado!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
  
  // Inicializar NTP
  timeClient.begin();
  
  // Inicializar sensores
  sensors.begin();
  
  // Inicializar servo
  servo360.attach(servoPin);
  servo360.write(90);
  
  // Inicializar NVS e obter cativeiroId
  prefs.begin("camarize", false);
  cativeiroId = prefs.getString("cativId", "");

  // Modo de configuração via Serial (opcional): envie
  // SET CATIVEIRO <ObjectId>
  Serial.println("Digite: SET CATIVEIRO <ObjectId> para configurar (ou aguarde)");
  unsigned long start = millis();
  while (cativeiroId.isEmpty() && millis() - start < 5000) { // 5s para configuração opcional
    if (Serial.available()) {
      String line = Serial.readStringUntil('\n');
      line.trim();
      if (line.startsWith("SET CATIVEIRO ")) {
        String val = line.substring(14);
        val.trim();
        if (val.length() >= 24) {
          cativeiroId = val;
          prefs.putString("cativId", cativeiroId);
          Serial.println("cativeiroId salvo na NVS.");
        }
      }
    }
    delay(50);
  }

  if (cativeiroId.isEmpty()) {
    Serial.println("cativeiroId não configurado. Configure via Serial e reinicie.");
  }

  // Buscar dieta inicial
  buscarDietaDaAPI();
}

void loop() {
  timeClient.update();
  unsigned long agora = millis();
  
  if (agora - ultimoFetch >= intervaloFetch) {
    ultimoFetch = agora;
    
    // Buscar dieta atualizada
    buscarDietaDaAPI();
    
    // Obter dados atuais
    int currentHour = timeClient.getHours();
    int currentMinute = timeClient.getMinutes();
    time_t epochTime = timeClient.getEpochTime();
    struct tm * timeinfo = localtime(&epochTime);
    
    char dataAtual[11];
    sprintf(dataAtual, "%04d-%02d-%02d", 1900 + timeinfo->tm_year, 1 + timeinfo->tm_mon, timeinfo->tm_mday);
    String dataHoje = String(dataAtual);
    String dataHoraISO = dataHoje + "T" + timeClient.getFormattedTime();
    
    // Ler sensores
    int pHValue = analogRead(pHPin);
    float voltagePH = (pHValue / 4095.0) * 3.3;
    float pH = 7 + ((2.5 - voltagePH) / 0.18);
    pH = 7.2; // Valor fixo para teste
    
    int amoniaValue = analogRead(amoniaPin);
    float voltageAmonia_medida = (amoniaValue / 4095.0) * 3.3;
    float voltageAmonia = voltageAmonia_medida * 31.3;
    float amonia = voltageAmonia * 10;
    
    sensors.requestTemperatures();
    float temperatureC = sensors.getTempCByIndex(0);
    
    // Log dos dados
    Serial.printf("Hora: %02d:%02d | Data: %s | pH: %.2f | Amônia: %.2f ppm | Temp: %.2f °C\n", 
                  currentHour, currentMinute, dataHoje.c_str(), pH, amonia, temperatureC);
    
    // Enviar dados para API
    enviarParametrosParaAPI(temperatureC, pH, amonia, cativeiroId, dataHoraISO);
    
    // Verificar se é hora de alimentar
    int girosNecessarios = (int)((racaoDesejada / racaoPorGiro) + 0.5);
    
    if (currentHour == horaAlvo && currentMinute == minutoAlvo && ultimaDataGiro != dataHoje) {
      Serial.printf("Liberando %.2f g de ração (%d giros).\n", racaoDesejada, girosNecessarios);
      
      for (int i = 0; i < girosNecessarios; i++) {
        Serial.printf("Giro %d/%d...\n", i+1, girosNecessarios);
        servo360.write(180);
        delay(2000);
        servo360.write(90);
        delay(500);
      }
      
      Serial.println("Giros completos.");
      ultimaDataGiro = dataHoje;
    }
  }
  
  delay(100);
}

// Função para buscar dieta da API
void buscarDietaDaAPI() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    if (cativeiroId.length() < 24) {
      Serial.println("cativeiroId inválido/não configurado");
      return;
    }
    String url = String(apiBaseUrl) + "/dietas/atual/" + cativeiroId;
    http.begin(url);
    
    int httpResponseCode = http.GET();
    
    if (httpResponseCode == 200) {
      String payload = http.getString();
      Serial.print("JSON da dieta recebida: ");
      Serial.println(payload);
      
      StaticJsonDocument<200> doc;
      DeserializationError error = deserializeJson(doc, payload);
      
      if (!error) {
        // Verificar se tem hora de alimentação
        if (doc.containsKey("horaAlimentacao") && doc["horaAlimentacao"] != nullptr) {
          const char* horaAlimentacao = doc["horaAlimentacao"];
          char horaCortada[6] = {0};
          strncpy(horaCortada, horaAlimentacao, 5);
          
          int h = 0, m = 0;
          if (sscanf(horaCortada, "%d:%d", &h, &m) == 2) {
            horaAlvo = h;
            minutoAlvo = m;
            Serial.printf("Hora de alimentação atualizada: %02d:%02d\n", horaAlvo, minutoAlvo);
          } else {
            Serial.println("Erro ao parsear horaAlimentacao");
          }
        }
        
        // Atualizar quantidade
        if (doc.containsKey("quantidade")) {
          racaoDesejada = doc["quantidade"];
          Serial.printf("Quantidade atualizada: %.2f g\n", racaoDesejada);
        }
        
        // Log da descrição da dieta
        if (doc.containsKey("descricao")) {
          const char* descricao = doc["descricao"];
          Serial.printf("Dieta: %s\n", descricao);
        }
        
        Serial.printf("Dieta atualizada: %02d:%02d - %.2f g\n", horaAlvo, minutoAlvo, racaoDesejada);
      } else {
        Serial.println("Erro ao parsear JSON dieta");
      }
    } else {
      Serial.printf("Erro HTTP ao buscar dieta: %d\n", httpResponseCode);
    }
    
    http.end();
  } else {
    Serial.println("WiFi desconectado");
  }
}

// Função para enviar parâmetros para API
void enviarParametrosParaAPI(float temp, float ph, float amonia, String idCativeiro, String dataHoraISO) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String url = String(apiBaseUrl) + "/parametros/cadastrar";
    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    
    if (idCativeiro.length() < 24) {
      Serial.println("cativeiroId inválido/não configurado");
      http.end();
      return;
    }

    String json = "{";
    json += "\"id_cativeiro\":\"" + idCativeiro + "\",";
    json += "\"temperatura\":" + String(temp, 2) + ",";
    json += "\"ph\":" + String(ph, 2) + ",";
    json += "\"amonia\":" + String(amonia, 2);
    json += "}";
    
    int httpResponseCode = http.POST(json);
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("POST feito com sucesso:");
      Serial.println(response);
    } else {
      Serial.print("Erro no POST: ");
      Serial.println(httpResponseCode);
    }
    
    http.end();
  } else {
    Serial.println("WiFi desconectado");
  }
}
```

## 📊 Endpoints da API

### **1. Enviar Dados dos Sensores**
```
POST /parametros/cadastrar
Content-Type: application/json

{
  "id_cativeiro": "1",
  "temperatura": 26.5,
  "ph": 7.2,
  "amonia": 0.05
}
```

### **2. Buscar Dieta Atual**
```
GET /dietas/atual/<ObjectId>

Resposta:
{
  "cativeiroId": "1",
  "dietaId": "507f1f77bcf86cd799439011",
  "horaAlimentacao": "17:00",
  "quantidade": 25.0,
  "descricao": "Ração balanceada para camarões"
}
```

## ⚙️ Configurações Importantes

### **1. URL da API**
Substitua `http://SEU_HOST_OU_IP:4000` pela URL real da sua API.

### **2. ID do Cativeiro**
Altere `cativeiroId` para o ID correto do cativeiro no banco de dados.

### **3. Calibração dos Sensores**
Ajuste os valores de calibração conforme seus sensores específicos.

### **4. Servo de Alimentação**
- `servo360.write(90)`: Posição neutra
- `servo360.write(180)`: Posição de liberação
- Ajuste `racaoPorGiro` conforme seu sistema

## 🔧 Bibliotecas Necessárias

```cpp
#include <WiFi.h>           // Conexão WiFi
#include <NTPClient.h>      // Sincronização de tempo
#include <WiFiUdp.h>        // UDP para NTP
#include <OneWire.h>        // Sensor de temperatura
#include <DallasTemperature.h> // Biblioteca do sensor
#include <ESP32Servo.h>     // Controle do servo
#include <HTTPClient.h>     // Requisições HTTP
#include <ArduinoJson.h>    // Manipulação de JSON
```

## 📝 Notas Importantes

1. **Frequência**: O código busca dieta a cada minuto e envia dados dos sensores
2. **Alimentação**: Só alimenta uma vez por dia no horário configurado
3. **WiFi**: Certifique-se de que o ESP32 tem acesso à rede
4. **API**: A API deve estar rodando e acessível
5. **Cativeiro**: O ID do cativeiro deve existir no banco de dados

## 🚀 Próximos Passos

1. Configure as credenciais WiFi
2. Ajuste a URL da API
3. Configure o ID do cativeiro
4. Calibre os sensores
5. Teste a conexão com a API
6. Monitore os dados no dashboard
