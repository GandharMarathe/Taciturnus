import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { Send, Users, Bot, Download } from 'lucide-react';
import useChatStore from '../stores/chatStore';

export default function ChatRoom() {
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef(null);
  
  const {
    room,
    messages,
    participants,
    username,
    aiMode,
    sendMessage,
    changeAIMode
  } = useChatStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (messageText.trim()) {
      sendMessage(messageText);
      setMessageText('');
    }
  };

  const exportChat = () => {
    const content = messages.map(m => 
      `[${format(new Date(m.timestamp), 'HH:mm')}] ${m.sender}: ${m.text}`
    ).join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${room.name}-chat.txt`;
    a.click();
  };

  if (!room) return <div>Loading...</div>;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-4">{room.name}</h2>
        
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <Users className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Participants ({participants.length})</span>
          </div>
          {participants.map(p => (
            <div key={p} className="text-sm text-gray-300 ml-6">{p}</div>
          ))}
        </div>

        <div className="mb-6">
          <div className="flex items-center mb-2">
            <Bot className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">AI Mode</span>
          </div>
          <select 
            value={aiMode} 
            onChange={(e) => changeAIMode(e.target.value)}
            className="w-full bg-gray-700 text-white text-sm p-2 rounded"
          >
            <option value="summarizer">Summarizer</option>
            <option value="brainstorm">Brainstorm</option>
            <option value="moderator">Moderator</option>
            <option value="research">Research</option>
          </select>
        </div>

        <button 
          onClick={exportChat}
          className="flex items-center text-sm text-gray-300 hover:text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Chat
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, i) => (
            <div key={i} className={`flex ${message.sender === username ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.isAI 
                  ? 'bg-blue-100 border-l-4 border-blue-500' 
                  : message.sender === username 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white border'
              }`}>
                <div className="text-xs text-gray-500 mb-1">
                  {message.sender} • {format(new Date(message.timestamp), 'HH:mm')}
                </div>
                <div className="text-sm">{message.text}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 border-t bg-white">
          <div className="flex space-x-2">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message... (use @AI for commands)"
              className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Try: @AI summarize, @AI next steps, @AI explain [topic]
          </div>
        </form>
      </div>
    </div>
  );
}