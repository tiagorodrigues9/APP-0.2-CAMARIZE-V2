import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Importa modelos base para garantir registro dos schemas
import './models/Users.js';
import './models/Fazendas.js';
import './models/Cativeiros.js';
import './models/UsuariosxFazendas.js';
import './models/FazendasxCativeiros.js';
import './models/SensoresxCativeiros.js';
import './models/Sensores.js';

dotenv.config();

async function cleanOrphans() {
    try {
        console.log('🔍 Conectando ao MongoDB...');
        await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/camarize');
        console.log('✅ Conectado!');

        console.log('\n🧹 Limpando relacionamentos órfãos...\n');

        // Importar modelos após conexão
        const FazendasxCativeiros = (await import('./models/FazendasxCativeiros.js')).default;
        const UsuariosxFazendas = (await import('./models/UsuariosxFazendas.js')).default;
        const SensoresxCativeiros = (await import('./models/SensoresxCativeiros.js')).default;
        const Cativeiros = (await import('./models/Cativeiros.js')).default;
        const Fazendas = (await import('./models/Fazendas.js')).default;
        const Users = (await import('./models/Users.js')).default;
        const Sensores = (await import('./models/Sensores.js')).default;

        // FazendasxCativeiros: remover quando cativeiro OU fazenda não existem
        const fxcAll = await FazendasxCativeiros.find();
        console.log(`📊 FazendasxCativeiros: ${fxcAll.length}`);
        let removedFxc = 0;
        for (const rel of fxcAll) {
            const [cExists, fExists] = await Promise.all([
                Cativeiros.findById(rel.cativeiro),
                Fazendas.findById(rel.fazenda)
            ]);
            if (!cExists || !fExists) {
                console.log(`🗑️ Removendo Fxc órfão: fazenda=${rel.fazenda} cativeiro=${rel.cativeiro}`);
                await FazendasxCativeiros.findByIdAndDelete(rel._id);
                removedFxc++;
            }
        }

        // UsuariosxFazendas: remover quando usuário OU fazenda não existem
        const uxfAll = await UsuariosxFazendas.find();
        console.log(`📊 UsuariosxFazendas: ${uxfAll.length}`);
        let removedUxf = 0;
        for (const rel of uxfAll) {
            const [uExists, fExists] = await Promise.all([
                Users.findById(rel.usuario),
                Fazendas.findById(rel.fazenda)
            ]);
            if (!uExists || !fExists) {
                console.log(`🗑️ Removendo Uxf órfão: usuario=${rel.usuario} fazenda=${rel.fazenda}`);
                await UsuariosxFazendas.findByIdAndDelete(rel._id);
                removedUxf++;
            }
        }

        // SensoresxCativeiros: remover quando sensor OU cativeiro não existem
        const sxcAll = await SensoresxCativeiros.find();
        console.log(`📊 SensoresxCativeiros: ${sxcAll.length}`);
        let removedSxc = 0;
        for (const rel of sxcAll) {
            const [sExists, cExists] = await Promise.all([
                Sensores.findById(rel.id_sensor),
                Cativeiros.findById(rel.id_cativeiro)
            ]);
            if (!sExists || !cExists) {
                console.log(`🗑️ Removendo Sxc órfão: sensor=${rel.id_sensor} cativeiro=${rel.id_cativeiro}`);
                await SensoresxCativeiros.findByIdAndDelete(rel._id);
                removedSxc++;
            }
        }

        // Reportar cativeiros sem usuário associado (não remove, apenas mostra)
        const cativeirosSemUsuario = await Cativeiros.find({ $or: [{ user: { $exists: false } }, { user: null }] });
        console.log(`\n🔎 Cativeiros sem campo 'user': ${cativeirosSemUsuario.length}`);
        cativeirosSemUsuario.forEach(c => console.log(`   - ${c.nome} (${c._id})`));

        console.log(`\n✅ Limpeza concluída!`);
        console.log(`   - Fxc removidos: ${removedFxc}`);
        console.log(`   - Uxf removidos: ${removedUxf}`);
        console.log(`   - Sxc removidos: ${removedSxc}`);

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Erro:', error);
        process.exit(1);
    }
}

cleanOrphans();
