import ParametrosAtuais from "../models/Parametros_atuais.js";
import Cativeiros from "../models/Cativeiros.js";

// POST - Receber dados dos sensores do ESP32
const cadastrarParametros = async (req, res) => {
  try {
    const { id_cativeiro, temperatura, ph, amonia } = req.body;

    // Validação dos dados obrigatórios
    if (!id_cativeiro) {
      return res.status(400).json({ error: "ID do cativeiro é obrigatório" });
    }

    if (temperatura === undefined || ph === undefined || amonia === undefined) {
      return res.status(400).json({ error: "Temperatura, pH e amônia são obrigatórios" });
    }

    // Validação dos tipos de dados
    if (typeof temperatura !== 'number' || typeof ph !== 'number' || typeof amonia !== 'number') {
      return res.status(400).json({ error: "Temperatura, pH e amônia devem ser números" });
    }

    // Verificar se o cativeiro existe
    const cativeiro = await Cativeiros.findById(id_cativeiro);
    if (!cativeiro) {
      return res.status(404).json({ error: "Cativeiro não encontrado" });
    }

    // Criar novo registro de parâmetros
    const novoParametro = new ParametrosAtuais({
      id_cativeiro,
      temp_atual: temperatura,
      ph_atual: ph,
      amonia_atual: amonia,
      datahora: new Date()
    });

    await novoParametro.save();

    res.status(201).json({
      success: true,
      message: "Parâmetros cadastrados com sucesso",
      data: {
        id: novoParametro._id,
        cativeiro: cativeiro.nome,
        temperatura,
        ph,
        amonia,
        datahora: novoParametro.datahora
      }
    });

  } catch (error) {
    console.error('Erro ao cadastrar parâmetros:', error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// GET - Buscar dados atuais de um cativeiro específico
const getParametrosAtuais = async (req, res) => {
  try {
    const { cativeiroId } = req.params;
    
    if (!cativeiroId) {
      return res.status(400).json({ error: "ID do cativeiro é obrigatório" });
    }

    // Busca o cativeiro para verificar se existe
    const cativeiro = await Cativeiros.findById(cativeiroId);
    if (!cativeiro) {
      return res.status(404).json({ error: "Cativeiro não encontrado" });
    }

    // Busca o parâmetro mais recente do cativeiro
    const parametroAtual = await ParametrosAtuais.findOne({ 
      id_cativeiro: cativeiroId 
    }).sort({ datahora: -1 });

    // Se não há dados, usa valores padrão
    const parametros = parametroAtual ? {
      temperatura: parametroAtual.temp_atual,
      ph: parametroAtual.ph_atual,
      amonia: parametroAtual.amonia_atual,
      datahora: parametroAtual.datahora
    } : {
      temperatura: null,
      ph: null,
      amonia: null,
      datahora: null
    };

    res.json({
      cativeiro: {
        id: cativeiro._id,
        nome: cativeiro.nome
      },
      parametros: parametros
    });

  } catch (error) {
    console.error('Erro ao buscar parâmetros atuais:', error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// GET - Buscar dados históricos dos últimos X dias
const getParametrosHistoricos = async (req, res) => {
  try {
    const { cativeiroId } = req.params;
    const { dias = 7 } = req.query;
    
    if (!cativeiroId) {
      return res.status(400).json({ error: "ID do cativeiro é obrigatório" });
    }

    // Busca o cativeiro para verificar se existe
    const cativeiro = await Cativeiros.findById(cativeiroId);
    if (!cativeiro) {
      return res.status(404).json({ error: "Cativeiro não encontrado" });
    }

    // Calcula a data limite (X dias atrás)
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - parseInt(dias));

    // Busca os parâmetros dos últimos X dias
    const parametros = await ParametrosAtuais.find({
      id_cativeiro: cativeiroId,
      datahora: { $gte: dataLimite }
    }).sort({ datahora: 1 });

    // Se não há dados históricos, retorna array vazio
    if (parametros.length === 0) {
      return res.json({
        cativeiro: {
          id: cativeiro._id,
          nome: cativeiro.nome
        },
        dados: []
      });
    }

    // Formata os dados para retorno
    const dadosFormatados = parametros.map(parametro => ({
      datahora: parametro.datahora,
      temperatura: parametro.temp_atual,
      ph: parametro.ph_atual,
      amonia: parametro.amonia_atual
    }));

    res.json({
      cativeiro: {
        id: cativeiro._id,
        nome: cativeiro.nome
      },
      periodo: `${dias} dias`,
      total_registros: dadosFormatados.length,
      dados: dadosFormatados
    });

  } catch (error) {
    console.error('Erro ao buscar parâmetros históricos:', error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// GET - Buscar dados para o dashboard (atual + histórico resumido)
const getDadosDashboard = async (req, res) => {
  try {
    const { cativeiroId } = req.params;
    
    if (!cativeiroId) {
      return res.status(400).json({ error: "ID do cativeiro é obrigatório" });
    }

    // Busca o cativeiro
    const cativeiro = await Cativeiros.findById(cativeiroId);
    if (!cativeiro) {
      return res.status(404).json({ error: "Cativeiro não encontrado" });
    }

    // Busca o parâmetro mais recente
    const parametroAtual = await ParametrosAtuais.findOne({ 
      id_cativeiro: cativeiroId 
    }).sort({ datahora: -1 });

    // Se não há dados, usa valores padrão
    const dadosAtuais = parametroAtual ? {
      temperatura: parametroAtual.temp_atual,
      ph: parametroAtual.ph_atual,
      amonia: parametroAtual.amonia_atual,
      datahora: parametroAtual.datahora
    } : {
      temperatura: null,
      ph: null,
      amonia: null,
      datahora: null
    };

    // Busca dados dos últimos 7 dias para o gráfico
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - 7);

    const parametrosHistoricos = await ParametrosAtuais.find({
      id_cativeiro: cativeiroId,
      datahora: { $gte: dataLimite }
    }).sort({ datahora: 1 });

    // Agrupa por dia e calcula médias
    const dadosPorDia = {};
    parametrosHistoricos.forEach(parametro => {
      const data = new Date(parametro.datahora);
      const dia = data.toISOString().split('T')[0];
      
      if (!dadosPorDia[dia]) {
        dadosPorDia[dia] = {
          temperatura: [],
          ph: [],
          amonia: []
        };
      }
      
      dadosPorDia[dia].temperatura.push(parametro.temp_atual);
      dadosPorDia[dia].ph.push(parametro.ph_atual);
      dadosPorDia[dia].amonia.push(parametro.amonia_atual);
    });

    // Calcula médias diárias para os últimos 7 dias
    const dadosSemanais = [];
    for (let i = 6; i >= 0; i--) {
      const data = new Date();
      data.setDate(data.getDate() - i);
      const dia = data.toISOString().split('T')[0];
      
      if (dadosPorDia[dia]) {
        const dados = dadosPorDia[dia];
        dadosSemanais.push({
          data: dia,
          temperatura: dados.temperatura.reduce((a, b) => a + b, 0) / dados.temperatura.length,
          ph: dados.ph.reduce((a, b) => a + b, 0) / dados.ph.length,
          amonia: dados.amonia.reduce((a, b) => a + b, 0) / dados.amonia.length
        });
      } else {
        // Se não há dados para este dia, usa valores padrão
        dadosSemanais.push({
          data: dia,
          temperatura: null,
          ph: null,
          amonia: null
        });
      }
    }

    res.json({
      cativeiro: {
        id: cativeiro._id,
        nome: cativeiro.nome
      },
      dadosAtuais: dadosAtuais,
      dadosSemanais: dadosSemanais
    });

  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export {
  cadastrarParametros,
  getParametrosAtuais,
  getParametrosHistoricos,
  getDadosDashboard
}; 