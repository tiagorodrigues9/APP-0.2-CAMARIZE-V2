import express from "express";
const camaraoRoutes = express.Router();
import camaraoController from "../controllers/camaraoController.js";

camaraoRoutes.post("/camaroes", camaraoController.createCamarao);
camaraoRoutes.get("/camaroes", camaraoController.getAllCamaroes);

export default camaraoRoutes; 