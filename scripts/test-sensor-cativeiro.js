#!/usr/bin/env node

console.log('🧪 Teste de Cadastro de Cativeiro com Sensor');
console.log('===========================================\n');

console.log('📋 Para cadastrar um cativeiro com sensor, use:');
console.log('POST http://localhost:4000/cativeiros');
console.log('\n📝 Exemplo de dados:');
console.log('{');
console.log('  "id_tipo_camarao": "ID_DO_TIPO_CAMARAO",');
console.log('  "data_instalacao": "2024-01-15",');
console.log('  "fazendaId": "ID_DA_FAZENDA",');
console.log('  "sensorId": "ID_DO_SENSOR",  // ← NOVO CAMPO');
console.log('  "temp_media_diaria": "28",');
console.log('  "ph_medio_diario": "7.5",');
console.log('  "amonia_media_diaria": "0.02"');
console.log('}');
console.log('\n✅ O que acontece:');
console.log('1. Cativeiro é criado');
console.log('2. Relação fazenda-cativeiro é criada');
console.log('3. Relação sensor-cativeiro é criada (se sensorId fornecido)');
console.log('4. Aparece na coleção SensoresxCativeiros no Atlas');
console.log('\n🔍 Para verificar:');
console.log('- GET http://localhost:4000/sensoresxcativeiros');
console.log('- GET http://localhost:4000/cativeiros/{cativeiroId}/sensores');
console.log('\n🌐 No MongoDB Atlas:');
console.log('- Acesse: https://cloud.mongodb.com');
console.log('- Clique em "Browse Collections"');
console.log('- Procure pela coleção "SensoresxCativeiros"'); 