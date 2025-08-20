import mongoose from "mongoose";

const FazendasxCativeirosSchema = new mongoose.Schema({
  fazenda: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Fazendas",
    required: true
  },
  cativeiro: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cativeiros",
    required: true
  }
});

const FazendasxCativeiros = mongoose.model("FazendasxCativeiros", FazendasxCativeirosSchema);
export default FazendasxCativeiros; 