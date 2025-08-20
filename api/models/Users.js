import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  nome: { // <-- Adicione esta linha
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  senha: {
    type: String,
    required: true,
  },
  foto_perfil: {
    type: String,
    required: false,
  },
  fazenda: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fazendas',
    required: false
  },
});

const User = mongoose.model("User", userSchema);

export default User;
