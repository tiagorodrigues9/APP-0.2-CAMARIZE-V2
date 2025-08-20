import Sensores from "../models/Sensores.js";

class sensorService {
  async getAll() {
    try {
      return await Sensores.find().populate('id_tipo_sensor');
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async getById(id) {
    try {
      return await Sensores.findById(id).populate('id_tipo_sensor');
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async create(data) {
    try {
      const novo = new Sensores(data);
      return await novo.save();
    } catch (error) {
      console.log("Erro ao salvar sensor:", error);
      return null;
    }
  }

  async update(id, data) {
    try {
      return await Sensores.findByIdAndUpdate(id, data, { new: true });
    } catch (error) {
      console.log("Erro ao atualizar sensor:", error);
      return null;
    }
  }

  async delete(id) {
    try {
      return await Sensores.findByIdAndDelete(id);
    } catch (error) {
      console.log("Erro ao deletar sensor:", error);
      return null;
    }
  }
}

export default new sensorService(); 