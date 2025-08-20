import userService from "../services/userService.js";
import jwt from "jsonwebtoken";
import fazendaController from "./fazendaController.js";
import Fazendas from "../models/Fazendas.js";
import emailService from "../services/emailService.js";

// JWTSecret
const JWTSecret = process.env.JWT_SECRET || "apigamessecret";


// No userController.js
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await userService.getById(id);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    

    
    res.json(user);
  } catch (err) {
    console.error('Erro ao buscar usuário:', err);
    res.status(500).json({ error: err.message });
  }
};

// Buscar usuário atual (baseado no token)
const getCurrentUser = async (req, res) => {
  try {
    // O middleware de autenticação já adicionou req.loggedUser
    const userId = req.loggedUser.id;
    
    const user = await userService.getById(userId);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    
    // Remove a senha do objeto retornado por segurança
    const { senha, ...userWithoutPassword } = user.toObject();
    
    res.json(userWithoutPassword);
  } catch (err) {
    console.error('Erro ao buscar usuário atual:', err);
    res.status(500).json({ error: err.message });
  }
};


// Cadastrando um usuário
const createUser = async (req, res) => {
  try {
    console.log("Dados recebidos para cadastro:", req.body); // Log dos dados recebidos
    const { nome, email, senha, foto_perfil, fazenda } = req.body;
    const user = await userService.Create(nome, email, senha, foto_perfil, fazenda);
    res.sendStatus(201); // Cod. 201 (CREATED)
  } catch (error) {
    console.log("Erro ao salvar usuário:", error); // Log do erro
    res.sendStatus(500); // Erro interno do servidor
  }
};

// Cadastro completo (usuário + fazenda)
const register = async (req, res) => {
  // Adiciona headers CORS
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  try {
    console.log("🔍 [REGISTER] Dados recebidos:", req.body);
    const { nome, email, senha, foto_perfil, fazenda } = req.body;
    
    // Verificar se o usuário já existe
    const existingUser = await userService.getOne(email);
    if (existingUser) {
      console.log("❌ [REGISTER] Usuário já existe:", email);
      return res.status(400).json({ 
        error: `Usuário com o email '${email}' já existe. Tente usar um email diferente ou faça login.` 
      });
    }
    
    // 🔍 VALIDAR SE O EMAIL REALMENTE EXISTE
    console.log("🔍 [REGISTER] Validando email:", email);
    
    // Verificar se a validação de email está habilitada
    if (process.env.VALIDATE_EMAIL_ON_REGISTER !== 'false') {
      const emailValidation = await emailService.validateEmailForSettings(email);
      
      if (!emailValidation.valid) {
        console.log("❌ [REGISTER] Email inválido:", emailValidation.message);
        return res.status(400).json({
          error: `Email inválido: ${emailValidation.message}. Por favor, verifique se o email está correto.`
        });
      }
      
      if (emailValidation.warning) {
        console.log("⚠️ [REGISTER] Aviso na validação do email:", emailValidation.message);
        // Não bloqueia o cadastro, mas registra o aviso
      }
      
      console.log("✅ [REGISTER] Email validado com sucesso");
    } else {
      console.log("⏭️ [REGISTER] Validação de email desabilitada");
    }
    
    let fazendaDoc = null;
    if (fazenda) {
      fazendaDoc = new Fazendas(fazenda);
      await fazendaDoc.save();
      console.log("✅ [REGISTER] Fazenda criada:", fazendaDoc._id);
    }
    
    console.log("📝 [REGISTER] Criando usuário...");
    const user = await userService.Create(nome, email, senha, foto_perfil, fazendaDoc ? fazendaDoc._id : undefined);
    console.log("✅ [REGISTER] Usuário criado:", user._id);
    
    res.status(201).json(user);
  } catch (err) {
    console.error("❌ [REGISTER] Erro:", err);
    res.status(500).json({ error: err.message });
  }
};

// Removido o método registerUser, pois não será mais usado

// Autenticando um usuário
const loginUser = async (req, res) => {
  // Adiciona headers CORS
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  try {
    const { email, senha } = req.body;
    // Log dos dados recebidos
    console.log("Tentando login com:", email, senha);
    // Se o e-mail não está vazio
    if (email != undefined) {
      // Busca o usuário no banco
      const user = await userService.getOne(email);
      // Log do usuário encontrado
      console.log("Usuário encontrado:", user);
      // Usuário encontrado
      if (user != undefined) {
        // Senha correta
        if (user.senha == senha) {
          // Gerando o token
          jwt.sign(
            { id: user._id, email: user.email },
            JWTSecret,
            { expiresIn: "48h" },
            (error, token) => {
              if (error) {
                res.status(400).json({ error: "Erro ao gerar o token." }); // Bad request
              } else {
                res.status(200).json({ token: token });
                
              }
            });
          // Senha incorreta
        } else {
          res.status(401).json({ error: "Credenciais inválidas" }); // Unauthorized
        }
    // Usuário não encontrado
      } else {
        res.status(404).json({error: "Usuário não encontrado."}) //Not found
      }
      // E-mail inválido ou vazio
    } else {
        res.status(400).json({error: "O e-mail enviado é inválido."}) // Bad request
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500); // Erro interno do servidor
  }
};

// Atualizar foto do usuário
const updateUserPhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const { foto_perfil } = req.body;
    
    const user = await userService.updatePhoto(id, foto_perfil);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    
    res.json({ message: "Foto do usuário atualizada com sucesso!", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { createUser, loginUser, JWTSecret, register, getUserById, updateUserPhoto, getCurrentUser };
