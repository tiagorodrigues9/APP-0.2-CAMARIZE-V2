import mongoose from "mongoose";

const DietasSchema = new mongoose.Schema({
  descricao: {
    type: String,
    maxlength: 100,
    required: false,
  },
  horaAlimentacao: {
    type: String, // Exemplo: "08:00"
    required: true,
  },
  quantidade: {
    type: Number,
    required: true,
  }
}, {
  collection: "Dietas"
});

const Dietas = mongoose.model("Dietas", DietasSchema);
export default Dietas; 