import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Importar todos os modelos necessários
import './models/Users.js';
import './models/Fazendas.js';
import './models/Cativeiros.js';
import './models/UsuariosxFazendas.js';
import './models/FazendasxCativeiros.js';

dotenv.config();

async function checkData() {
  try {
    console.log('🔍 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/camarize');
    console.log('✅ Conectado!');

    console.log('\n📊 Verificando dados...\n');

    // Importar modelos após conexão
    const UsuariosxFazendas = (await import('./models/UsuariosxFazendas.js')).default;
    const FazendasxCativeiros = (await import('./models/FazendasxCativeiros.js')).default;
    const Cativeiros = (await import('./models/Cativeiros.js')).default;

    // Verificar UsuariosxFazendas (sem populate para evitar erro)
    const usuarios = await UsuariosxFazendas.find();
    console.log('📊 UsuariosxFazendas:', usuarios.length);
    usuarios.forEach(u => {
      console.log(`  - Usuário ID: ${u.usuario} | Fazenda ID: ${u.fazenda}`);
    });

    // Verificar FazendasxCativeiros (sem populate para evitar erro)
    const fazendas = await FazendasxCativeiros.find();
    console.log('\n📊 FazendasxCativeiros:', fazendas.length);
    fazendas.forEach(f => {
      console.log(`  - Fazenda ID: ${f.fazenda} | Cativeiro ID: ${f.cativeiro}`);
    });

    // Verificar Cativeiros
    const cativeiros = await Cativeiros.find();
    console.log('\n📊 Cativeiros:', cativeiros.length);
    cativeiros.forEach(c => {
      console.log(`  - Cativeiro: ${c.nome} (ID: ${c._id})`);
    });

    console.log('\n✅ Verificação concluída!');
    await mongoose.disconnect();

  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

checkData();
