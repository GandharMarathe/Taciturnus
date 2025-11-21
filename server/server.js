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
    const { roomId } = req.params;
    if (!roomId || typeof roomId !== 'string') {
      return res.status(400).json({ error: 'Invalid room ID' });
    }
    const messages = await firebaseService.getMessages(roomId);
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
      if (!data || typeof data !== 'object') return;
      const { roomId, sender, text, fileUrl, fileName } = data;
      const sanitizedText = text ? sanitizeText(text) : '';
      const sanitizedSender = sanitizeUsername(sender);
      
      if ((!sanitizedText && !fileUrl) || !sanitizedSender || !roomId) return;
      
      const message = { sender: sanitizedSender, text: sanitizedText, fileUrl, fileName, reactions: {} };
      
      const messageId = await firebaseService.addMessage(roomId, message);
      const savedMessage = { ...message, id: messageId, timestamp: new Date() };
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
      if (!data || typeof data !== 'object') return;
      const { roomId, mode } = data;
      const validModes = ['summarizer', 'brainstorm', 'moderator', 'research'];
      
      if (!validModes.includes(mode) || !roomId) return;
      
      await firebaseService.updateAiMode(roomId, mode);
      io.to(roomId).emit('ai-mode-changed', mode);
    } catch (error) {
      socket.emit('error', { message: 'Failed to change AI mode' });
    }
  });

  socket.on('typing', (data) => {
    socket.to(data.roomId).emit('user-typing', { username: data.username });
  });

  socket.on('stop-typing', (data) => {
    socket.to(data.roomId).emit('user-stop-typing', { username: data.username });
  });

  socket.on('add-reaction', async (data) => {
    try {
      if (!data || typeof data !== 'object') return;
      const { roomId, messageId, emoji, username } = data;
      if (!roomId || !messageId || !emoji || !username) return;
      await firebaseService.addReaction(roomId, messageId, emoji, username);
      io.to(roomId).emit('reaction-added', { messageId, emoji, username });
    } catch (error) {
      socket.emit('error', { message: 'Failed to add reaction' });
    }
  });

  socket.on('edit-message', async (data) => {
    try {
      if (!data || typeof data !== 'object') return;
      const { roomId, messageId, newText } = data;
      if (!roomId || !messageId || !newText) return;
      const sanitized = sanitizeText(newText);
      await firebaseService.editMessage(roomId, messageId, sanitized);
      io.to(roomId).emit('message-edited', { messageId, newText: sanitized });
    } catch (error) {
      socket.emit('error', { message: 'Failed to edit message' });
    }
  });

  socket.on('delete-message', async (data) => {
    try {
      if (!data || typeof data !== 'object') return;
      const { roomId, messageId } = data;
      if (!roomId || !messageId) return;
      await firebaseService.deleteMessage(roomId, messageId);
      io.to(roomId).emit('message-deleted', { messageId });
    } catch (error) {
      socket.emit('error', { message: 'Failed to delete message' });
    }
  });

  socket.on('mark-read', async (data) => {
    try {
      if (!data || typeof data !== 'object') return;
      const { roomId, messageId, username } = data;
      if (!roomId || !messageId || !username) return;
      await firebaseService.markAsRead(roomId, messageId, username);
      socket.to(roomId).emit('message-read', { messageId, username });
    } catch (error) {
      socket.emit('error', { message: 'Failed to mark as read' });
    }
  });

  socket.on('pin-message', async (data) => {
    try {
      if (!data || typeof data !== 'object') return;
      const { roomId, messageId } = data;
      if (!roomId || !messageId) return;
      await firebaseService.pinMessage(roomId, messageId);
      io.to(roomId).emit('message-pinned', { messageId });
    } catch (error) {
      socket.emit('error', { message: 'Failed to pin message' });
    }
  });

  socket.on('unpin-message', async (data) => {
    try {
      if (!data || typeof data !== 'object') return;
      const { roomId, messageId } = data;
      if (!roomId || !messageId) return;
      await firebaseService.unpinMessage(roomId, messageId);
      io.to(roomId).emit('message-unpinned', { messageId });
    } catch (error) {
      socket.emit('error', { message: 'Failed to unpin message' });
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
