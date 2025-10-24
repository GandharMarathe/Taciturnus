'use client';

import { useState, useEffect } from 'react';
import JoinRoom from '../components/JoinRoom';
import ChatRoom from '../components/ChatRoom';
import useChatStore from '../stores/chatStore';

export default function Home() {
  const [inRoom, setInRoom] = useState(false);
  const { connectSocket, room } = useChatStore();

  useEffect(() => {
    connectSocket();
  }, []);

  useEffect(() => {
    if (room) setInRoom(true);
  }, [room]);

  return inRoom ? <ChatRoom /> : <JoinRoom onJoin={() => setInRoom(true)} />;
}