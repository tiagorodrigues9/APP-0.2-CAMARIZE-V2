/*
  Promove um usuário para a role desejada por email.
  Uso:
    node api/scripts/promote-user-role.js --email="user@dominio.com" --role=master
  Variáveis de ambiente opcionais:
    MONGO_URL=mongodb+srv://...
*/

import mongoose from 'mongoose';
import User from '../models/Users.js';

const args = process.argv.slice(2).reduce((acc, cur) => {
  const [k, v] = cur.split('=');
  const key = k.replace(/^--/, '');
  acc[key] = (v || '').replace(/^"|"$/g, '');
  return acc;
}, {});

const { email, role } = args;
if (!email || !role) {
  console.error('Uso: node api/scripts/promote-user-role.js --email="user@dominio.com" --role=membro|admin|master');
  process.exit(1);
}

const valid = ['membro', 'admin', 'master'];
if (!valid.includes(role)) {
  console.error(`Role inválida. Use: ${valid.join(', ')}`);
  process.exit(1);
}

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/camarize';

async function run() {
  try {
    await mongoose.connect(mongoUrl, { serverSelectionTimeoutMS: 5000 });
    console.log('Conectado ao MongoDB');
    const user = await User.findOneAndUpdate({ email }, { role }, { new: true });
    if (!user) {
      console.log('Usuário não encontrado:', email);
      process.exitCode = 2;
    } else {
      console.log(`Usuário atualizado: ${user.email} -> role=${user.role}`);
    }
  } catch (err) {
    console.error('Erro na promoção:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado do MongoDB');
  }
}

run();


