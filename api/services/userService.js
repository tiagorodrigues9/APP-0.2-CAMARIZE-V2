import User from "../models/Users.js";
import EmailSettings from "../models/EmailSettings.js";

class userService {
  
  // Método para cadastrar um usuário
  async Create(nome, email, senha, foto_perfil, fazenda) {
    try {
      console.log("📝 [SERVICE] Criando usuário:", { nome, email, senha: "***", foto_perfil, fazenda });
      
      const newUser = new User({
        nome,
        email,
        senha,
        foto_perfil,
        fazenda,
      });
      
      console.log("💾 [SERVICE] Salvando usuário no banco...");
      const savedUser = await newUser.save();
      console.log("✅ [SERVICE] Usuário salvo com sucesso:", savedUser._id);
      
      // Criar configurações de email automaticamente
      console.log("📧 [SERVICE] Criando configurações de email...");
      try {
        const emailSettings = new EmailSettings({
          userId: savedUser._id,
          emailAddress: email,
          emailEnabled: true,
          alertTypes: {
            temperatura: {
              enabled: true,
              severity: { baixa: false, media: true, alta: true }
            },
            ph: {
              enabled: true,
              severity: { baixa: false, media: true, alta: true }
            },
            amonia: {
              enabled: true,
              severity: { baixa: false, media: true, alta: true }
            }
          },
          quietHours: {
            enabled: false,
            startTime: '22:00',
            endTime: '07:00'
          },
          frequency: {
            maxEmailsPerHour: 5,
            maxEmailsPerDay: 20
          }
        });
        
        await emailSettings.save();
        console.log("✅ [SERVICE] Configurações de email criadas automaticamente");
      } catch (error) {
        console.log("⚠️ [SERVICE] Erro ao criar configurações de email:", error.message);
        // Não falha o cadastro se der erro nas configurações de email
      }
      
      return savedUser;
    } catch (error) {
      console.error("❌ [SERVICE] Erro ao criar usuário:", error);
      throw error;
    }
  }
  // Método para listar um usuário
  async getOne(email) {
    try {
      console.log("🔍 [SERVICE] Buscando usuário com email:", email);
      const user = await User.findOne({ email: email });
      console.log("🔍 [SERVICE] Resultado da busca:", user ? `Usuário encontrado (${user._id})` : "Usuário não encontrado");
      return user;
    } catch (error) {
      console.error("❌ [SERVICE] Erro ao buscar usuário:", error);
      throw error;
    }
  }
 




  async getById(id) {
    return await User.findById(id);
  }

  // Atualizar foto do usuário
  async updatePhoto(id, foto_perfil) {
    try {
      const updatedUser = await User.findByIdAndUpdate(id, { foto_perfil }, { new: true });
      
      return updatedUser;
    } catch (error) {
      throw error;
    }
  }
}

export default new userService();
