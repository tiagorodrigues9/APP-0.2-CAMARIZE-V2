import express from "express";
const sensorRoutes = express.Router();
import sensorController from "../controllers/sensorController.js";
import multer from 'multer';
const upload = multer();

sensorRoutes.post("/sensores", upload.single('foto_sensor'), sensorController.createSensor);
sensorRoutes.get("/sensores", sensorController.getAllSensores);
sensorRoutes.get("/sensores/:id", sensorController.getSensorById);
sensorRoutes.put("/sensores/:id", upload.single('foto_sensor'), sensorController.updateSensor);
sensorRoutes.delete("/sensores/:id", sensorController.deleteSensor);

export default sensorRoutes; 