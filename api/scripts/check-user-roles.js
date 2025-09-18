import mongoose from 'mongoose';
import User from '../models/Users.js';

// Conectar ao MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/camarize');
    console.log('Conectado ao MongoDB');
  } catch (error) {
    console.error('Erro ao conectar:', error);
    process.exit(1);
  }
};

const checkUserRoles = async () => {
  try {
    console.log('Verificando roles dos usuários...\n');
    
    const users = await User.find({}, 'nome email role');
    
    console.log('Usuários encontrados:');
    users.forEach(user => {
      console.log(`- ${user.nome} (${user.email}): role = "${user.role}"`);
    });
    
    console.log('\nVerificando usuários sem role...');
    const usersWithoutRole = await User.find({ role: { $exists: false } });
    if (usersWithoutRole.length > 0) {
      console.log('Usuários sem role definido:');
      usersWithoutRole.forEach(user => {
        console.log(`- ${user.nome} (${user.email})`);
      });
    } else {
      console.log('Todos os usuários têm role definido.');
    }
    
    console.log('\nVerificando usuários com role "membro"...');
    const membros = await User.find({ role: 'membro' });
    console.log(`Total de membros: ${membros.length}`);
    membros.forEach(user => {
      console.log(`- ${user.nome} (${user.email})`);
    });
    
    console.log('\nVerificando usuários com role "admin"...');
    const admins = await User.find({ role: 'admin' });
    console.log(`Total de admins: ${admins.length}`);
    admins.forEach(user => {
      console.log(`- ${user.nome} (${user.email})`);
    });
    
    console.log('\nVerificando usuários com role "master"...');
    const masters = await User.find({ role: 'master' });
    console.log(`Total de masters: ${masters.length}`);
    masters.forEach(user => {
      console.log(`- ${user.nome} (${user.email})`);
    });
    
  } catch (error) {
    console.error('Erro ao verificar roles:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDesconectado do MongoDB');
  }
};

// Executar
connectDB().then(() => {
  checkUserRoles();
});
