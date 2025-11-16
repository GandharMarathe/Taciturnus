import { create } from 'zustand';
import io from 'socket.io-client';

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
      set(state => ({ messages: [...state.messages, message] }));
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

  sendMessage: (text) => {
    const { socket, room, username, isConnected } = get();
    
    if (!isConnected) {
      set({ error: 'Not connected to server' });
      return;
    }

    if (!text || text.trim().length === 0) return;
    
    socket.emit('send-message', {
      roomId: room.roomId,
      sender: username,
      text: text.trim()
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

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  }
}));

export default useChatStore;
