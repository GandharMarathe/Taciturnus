require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

// Choose your service
const dbService = require('./services/firebaseService'); // or './services/supabaseService'
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
  const room = await dbService.createRoom(roomId, name, username);
  res.json(room);
});

app.post('/api/rooms/:roomId/join', async (req, res) => {
  const { username } = req.body;
  const room = await dbService.joinRoom(req.params.roomId, username);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  res.json({ room });
});

app.get('/api/rooms/:roomId/messages', async (req, res) => {
  const messages = await dbService.getMessages(req.params.roomId);
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
    
    await dbService.addMessage(roomId, message);
    io.to(roomId).emit('new-message', message);

    // Handle AI commands
    if (text.startsWith('@AI')) {
      const command = text.slice(3).trim();
      const recentMessages = await dbService.getMessages(roomId);
      const aiResponse = await aiService.handleCommand(command, recentMessages.slice(-10));
      
      const aiMessage = {
        sender: 'AI Assistant',
        text: aiResponse,
        timestamp: new Date(),
        isAI: true
      };
      
      await dbService.addMessage(roomId, aiMessage);
      setTimeout(() => {
        io.to(roomId).emit('new-message', aiMessage);
      }, 1000);
    }
  });

  socket.on('change-ai-mode', async (data) => {
    const { roomId, mode } = data;
    await dbService.updateAiMode(roomId, mode);
    io.to(roomId).emit('ai-mode-changed', mode);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));