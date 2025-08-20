
import mongoose from "mongoose";

const TiposSensorSchema = new mongoose.Schema({
  descricao: {
    type: String,
    maxlength: 100,
    required: false,
  },
  foto_sensor: {
    type: Buffer,
    required: false,
  }
}, {
  collection: "Tipos_sensor"
});

const TiposSensor = mongoose.model("TiposSensor", TiposSensorSchema);

// Mock: cria um tipo de sensor se não existir nenhum
TiposSensor.countDocuments().then(count => {
  if (count === 0) {
    TiposSensor.create({ descricao: 'Temperatura' });
  }
});

export default TiposSensor; 