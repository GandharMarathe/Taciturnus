'use client';

import { useState, useEffect } from 'react';
import JoinRoom from '../components/JoinRoom';
import ChatRoom from '../components/ChatRoom';
import useChatStore from '../stores/chatStore';

export default function Home() {
  const [inRoom, setInRoom] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { connectSocket, room } = useChatStore();

  useEffect(() => {
    connectSocket();
  }, []);

  useEffect(() => {
    if (room && !inRoom) {
      setIsTransitioning(true);
      setTimeout(() => {
        setInRoom(true);
        setIsTransitioning(false);
      }, 300);
    }
  }, [room, inRoom]);

  const handleJoin = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setInRoom(true);
      setIsTransitioning(false);
    }, 300);
  };

  return (
    <div className="relative overflow-hidden">
      <div className={`transition-transform duration-300 ease-in-out ${
        inRoom ? '-translate-x-full' : 'translate-x-0'
      }`}>
        <JoinRoom onJoin={handleJoin} />
      </div>
      <div className={`absolute inset-0 transition-transform duration-300 ease-in-out ${
        inRoom ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {(inRoom || isTransitioning) && <ChatRoom />}
      </div>
    </div>
  );
}