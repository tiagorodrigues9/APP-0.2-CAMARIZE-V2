import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Importar modelos
import Users from './models/Users.js';
import Cativeiros from './models/Cativeiros.js';
import FazendasxCativeiros from './models/FazendasxCativeiros.js';
import UsuariosxFazendas from './models/UsuariosxFazendas.js';

async function checkUserCativeirosRelation() {
  try {
    console.log('🔌 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Conectado ao MongoDB');

    // Buscar usuário pelo email
    const userEmail = 'joaooficialkusaka@gmail.com';
    const user = await Users.findOne({ email: userEmail });
    
    if (!user) {
      console.log('❌ Usuário não encontrado:', userEmail);
      return;
    }

    console.log('👤 Usuário encontrado:', user.nome);
    console.log('📧 Email:', user.email);
    console.log('🆔 ID do usuário:', user._id);

    // Verificar todos os cativeiros no banco
    const allCativeiros = await Cativeiros.find();
    console.log(`\n🏠 Total de cativeiros no banco: ${allCativeiros.length}`);

    allCativeiros.forEach(cativeiro => {
      console.log(`   - ${cativeiro.nome} (ID: ${cativeiro._id})`);
    });

    // Verificar cativeiros diretamente associados ao usuário
    const userCativeiros = await Cativeiros.find({ user: user._id });
    console.log(`\n👤 Cativeiros diretamente associados ao usuário: ${userCativeiros.length}`);

    // Verificar relação através de fazendas
    const userFazendas = await UsuariosxFazendas.find({ usuario: user._id });
    console.log(`\n🏭 Fazendas do usuário: ${userFazendas.length}`);

    for (const userFazenda of userFazendas) {
      console.log(`   - Fazenda ID: ${userFazenda.fazenda}`);
      
      const fazendaCativeiros = await FazendasxCativeiros.find({ fazenda: userFazenda.fazenda });
      console.log(`     Cativeiros da fazenda: ${fazendaCativeiros.length}`);
      
      for (const fazendaCativeiro of fazendaCativeiros) {
        const cativeiro = await Cativeiros.findById(fazendaCativeiro.cativeiro);
        if (cativeiro) {
          console.log(`       - ${cativeiro.nome} (ID: ${cativeiro._id})`);
        }
      }
    }

    // Verificar se os cativeiros "do joao" pertencem ao usuário correto
    const joaoCativeiros = await Cativeiros.find({ nome: { $regex: /joao/i } });
    console.log(`\n🔍 Cativeiros com "joao" no nome: ${joaoCativeiros.length}`);

    for (const cativeiro of joaoCativeiros) {
      console.log(`   - ${cativeiro.nome} (ID: ${cativeiro._id})`);
      console.log(`     - Campo 'user': ${cativeiro.user || 'NÃO DEFINIDO'}`);
      console.log(`     - Pertence ao usuário atual: ${cativeiro.user?.equals(user._id) ? 'SIM' : 'NÃO'}`);
    }

    // Se os cativeiros não estão associados ao usuário, vamos associá-los
    const cativeirosParaAssociar = joaoCativeiros.filter(cativeiro => 
      !cativeiro.user || !cativeiro.user.equals(user._id)
    );

    if (cativeirosParaAssociar.length > 0) {
      console.log(`\n🔧 Associando ${cativeirosParaAssociar.length} cativeiros ao usuário...`);
      
      for (const cativeiro of cativeirosParaAssociar) {
        cativeiro.user = user._id;
        await cativeiro.save();
        console.log(`   ✅ ${cativeiro.nome} associado ao usuário ${user.nome}`);
      }
    } else {
      console.log('\n✅ Todos os cativeiros já estão associados ao usuário correto');
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do MongoDB');
  }
}

checkUserCativeirosRelation();
