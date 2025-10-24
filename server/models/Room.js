const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  isAI: { type: Boolean, default: false }
});

const roomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  participants: [String],
  messages: [messageSchema],
  aiMode: { type: String, enum: ['summarizer', 'brainstorm', 'moderator', 'research'], default: 'summarizer' },
  lastSummary: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);