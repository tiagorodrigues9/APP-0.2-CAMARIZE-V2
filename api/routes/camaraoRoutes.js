import express from "express";
const camaraoRoutes = express.Router();
import camaraoController from "../controllers/camaraoController.js";

/**
 * @swagger
 * tags:
 *   name: Camarões
 *   description: Tipos de camarão cadastrados no sistema
 */

/**
 * @swagger
 * /camaroes:
 *   post:
 *     summary: Cadastrar novo tipo de camarão
 *     tags: [Camarões]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 example: Litopenaeus vannamei
 *     responses:
 *       201:
 *         description: Tipo de camarão criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TipoCamarao'
 *   get:
 *     summary: Listar todos os tipos de camarão
 *     tags: [Camarões]
 *     responses:
 *       200:
 *         description: Lista de tipos de camarão
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TipoCamarao'
 */
camaraoRoutes.post("/camaroes", camaraoController.createCamarao);
camaraoRoutes.get("/camaroes", camaraoController.getAllCamaroes);

export default camaraoRoutes;
