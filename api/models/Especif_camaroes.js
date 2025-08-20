// models/EspecifCamarao.js
import mongoose from "mongoose";

const EspecifCamaraoSchema = new mongoose.Schema({
  id_tipo_camarao: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TiposCamaroes",
    required: true,
  },
  id_dieta: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Dietas",
    required: true,
  },
  id_condicao: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CondicoesIdeais",
    required: true,
  }
}, {
  collection: "especif_camarao",
  timestamps: false
});

const EspecifCamarao = mongoose.model("EspecifCamarao", EspecifCamaraoSchema);
export default EspecifCamarao;