import mongoose from "mongoose";
import TiposSensor from "./models/Tipos_sensores.js"; // ajuste o caminho se necessário

const mongoUrl = "mongodb://localhost:27017/camarize"; // ajuste para o nome do seu banco

async function seed() {
  await mongoose.connect(mongoUrl);

  const count = await TiposSensor.countDocuments();
  if (count === 0) {
    await TiposSensor.insertMany([
      { descricao: 'Temperatura', foto_sensor: null },
      { descricao: 'PH', foto_sensor: null },
      { descricao: 'Amonia', foto_sensor: null },
      { descricao: 'Nível de raçao', foto_sensor: null },
      { descricao: 'Motor dispensador de raçao', foto_sensor: null },
    ]);
    console.log("Valores iniciais adicionados com sucesso!");
  } else {
    console.log("Valores iniciais já existem no banco de dados.");
  }
  await mongoose.disconnect();
}

seed();