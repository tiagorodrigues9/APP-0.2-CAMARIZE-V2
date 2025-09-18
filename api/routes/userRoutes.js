import express from "express";
const userRoutes = express.Router();
import userController from "../controllers/userController.js";
import Auth from "../middleware/Auth.js";

// Endpoint para cadastrar um usuário
userRoutes.post("/user", userController.createUser);

// Endpoint para autenticação (login) do usuário
userRoutes.post("/auth", userController.loginUser);

// Endpoint para cadastro completo (usuário + sitio)
userRoutes.post("/register", userController.register);

// Endpoint para buscar usuário atual (requer autenticação)
userRoutes.get("/me", Auth.Authorization, userController.getCurrentUser);

userRoutes.get('/:id', userController.getUserById);

// Endpoint para atualizar foto do usuário
userRoutes.patch('/:id/photo', userController.updateUserPhoto);

// Listar usuários (somente master)
userRoutes.get('/', Auth.Authorization, Auth.RequireRole(['master']), userController.listUsers);

// Alterar role do usuário (somente master)
userRoutes.patch('/:id/role', Auth.Authorization, Auth.RequireRole(['master']), userController.changeUserRole);

export default userRoutes;