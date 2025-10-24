import { create } from 'zustand';
import io from 'socket.io-client';

const useChatStore = create((set, get) => ({
  socket: null,
  room: null,
  messages: [],
  participants: [],
  username: '',
  aiMode: 'summarizer',

  setUsername: (username) => set({ username }),
  
  connectSocket: () => {
    const socket = io('http://localhost:3001');
    set({ socket });
    
    socket.on('new-message', (message) => {
      set(state => ({ messages: [...state.messages, message] }));
    });
    
    socket.on('ai-mode-changed', (mode) => {
      set({ aiMode: mode });
    });
  },

  joinRoom: async (roomId) => {
    const { socket, username } = get();
    
    const response = await fetch(`http://localhost:3001/api/rooms/${roomId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });
    
    if (response.ok) {
      const { room } = await response.json();
      set({ room, participants: room.participants });
      
      socket.emit('join-room', roomId);
      
      const messagesResponse = await fetch(`http://localhost:3001/api/rooms/${roomId}/messages`);
      const messages = await messagesResponse.json();
      set({ messages });
    }
  },

  createRoom: async (name) => {
    const { username } = get();
    
    const response = await fetch('http://localhost:3001/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, username })
    });
    
    if (response.ok) {
      const room = await response.json();
      return room.roomId;
    }
  },

  sendMessage: (text) => {
    const { socket, room, username } = get();
    socket.emit('send-message', {
      roomId: room.roomId,
      sender: username,
      text
    });
  },

  changeAIMode: (mode) => {
    const { socket, room } = get();
    socket.emit('change-ai-mode', { roomId: room.roomId, mode });
  }
}));

export default useChatStore;