// models/ParametrosAtuais.js
import mongoose from "mongoose";

const ParametrosAtuaisSchema = new mongoose.Schema({
  datahora: {
    type: Date,
    required: true,
    default: Date.now,
  },
  temp_atual: {
    type: Number,
    required: true,
  },
  ph_atual: {
    type: Number,
    required: true,
  },
  amonia_atual: {
    type: Number,
    required: true,
  },
  id_cativeiro: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cativeiros",
    required: true,
  }
}, {
  collection: "parametros_atuais",
  timestamps: false
});

const ParametrosAtuais = mongoose.model("ParametrosAtuais", ParametrosAtuaisSchema);
export default ParametrosAtuais;