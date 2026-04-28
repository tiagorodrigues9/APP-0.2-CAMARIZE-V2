import jwt from "jsonwebtoken";
import userController from "../controllers/userController.js";
import userService from "../services/userService.js";

// Verifica o JWT e valida o tokenVersion contra o banco.
// Role vem direto do payload — sem query extra para buscá-la.
const Authorization = async (req, res, next) => {
  const authToken = req.headers["authorization"];
  if (!authToken) {
    return res.status(401).json({ error: "Token inválido." });
  }

  const token = authToken.split(" ")[1];

  let data;
  try {
    data = jwt.verify(token, userController.JWTSecret);
  } catch {
    return res.status(401).json({ error: "Token inválido. Não autorizado." });
  }

  // Valida tokenVersion — detecta se o usuário fez logout após emissão do token
  try {
    const user = await userService.getById(data.id);
    if (!user) {
      return res.status(401).json({ error: "Usuário não encontrado." });
    }
    if ((user.tokenVersion ?? 0) !== (data.tokenVersion ?? 0)) {
      return res.status(401).json({ error: "Sessão expirada. Faça login novamente." });
    }

    req.token = token;
    req.loggedUser = {
      id: data.id,
      email: data.email,
      role: data.role,          // vem do payload, sem query adicional
      tokenVersion: data.tokenVersion,
    };
  } catch (err) {
    console.error("Erro na verificação do token:", err);
    return res.status(500).json({ error: "Erro de autenticação." });
  }

  next();
};

// Verifica se o usuário tem uma das roles permitidas.
// Role já está em req.loggedUser — sem query ao banco.
const RequireRole = (roles) => (req, res, next) => {
  if (!req.loggedUser?.id) {
    return res.status(401).json({ error: "Não autenticado" });
  }
  if (!roles.includes(req.loggedUser.role)) {
    return res.status(403).json({ error: "Acesso negado" });
  }
  next();
};

export default { Authorization, RequireRole };

// Middleware global: bloqueia membros de realizar escritas, exceto em rotas públicas
export const BlockMembersWrite = async (req, res, next) => {
  try {
    const method = (req.method || '').toUpperCase();
    const isWrite = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
    if (!isWrite) return next();

    // Rotas públicas de escrita — sem autenticação exigida
    const publicPaths = [
      '/requests',
      '/users/auth',
      '/users/register',
      '/users/user',
      '/parametros/cadastrar',
    ];
    if (publicPaths.some(p => req.path?.startsWith(p))) return next();

    const authToken = req.headers["authorization"];
    if (!authToken) return res.status(401).json({ error: "Não autenticado" });

    const token = (authToken.split(' ')[1] || '').trim();
    let data;
    try {
      data = jwt.verify(token, userController.JWTSecret);
    } catch {
      return res.status(401).json({ error: "Token inválido" });
    }

    // Role vem do payload — sem query ao banco
    if (data.role === 'membro') {
      return res.status(403).json({ error: "Usuário membro não pode alterar dados. Envie uma solicitação." });
    }

    return next();
  } catch (err) {
    return res.status(500).json({ error: "Erro de autorização" });
  }
};
