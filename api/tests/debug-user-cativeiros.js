import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

// Importar todos os modelos necessários
import './models/Users.js';
import './models/Fazendas.js';
import './models/Cativeiros.js';
import './models/UsuariosxFazendas.js';
import './models/FazendasxCativeiros.js';

dotenv.config();

async function debugUserCativeiros() {
  try {
    console.log('🔍 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/camarize');
    console.log('✅ Conectado!');

    console.log('\n📊 Verificando dados do usuário...\n');

    // Importar modelos após conexão
    const UsuariosxFazendas = (await import('./models/UsuariosxFazendas.js')).default;
    const FazendasxCativeiros = (await import('./models/FazendasxCativeiros.js')).default;
    const Cativeiros = (await import('./models/Cativeiros.js')).default;
    const Users = (await import('./models/Users.js')).default;

    // Listar todos os usuários
    const users = await Users.find();
    console.log('👥 Usuários no sistema:', users.length);
    users.forEach(u => {
      console.log(`  - ${u.email} (ID: ${u._id})`);
    });

    // Para cada usuário, verificar seus cativeiros
    for (const user of users) {
      console.log(`\n🔍 Verificando cativeiros do usuário: ${user.email}`);
      
      // Buscar fazendas do usuário
      const userFazendas = await UsuariosxFazendas.find({ usuario: user._id }).populate('fazenda');
      console.log(`  📊 Fazendas do usuário: ${userFazendas.length}`);
      
      if (userFazendas.length > 0) {
        const fazendaIds = userFazendas.map(f => f.fazenda._id);
        console.log(`  🏭 IDs das fazendas: ${fazendaIds.join(', ')}`);
        
        // Buscar cativeiros dessas fazendas
        const cativeiroRels = await FazendasxCativeiros.find({ 
          fazenda: { $in: fazendaIds } 
        }).populate('cativeiro');
        
        console.log(`  🐟 Cativeiros encontrados: ${cativeiroRels.length}`);
        cativeiroRels.forEach(rel => {
          if (rel.cativeiro) {
            console.log(`    - ${rel.cativeiro.nome || 'Sem nome'} (ID: ${rel.cativeiro._id})`);
          } else {
            console.log(`    - Cativeiro removido (ID: ${rel.cativeiro})`);
          }
        });
      } else {
        console.log(`  ⚠️ Usuário não tem fazendas associadas`);
      }
    }

    console.log('\n✅ Debug concluído!');
    await mongoose.disconnect();

  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

debugUserCativeiros();
