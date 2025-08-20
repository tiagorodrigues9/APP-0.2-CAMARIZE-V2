import Game from "../models/Games.js";

class tanqueService {
  // Game.find().then(games => {
  // //sucesso
  // }).catch(error => {
  // // falha
  // })

  // async / await
  // Função para listar os jogos
  async getAll() {
    try {
      const tanques = await Tanque.find();
      return games;
    } catch (error) {
      console.log(error);
    }
  }

  // Função para cadastrar jogos
  async Create(title, year, price, descriptions) {
    try {
      const newGame = new Game({
        // title : title
        title,
        year,
        price,
        descriptions
      });
      // Método do mongoose para cadastrar .save()
      await newGame.save();
    } catch (error) {
      console.log(error);
    }
  }

  // Função para deletar jogos
  async Delete(id) {
    try {
      await Game.findByIdAndDelete(id);
      console.log(`Game com a id: ${id} foi excluído.`);
    } catch (error) {
      console.log(error);
    }
  }

  // Função para alterar jogos
  async Update(id, title, year, price, descriptions) {
    try {
      await Game.findByIdAndUpdate(id, {
        // title : title
        title,
        year,
        price,
        descriptions
      });
      console.log(`Dados do game com a id: ${id} alterados com sucesso.`);
    } catch (error) {
      console.log(error);
    }
  }

  // Função para listar um único jogo
  async getOne(id) {
    try {
      const game = await Game.findOne({ _id: id });
      return game;
    } catch (error) {
      console.log(error);
    }
  }
}

export default new gameService();
