import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, required: true }], // [adminId, masterId]
  lastMessageAt: { type: Date, default: Date.now },
  unreadCounts: { type: Map, of: Number, default: {} }, // userId -> count
}, {
  timestamps: true,
  collection: 'conversations'
});

const Conversation = mongoose.model('Conversation', ConversationSchema);
export default Conversation;


