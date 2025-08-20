import sensorService from "../services/sensorService.js";

const createSensor = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.foto_sensor = req.file.buffer;
    }
    const result = await sensorService.create(data);
    if (!result) {
      return res.status(500).json({ error: "Falha ao salvar no banco." });
    }
    res.status(201).json({ message: "Sensor criado com sucesso!" });
  } catch (error) {
    console.log("Erro no controller:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

const getAllSensores = async (req, res) => {
  try {
    const sensores = await sensorService.getAll();
    res.status(200).json(sensores);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Erro ao buscar sensores." });
  }
};

const getSensorById = async (req, res) => {
  try {
    const { id } = req.params;
    const sensor = await sensorService.getById(id);
    if (!sensor) {
      return res.status(404).json({ error: 'Sensor não encontrado.' });
    }
    res.status(200).json(sensor);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar sensor.' });
  }
};

const updateSensor = async (req, res) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };
    
    if (req.file) {
      data.foto_sensor = req.file.buffer;
    }

    const result = await sensorService.update(id, data);
    if (!result) {
      return res.status(404).json({ error: 'Sensor não encontrado.' });
    }
    res.status(200).json({ message: 'Sensor atualizado com sucesso!', sensor: result });
  } catch (error) {
    console.log("Erro no controller:", error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

const deleteSensor = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await sensorService.delete(id);
    if (!result) {
      return res.status(404).json({ error: 'Sensor não encontrado.' });
    }
    res.status(200).json({ message: 'Sensor deletado com sucesso!' });
  } catch (error) {
    console.log("Erro no controller:", error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

export default { createSensor, getAllSensores, getSensorById, updateSensor, deleteSensor }; 