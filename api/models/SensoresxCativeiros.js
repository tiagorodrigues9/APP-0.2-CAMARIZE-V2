// models/SensoresxCativeiros.js
import mongoose from "mongoose";

const SensoresxCativeirosSchema = new mongoose.Schema({
  id_sensor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Sensores",
    required: true,
  },
  id_cativeiro: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cativeiros",
    required: true,
  }
}, {
  collection: "SensoresxCativeiros",
  timestamps: false
});

const SensoresxCativeiros = mongoose.model("SensoresxCativeiros", SensoresxCativeirosSchema);
export default SensoresxCativeiros;