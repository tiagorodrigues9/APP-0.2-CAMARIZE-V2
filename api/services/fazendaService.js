import Fazenda from "../models/Fazendas.js";

class fazendaService {
  // Listar todas as fazendas
  async getAll() {
    try {
      const Fazendas = await Fazenda.find();
      return Fazendas;
    } catch (error) {
      console.log(error);
    }
  }

  // Cadastrar fazenda
  async Create(nome, rua, bairro, cidade, numero) {
    try {
      const newFazenda = new Fazenda({
        nome,
        rua,
        bairro,
        cidade,
        numero
      });
      const saved = await newFazenda.save();
      return saved;
    } catch (error) {
      console.log("Erro ao salvar no banco:", error);
      return null; // 👈 importante
    }
  }

  // Deletar fazenda
  async Delete(id) {
    try {
      await Fazenda.findByIdAndDelete(id);
      console.log(`Fazenda com a id: ${id} foi excluída.`);
    } catch (error) {
      console.log(error);
    }
  }

  // Alterar fazenda
  async Update(id, nome, rua, bairro, cidade, numero) {
    try {
      await Fazenda.findByIdAndUpdate(id, {
        nome,
        rua,
        bairro,
        cidade,
        numero
      });
      console.log(`Dados da fazenda com a id: ${id} alterados com sucesso.`);
    } catch (error) {
      console.log(error);
    }
  }

  // Listar uma única fazenda
  async getOne(id) {
    try {
      const fazenda = await Fazenda.findOne({ _id: id });
      return fazenda;
    } catch (error) {
      console.log(error);
    }
  }

  // Buscar fazenda por ID (usado pelo controller)
  async getById(id) {
    try {
      return await Fazenda.findById(id);
    } catch (error) {
      console.log(error);
    }
  }

  // Atualizar foto da fazenda
  async updateFoto(id, foto_sitio) {
    try {
      return await Fazenda.findByIdAndUpdate(id, { foto_sitio }, { new: true });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

export default new fazendaService(); 