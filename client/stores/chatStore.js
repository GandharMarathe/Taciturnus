import { create } from 'zustand';
import io from 'socket.io-client';
import { showNotification } from '../utils/notifications';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';

const useChatStore = create((set, get) => ({
  socket: null,
  room: null,
  messages: [],
  participants: [],
  username: '',
  aiMode: 'summarizer',
  error: null,
  isConnected: false,
  typingUsers: [],
  theme: 'light',

  setUsername: (username) => set({ username }),
  
  connectSocket: () => {
    const socket = io(SERVER_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });
    
    set({ socket });
    
    socket.on('connect', () => {
      set({ isConnected: true, error: null });
    });

    socket.on('disconnect', () => {
      set({ isConnected: false });
    });

    socket.on('connect_error', () => {
      set({ error: 'Connection failed. Retrying...', isConnected: false });
    });
    
    socket.on('new-message', (message) => {
      set(state => {
        if (message.sender !== state.username && document.hidden) {
          showNotification(`${message.sender}`, { body: message.text || 'Sent a file' });
        }
        return { messages: [...state.messages, message] };
      });
    });
    
    socket.on('ai-mode-changed', (mode) => {
      set({ aiMode: mode });
    });

    socket.on('user-joined', ({ username }) => {
      set(state => ({ 
        participants: [...new Set([...state.participants, username])]
      }));
    });

    socket.on('user-left', ({ username }) => {
      set(state => ({ 
        participants: state.participants.filter(p => p !== username)
      }));
    });

    socket.on('error', ({ message }) => {
      set({ error: message });
    });

    socket.on('user-typing', ({ username }) => {
      set(state => ({ typingUsers: [...new Set([...state.typingUsers, username])] }));
    });

    socket.on('user-stop-typing', ({ username }) => {
      set(state => ({ typingUsers: state.typingUsers.filter(u => u !== username) }));
    });

    socket.on('reaction-added', ({ messageId, emoji, username }) => {
      set(state => ({
        messages: state.messages.map(m => {
          if (m.id === messageId) {
            const reactions = { ...m.reactions };
            if (!reactions[emoji]) reactions[emoji] = [];
            if (!reactions[emoji].includes(username)) reactions[emoji].push(username);
            return { ...m, reactions };
          }
          return m;
        })
      }));
    });

    socket.on('message-edited', ({ messageId, newText }) => {
      set(state => ({
        messages: state.messages.map(m => 
          m.id === messageId ? { ...m, text: newText, edited: true } : m
        )
      }));
    });

    socket.on('message-deleted', ({ messageId }) => {
      set(state => ({ messages: state.messages.filter(m => m.id !== messageId) }));
    });

    socket.on('message-read', ({ messageId, username }) => {
      set(state => ({
        messages: state.messages.map(m => {
          if (m.id === messageId) {
            const readBy = [...(m.readBy || []), username];
            return { ...m, readBy };
          }
          return m;
        })
      }));
    });

    socket.on('message-pinned', ({ messageId }) => {
      set(state => ({
        messages: state.messages.map(m => m.id === messageId ? { ...m, pinned: true } : m)
      }));
    });

    socket.on('message-unpinned', ({ messageId }) => {
      set(state => ({
        messages: state.messages.map(m => m.id === messageId ? { ...m, pinned: false } : m)
      }));
    });
  },

  joinRoom: async (roomId) => {
    try {
      const { socket, username } = get();
      
      const response = await fetch(`${SERVER_URL}/api/rooms/${roomId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      
      if (!response.ok) {
        const error = await response.json();
        set({ error: error.error || 'Failed to join room' });
        return false;
      }

      const { room } = await response.json();
      set({ room, participants: room.participants, error: null });
      
      socket.emit('join-room', { roomId, username });
      
      const messagesResponse = await fetch(`${SERVER_URL}/api/rooms/${roomId}/messages`);
      if (messagesResponse.ok) {
        const messages = await messagesResponse.json();
        set({ messages });
      }
      
      return true;
    } catch (error) {
      set({ error: 'Network error. Please try again.' });
      return false;
    }
  },

  createRoom: async (name) => {
    try {
      const { username } = get();
      
      const response = await fetch(`${SERVER_URL}/api/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username })
      });
      
      if (!response.ok) {
        const error = await response.json();
        set({ error: error.error || 'Failed to create room' });
        return null;
      }

      const room = await response.json();
      set({ error: null });
      return room.roomId;
    } catch (error) {
      set({ error: 'Network error. Please try again.' });
      return null;
    }
  },

  sendMessage: (text, fileUrl = null, fileName = null) => {
    const { socket, room, username, isConnected } = get();
    
    if (!isConnected) {
      set({ error: 'Not connected to server' });
      return;
    }

    if ((!text || text.trim().length === 0) && !fileUrl) return;
    
    socket.emit('send-message', {
      roomId: room.roomId,
      sender: username,
      text: text?.trim() || '',
      fileUrl,
      fileName
    });
  },

  changeAIMode: (mode) => {
    const { socket, room, isConnected } = get();
    
    if (!isConnected) {
      set({ error: 'Not connected to server' });
      return;
    }

    socket.emit('change-ai-mode', { roomId: room.roomId, mode });
  },

  clearError: () => set({ error: null }),

  setTyping: (isTyping) => {
    const { socket, room, username } = get();
    if (socket && room) {
      socket.emit(isTyping ? 'typing' : 'stop-typing', { roomId: room.roomId, username });
    }
  },

  addReaction: (messageId, emoji) => {
    const { socket, room, username } = get();
    if (socket && room) {
      socket.emit('add-reaction', { roomId: room.roomId, messageId, emoji, username });
    }
  },

  editMessage: (messageId, newText) => {
    const { socket, room } = get();
    if (socket && room) {
      socket.emit('edit-message', { roomId: room.roomId, messageId, newText });
    }
  },

  deleteMessage: (messageId) => {
    const { socket, room } = get();
    if (socket && room) {
      socket.emit('delete-message', { roomId: room.roomId, messageId });
    }
  },

  markAsRead: (messageId) => {
    const { socket, room, username } = get();
    if (socket && room) {
      socket.emit('mark-read', { roomId: room.roomId, messageId, username });
    }
  },

  toggleTheme: () => set(state => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

  pinMessage: (messageId) => {
    const { socket, room } = get();
    if (socket && room) {
      socket.emit('pin-message', { roomId: room.roomId, messageId });
    }
  },

  unpinMessage: (messageId) => {
    const { socket, room } = get();
    if (socket && room) {
      socket.emit('unpin-message', { roomId: room.roomId, messageId });
    }
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  }
}));

export default useChatStore;
