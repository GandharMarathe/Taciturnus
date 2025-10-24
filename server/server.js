require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const Room = require('./models/Room');
const aiService = require('./services/aiService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] }
});

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI);

// Routes
app.post('/api/rooms', async (req, res) => {
  const { name, username } = req.body;
  const roomId = uuidv4().slice(0, 8);
  
  const room = new Room({
    roomId,
    name,
    participants: [username]
  });
  
  await room.save();
  res.json({ roomId, name });
});

app.post('/api/rooms/:roomId/join', async (req, res) => {
  const { username } = req.body;
  const room = await Room.findOne({ roomId: req.params.roomId });
  
  if (!room) return res.status(404).json({ error: 'Room not found' });
  
  if (!room.participants.includes(username)) {
    room.participants.push(username);
    await room.save();
  }
  
  res.json({ room: { roomId: room.roomId, name: room.name, participants: room.participants } });
});

app.get('/api/rooms/:roomId/messages', async (req, res) => {
  const room = await Room.findOne({ roomId: req.params.roomId });
  res.json(room ? room.messages : []);
});

// Socket handling
io.on('connection', (socket) => {
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
  });

  socket.on('send-message', async (data) => {
    const { roomId, sender, text } = data;
    const room = await Room.findOne({ roomId });
    
    if (!room) return;

    const message = { sender, text, timestamp: new Date() };
    room.messages.push(message);
    await room.save();

    io.to(roomId).emit('new-message', message);

    // Handle AI commands
    if (text.startsWith('@AI')) {
      const command = text.slice(3).trim();
      const recentMessages = room.messages.slice(-10);
      
      const aiResponse = await aiService.handleCommand(command, recentMessages, room.aiMode);
      
      const aiMessage = {
        sender: 'AI Assistant',
        text: aiResponse,
        timestamp: new Date(),
        isAI: true
      };
      
      room.messages.push(aiMessage);
      await room.save();
      
      setTimeout(() => {
        io.to(roomId).emit('new-message', aiMessage);
      }, 1000);
    }
  });

  socket.on('change-ai-mode', async (data) => {
    const { roomId, mode } = data;
    await Room.findOneAndUpdate({ roomId }, { aiMode: mode });
    io.to(roomId).emit('ai-mode-changed', mode);
  });
});

// Auto-summary every 10 minutes
setInterval(async () => {
  const rooms = await Room.find({
    lastSummary: { $lt: new Date(Date.now() - 10 * 60 * 1000) },
    'messages.0': { $exists: true }
  });

  for (const room of rooms) {
    const recentMessages = room.messages.slice(-20);
    if (recentMessages.length < 5) continue;

    const summary = await aiService.processMessage(recentMessages, '', 'summarizer');
    
    const summaryMessage = {
      sender: 'AI Assistant',
      text: `📋 **Auto Summary**: ${summary}`,
      timestamp: new Date(),
      isAI: true
    };

    room.messages.push(summaryMessage);
    room.lastSummary = new Date();
    await room.save();

    io.to(room.roomId).emit('new-message', summaryMessage);
  }
}, 10 * 60 * 1000);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));