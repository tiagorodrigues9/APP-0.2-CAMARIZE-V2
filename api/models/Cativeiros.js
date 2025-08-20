// models/Cativeiros.js
import mongoose from "mongoose";

const CativeirosSchema = new mongoose.Schema({
  id_cativeiro: Number, // ou ObjectId, se preferir
  nome: {
    type: String,
    required: true,
    default: function() {
      return `Cativeiro ${this.id_cativeiro || 'N/A'}`;
    }
  },
  // campo fazenda removido para normalização
  id_tipo_camarao: {
    type: mongoose.Schema.Types.ObjectId, // Referência ao _id do TiposCamarao
    ref: "TiposCamaroes",
    required: true,
  },
  data_instalacao: {
    type: Date,
    required: true,
  },
  foto_cativeiro: {
    type: Buffer, // Para armazenar binário (imagem)
    required: false,
    default: null
  },
  temp_media_diaria: {
    type: String,
    default: null
  },
  ph_medio_diario: {
    type: String,
    default: null
  },
  amonia_media_diaria: {
    type: String,
    default: null
  },
  condicoes_ideais: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CondicoesIdeais",
    required: false,
    default: null
  },
  // Campo para associar o cativeiro ao usuário proprietário
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false
  }
});

const Cativeiros = mongoose.model("Cativeiros", CativeirosSchema);
export default Cativeiros;