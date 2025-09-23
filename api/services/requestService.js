import Request from "../models/Requests.js";

class RequestService {
  async create({ requesterUser, requesterRole, targetRole, type, action, payload, fazenda }) {
    const req = new Request({ requesterUser, requesterRole, targetRole, type, action, payload, fazenda });
    return await req.save();
  }

  async list(filter = {}) {
    return await Request.find(filter)
      .populate('requesterUser', 'nome email')
      .populate('approverUser', 'nome email')
      .sort({ createdAt: -1 });
  }

  async approve(id, approverUser) {
    return await Request.findByIdAndUpdate(id, { status: 'aprovado', approverUser }, { new: true });
  }

  async reject(id, approverUser) {
    return await Request.findByIdAndUpdate(id, { status: 'recusado', approverUser }, { new: true });
  }

  async deleteByIdForRequester(id, requesterUserId) {
    const found = await Request.findOne({ _id: id, requesterUser: requesterUserId });
    if (!found) return null;
    await Request.deleteOne({ _id: id });
    return { success: true };
  }
}

export default new RequestService();

