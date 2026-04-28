
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

// Seed: cria um tipo de sensor padrão se não existir nenhum.
// Aguarda a conexão estar aberta para não bloquear o boot quando o banco está indisponível.
mongoose.connection.once('open', async () => {
  const count = await TiposSensor.countDocuments();
  if (count === 0) {
    await TiposSensor.create({ descricao: 'Temperatura' });
  }
});

export default TiposSensor; 