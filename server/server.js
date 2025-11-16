require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');

const firebaseService = require('./services/firebaseService');
const aiService = require('./services/aiService');
const { validateRoom, validateJoin, sanitizeText, sanitizeUsername } = require('./middleware/validation');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { 
    origin: process.env.CLIENT_URL || "http://localhost:3000", 
    methods: ["GET", "POST"] 
  }
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests'
});

app.use(cors());
app.use(express.json());
app.use('/api/', limiter);

// Routes
app.post('/api/rooms', validateRoom, async (req, res) => {
  try {
    const { name, username } = req.body;
    const roomId = uuidv4().slice(0, 8);
    const room = await firebaseService.createRoom(roomId, name, username);
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/rooms/:roomId/join', validateJoin, async (req, res) => {
  try {
    const { username } = req.body;
    const { roomId } = req.params;
    const room = await firebaseService.joinRoom(roomId, username);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json({ room });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/rooms/:roomId/messages', async (req, res) => {
  try {
    const messages = await firebaseService.getMessages(req.params.roomId);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Socket handling
const connectedUsers = new Map();

io.on('connection', (socket) => {
  socket.on('join-room', async (data) => {
    try {
      const roomId = sanitizeText(data.roomId);
      const username = sanitizeUsername(data.username);
      
      if (!roomId || !username) return;
      
      const exists = await firebaseService.roomExists(roomId);
      if (!exists) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }
      
      socket.join(roomId);
      connectedUsers.set(socket.id, { roomId, username });
      socket.to(roomId).emit('user-joined', { username });
    } catch (error) {
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  socket.on('send-message', async (data) => {
    try {
      const { roomId, sender, text } = data;
      const sanitizedText = sanitizeText(text);
      const sanitizedSender = sanitizeUsername(sender);
      
      if (!sanitizedText || !sanitizedSender) return;
      
      const message = { sender: sanitizedSender, text: sanitizedText };
      
      await firebaseService.addMessage(roomId, message);
      const savedMessage = { ...message, timestamp: new Date() };
      io.to(roomId).emit('new-message', savedMessage);

      // Handle AI commands
      if (sanitizedText.startsWith('@AI')) {
        const command = sanitizedText.slice(3).trim();
        const recentMessages = await firebaseService.getMessages(roomId, 10);
        const aiMode = await firebaseService.getAiMode(roomId);
        
        const aiResponse = await aiService.handleCommand(command, recentMessages, aiMode);
        
        const aiMessage = {
          sender: 'AI Assistant',
          text: aiResponse,
          isAI: true
        };
        
        await firebaseService.addMessage(roomId, aiMessage);
        setTimeout(() => {
          io.to(roomId).emit('new-message', { ...aiMessage, timestamp: new Date() });
        }, 1000);
      }
    } catch (error) {
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('change-ai-mode', async (data) => {
    try {
      const { roomId, mode } = data;
      const validModes = ['summarizer', 'brainstorm', 'moderator', 'research'];
      
      if (!validModes.includes(mode)) return;
      
      await firebaseService.updateAiMode(roomId, mode);
      io.to(roomId).emit('ai-mode-changed', mode);
    } catch (error) {
      socket.emit('error', { message: 'Failed to change AI mode' });
    }
  });

  socket.on('disconnect', () => {
    const userData = connectedUsers.get(socket.id);
    if (userData) {
      socket.to(userData.roomId).emit('user-left', { username: userData.username });
      connectedUsers.delete(socket.id);
    }
  });
});

// Auto-summary every 10 minutes
setInterval(async () => {
  try {
    const rooms = await firebaseService.getRoomsForSummary();

    for (const room of rooms) {
      const recentMessages = await firebaseService.getMessages(room.roomId, 20);
      if (recentMessages.length < 5) continue;

      const summary = await aiService.processMessage(recentMessages, '', 'summarizer');
      
      const summaryMessage = {
        sender: 'AI Assistant',
        text: `**Auto Summary**: ${summary}`,
        isAI: true
      };

      await firebaseService.addMessage(room.roomId, summaryMessage);
      await firebaseService.updateLastSummary(room.roomId);
      io.to(room.roomId).emit('new-message', { ...summaryMessage, timestamp: new Date() });
    }
  } catch (error) {
    console.error('Auto-summary error:', error);
  }
}, 10 * 60 * 1000);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
