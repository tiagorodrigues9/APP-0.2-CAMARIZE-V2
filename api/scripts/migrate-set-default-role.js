/*
  Migração: Define role='membro' para usuários sem role ou com role inválida.
  Uso:
    NODE_OPTIONS=--no-warnings node api/scripts/migrate-set-default-role.js
  Variáveis de ambiente opcionais:
    MONGO_URL=mongodb+srv://... (padrão: mongodb://localhost:27017/camarize)
*/

import mongoose from 'mongoose';
import User from '../models/Users.js';

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/camarize';

async function run() {
  try {
    await mongoose.connect(mongoUrl, { serverSelectionTimeoutMS: 5000 });
    console.log('Conectado ao MongoDB');

    const valid = ['membro', 'admin', 'master'];

    const res = await User.updateMany(
      { $or: [ { role: { $exists: false } }, { role: { $nin: valid } } ] },
      { $set: { role: 'membro' } }
    );

    console.log(`Usuários atualizados: ${res.modifiedCount}`);
  } catch (err) {
    console.error('Erro na migração:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado do MongoDB');
  }
}

run();


