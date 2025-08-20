import mongoose from "mongoose";

const TiposCamaraoSchema = new mongoose.Schema({
  nome: {
    type: String,
    maxlength: 100,
    required: false,
  }
  // Não precisa de id_tipo_camarao, pois o _id do MongoDB já é único e auto-incrementado (ObjectId)
});

const TiposCamarao = mongoose.model("TiposCamaroes", TiposCamaraoSchema);
export default TiposCamarao; 