import mongoose from "mongoose";

const UsuariosxFazendasSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true
  },
  fazenda: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Fazendas",
    required: true
  }
});

const UsuariosxFazendas = mongoose.model("UsuariosxFazendas", UsuariosxFazendasSchema);
export default UsuariosxFazendas; 