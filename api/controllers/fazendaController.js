import fazendaService from "../services/fazendaService.js";
import UsuariosxFazendas from "../models/UsuariosxFazendas.js";

// Função para cadastrar fazenda (padrão Express)
const createFazenda = async (req, res) => {
  try {
    console.log("🔍 [FAZENDA] Body recebido:", req.body);
    console.log("🔍 [FAZENDA] Usuário logado:", req.loggedUser);
    
    const usuarioId = req.loggedUser?.id;
    if (!usuarioId) {
      console.log("❌ [FAZENDA] Usuário não autenticado");
      return res.status(401).json({ error: "Usuário não autenticado" });
    }
    
    console.log("📝 [FAZENDA] Criando fazenda...");
    const result = await fazendaService.Create(
      req.body.nome,
      req.body.rua,
      req.body.bairro,
      req.body.cidade,
      req.body.numero
    );
    
    if (!result) {
      console.log("❌ [FAZENDA] Falha ao salvar fazenda no banco");
      return res.status(500).json({ error: "Falha ao salvar no banco." });
    }
    
    console.log("✅ [FAZENDA] Fazenda criada:", result._id);
    
    // Cria o relacionamento na tabela intermediária
    console.log("🔗 [FAZENDA] Criando relacionamento usuário-fazenda...");
    await UsuariosxFazendas.create({ usuario: usuarioId, fazenda: result._id });
    console.log("✅ [FAZENDA] Relacionamento criado");
    
    res.status(201).json({ message: "Fazenda criada com sucesso!" });
  } catch (error) {
    console.error("❌ [FAZENDA] Erro no controller:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

const getAllFazendas = async (req, res) => {
  try {
    const farms = await fazendaService.getAll();
    res.status(200).json(farms);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Erro ao buscar fazendas." });
  }
};

const getFazendaById = async (req, res) => {
  try {
    const fazenda = await fazendaService.getById(req.params.id);
    if (!fazenda) return res.status(404).json({ error: "Fazenda não encontrada" });
    res.json(fazenda);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Atualizar foto da fazenda
const updateFotoFazenda = async (req, res) => {
  try {
    const { id } = req.params;
    const { foto_sitio } = req.body;
    const fazenda = await fazendaService.updateFoto(id, foto_sitio);
    if (!fazenda) return res.status(404).json({ error: "Fazenda não encontrada" });
    res.json({ message: "Foto da fazenda atualizada com sucesso!", fazenda });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET foto da fazenda
const getFotoFazenda = async (req, res) => {
  try {
    const { id } = req.params;
    const fazenda = await fazendaService.getById(id);
    if (!fazenda || !fazenda.foto_sitio) {
      return res.status(404).send("Sem foto");
    }
    res.json({ foto: fazenda.foto_sitio });
  } catch (err) {
    res.status(500).send("Erro ao buscar foto");
  }
};

export default { createFazenda, getAllFazendas, getFazendaById, updateFotoFazenda, getFotoFazenda }; 