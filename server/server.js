require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const firebaseService = require('./services/firebaseService');
const aiService = require('./services/aiService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] }
});

app.use(cors());
app.use(express.json());

// Routes
app.post('/api/rooms', async (req, res) => {
  const { name, username } = req.body;
  const roomId = uuidv4().slice(0, 8);
  const room = await firebaseService.createRoom(roomId, name, username);
  res.json(room);
});

app.post('/api/rooms/:roomId/join', async (req, res) => {
  const { username } = req.body;
  const room = await firebaseService.joinRoom(req.params.roomId, username);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  res.json({ room });
});

app.get('/api/rooms/:roomId/messages', async (req, res) => {
  const messages = await firebaseService.getMessages(req.params.roomId);
  res.json(messages);
});

// Socket handling
io.on('connection', (socket) => {
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
  });

  socket.on('send-message', async (data) => {
    const { roomId, sender, text } = data;
    const message = { sender, text, timestamp: new Date() };
    
    await firebaseService.addMessage(roomId, message);
    io.to(roomId).emit('new-message', message);

    // Handle AI commands
    if (text.startsWith('@AI')) {
      const command = text.slice(3).trim();
      const recentMessages = await firebaseService.getMessages(roomId);
      const aiMode = await firebaseService.getAiMode(roomId);
      
      const aiResponse = await aiService.handleCommand(command, recentMessages.slice(-10), aiMode);
      
      const aiMessage = {
        sender: 'AI Assistant',
        text: aiResponse,
        timestamp: new Date(),
        isAI: true
      };
      
      await firebaseService.addMessage(roomId, aiMessage);
      setTimeout(() => {
        io.to(roomId).emit('new-message', aiMessage);
      }, 1000);
    }
  });

  socket.on('change-ai-mode', async (data) => {
    const { roomId, mode } = data;
    await firebaseService.updateAiMode(roomId, mode);
    io.to(roomId).emit('ai-mode-changed', mode);
  });
});

// Auto-summary every 10 minutes
setInterval(async () => {
  const rooms = await firebaseService.getRoomsForSummary();

  for (const room of rooms) {
    const recentMessages = await firebaseService.getMessages(room.roomId);
    if (recentMessages.length < 5) continue;

    const summary = await aiService.processMessage(recentMessages.slice(-20), '', 'summarizer');
    
    const summaryMessage = {
      sender: 'AI Assistant',
      text: `**Auto Summary**: ${summary}`,
      timestamp: new Date(),
      isAI: true
    };

    await firebaseService.addMessage(room.roomId, summaryMessage);
    await firebaseService.updateLastSummary(room.roomId);
    io.to(room.roomId).emit('new-message', summaryMessage);
  }
}, 10 * 60 * 1000);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));