import mongoose from "mongoose";

console.log('Fazendas model carregado');

const FazendasSchema = new mongoose.Schema({
  codigo: {
    type: Number,
    unique: true,
    default: -1
  },
  nome: {
    type: String,
    required: true,
  },
  rua: {
    type: String,
    required: true,
  },
  bairro: {
    type: String,
    required: true,
  },
  cidade: {
    type: String,
    required: true,
  },
  numero: {
    type: Number,
    required: true,
  },
  foto_sitio: {
    type: String,
    required: false,
    default: null
  }
}, {
  collection: "Fazendas",
  timestamps: false
});

// Hook robusto para autoincrementar o campo codigo
FazendasSchema.pre('save', async function(next) {
  if (this.isNew && (this.codigo === undefined || this.codigo === null || this.codigo === -1)) {
    try {
      const ultimo = await mongoose.models.Fazendas.findOne().sort({ codigo: -1 });
      this.codigo = ultimo ? ultimo.codigo + 1 : 1;
      next();
    } catch (err) {
      next(err);
    }
  } else if (this.codigo === null || this.codigo === undefined || this.codigo === -1) {
    return next(new Error('O campo codigo não pode ser nulo.'));
  } else {
    next();
  }
});

const Fazendas = mongoose.model("Fazendas", FazendasSchema);
export default Fazendas;