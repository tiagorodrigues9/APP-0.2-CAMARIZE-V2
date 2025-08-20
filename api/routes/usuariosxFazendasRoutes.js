import express from "express";
const usuariosxFazendasRoutes = express.Router();
import UsuariosxFazendas from "../models/UsuariosxFazendas.js";

// Endpoint para listar relações usuario-fazenda (com filtro por usuario)
usuariosxFazendasRoutes.get("/", async (req, res) => {
  try {
    const filtro = {};
    if (req.query.usuario) filtro.usuario = req.query.usuario;
    const rels = await UsuariosxFazendas.find(filtro);
    res.json(rels);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar relações usuario-fazenda." });
  }
});

export default usuariosxFazendasRoutes; 