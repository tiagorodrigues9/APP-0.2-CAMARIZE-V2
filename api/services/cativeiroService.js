import Cativeiros from "../models/Cativeiros.js";

class cativeiroService {
  async getAll() {
    try {
      return await Cativeiros.find()
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async Create(data) {
    try {
      const novo = new Cativeiros(data);
      return await novo.save();
    } catch (error) {
      console.log("Erro ao salvar cativeiro:", error);
      return null;
    }
  }

  async getById(id) {
    try {
      const cativeiro = await Cativeiros.findById(id)
        .populate('id_tipo_camarao')
        .populate('condicoes_ideais');
      
      if (!cativeiro) return null;

      // Buscar fazenda relacionada
      const FazendasxCativeiros = (await import('../models/FazendasxCativeiros.js')).default;
      console.log('Buscando relacionamento para cativeiro:', id);
      const relacaoFazenda = await FazendasxCativeiros.findOne({ cativeiro: id }).populate('fazenda');
      console.log('Relacionamento encontrado:', relacaoFazenda);
      
      if (relacaoFazenda) {
        console.log('Fazenda do relacionamento:', relacaoFazenda.fazenda);
        cativeiro.fazenda = relacaoFazenda.fazenda._id;
        cativeiro.fazendaNome = relacaoFazenda.fazenda.nome;
        console.log('Campo fazenda setado no cativeiro:', cativeiro.fazenda);
      } else {
        console.log('Nenhum relacionamento encontrado para o cativeiro:', id);
      }

      // Buscar sensores relacionados
      const SensoresxCativeiros = (await import('../models/SensoresxCativeiros.js')).default;
      const sensoresRelacionados = await SensoresxCativeiros.find({ id_cativeiro: id }).populate('id_sensor');
      const sensores = sensoresRelacionados.map(rel => rel.id_sensor);

      // Adicionar sensores ao objeto do cativeiro
      cativeiro.sensores = sensores;
      
      // Converter para objeto simples para garantir serialização correta
      const cativeiroObj = cativeiro.toObject();
      cativeiroObj.sensores = sensores;
      
      // Garantir que a fazenda seja incluída no objeto
      if (cativeiro.fazenda) {
        cativeiroObj.fazenda = cativeiro.fazenda;
      }
      if (cativeiro.fazendaNome) {
        cativeiroObj.fazendaNome = cativeiro.fazendaNome;
      }
      
      return cativeiroObj;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async update(id, data) {
    try {
      return await Cativeiros.findByIdAndUpdate(id, data, { new: true });
    } catch (error) {
      console.log("Erro ao atualizar cativeiro:", error);
      return null;
    }
  }

  async delete(id) {
    try {
      // Primeiro, excluir relacionamentos
      const FazendasxCativeiros = (await import('../models/FazendasxCativeiros.js')).default;
      const SensoresxCativeiros = (await import('../models/SensoresxCativeiros.js')).default;
      
      // Excluir relacionamento fazenda-cativeiro
      await FazendasxCativeiros.deleteMany({ cativeiro: id });
      console.log(`🗑️ Relacionamentos fazenda-cativeiro excluídos para cativeiro: ${id}`);
      
      // Excluir relacionamentos sensor-cativeiro
      await SensoresxCativeiros.deleteMany({ id_cativeiro: id });
      console.log(`🗑️ Relacionamentos sensor-cativeiro excluídos para cativeiro: ${id}`);
      
      // Excluir o cativeiro
      const result = await Cativeiros.findByIdAndDelete(id);
      console.log(`🗑️ Cativeiro excluído: ${id}`);
      
      return result;
    } catch (error) {
      console.log("Erro ao deletar cativeiro:", error);
      return null;
    }
  }

  async getAllByUsuarioViaRelacionamentos(usuarioId) {
    try {
      // Buscar IDs das fazendas do usuário, populando os dados completos das fazendas
      const UsuariosxFazendas = (await import('../models/UsuariosxFazendas.js')).default;
      const FazendasxCativeiros = (await import('../models/FazendasxCativeiros.js')).default;
      const Cativeiros = (await import('../models/Cativeiros.js')).default;
      const fazendasDoUsuario = await UsuariosxFazendas.find({ usuario: usuarioId }).populate('fazenda');
      const fazendaIds = fazendasDoUsuario.map(f => f.fazenda._id || f.fazenda);
      // Buscar cativeiros dessas fazendas
      const rels = await FazendasxCativeiros.find({ fazenda: { $in: fazendaIds } }, 'cativeiro');
      const cativeiroIds = rels.map(r => r.cativeiro);
      // Buscar dados completos dos cativeiros, populando tipo de camarão e condições ideais
      return await Cativeiros.find({ _id: { $in: cativeiroIds } })
        .populate('id_tipo_camarao')
        .populate('condicoes_ideais');
    } catch (error) {
      console.log(error);
      return [];
    }
  }
}

export default new cativeiroService(); 