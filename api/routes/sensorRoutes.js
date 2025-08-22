import express from "express";
const sensorRoutes = express.Router();
import sensorController from "../controllers/sensorController.js";
import multer from 'multer';
import Auth from "../middleware/Auth.js";

const upload = multer();

sensorRoutes.post("/sensores", Auth.Authorization, upload.single('foto_sensor'), sensorController.createSensor);
sensorRoutes.get("/sensores", Auth.Authorization, sensorController.getAllSensores);
sensorRoutes.get("/sensores/:id", Auth.Authorization, sensorController.getSensorById);
sensorRoutes.put("/sensores/:id", Auth.Authorization, upload.single('foto_sensor'), sensorController.updateSensor);
sensorRoutes.delete("/sensores/:id", Auth.Authorization, sensorController.deleteSensor);

export default sensorRoutes; 