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
    error,
    isConnected,
    sendMessage,
    changeAIMode,
    clearError
  } = useChatStore();

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

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
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 animate-fade-in">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-gray-800 to-gray-900 text-white p-4 shadow-2xl animate-slide-in-left">
        <h2 className="text-xl font-bold mb-2 animate-slide-down">{room.name}</h2>
        <div className="mb-4 p-3 bg-gray-700/50 backdrop-blur-sm rounded-xl text-sm border border-gray-600/30 animate-slide-down-delay">
          <div className="text-gray-300 text-xs mb-1">Room ID (share to invite):</div>
          <div className="font-mono text-blue-300 select-all bg-gray-800/50 p-2 rounded-lg">{room.roomId}</div>
        </div>
        
        <div className="mb-6 animate-slide-down-delay-2">
          <div className="flex items-center mb-3">
            <Users className="w-4 h-4 mr-2 text-green-400" />
            <span className="text-sm font-medium">Participants ({participants.length})</span>
          </div>
          <div className="space-y-2">
            {participants.map((p, i) => (
              <div key={p} className="text-sm text-gray-300 ml-6 p-2 bg-gray-700/30 rounded-lg animate-fade-in-up" style={{animationDelay: `${i * 100}ms`}}>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  {p}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6 animate-slide-down-delay-3">
          <div className="flex items-center mb-3">
            <Bot className="w-4 h-4 mr-2 text-purple-400" />
            <span className="text-sm font-medium">AI Mode</span>
          </div>
          <select 
            value={aiMode} 
            onChange={(e) => changeAIMode(e.target.value)}
            className="w-full bg-gray-700/50 backdrop-blur-sm text-white text-sm p-3 rounded-xl border border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
          >
            <option value="summarizer">📝 Summarizer</option>
            <option value="brainstorm">💡 Brainstorm</option>
            <option value="moderator">⚖️ Moderator</option>
            <option value="research">🔍 Research</option>
          </select>
        </div>

        <button 
          onClick={exportChat}
          className="flex items-center text-sm text-gray-300 hover:text-white p-2 rounded-lg hover:bg-gray-700/50 transition-all duration-200 transform hover:scale-105 animate-slide-down-delay-4"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Chat
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col animate-slide-in-right">
        {/* Connection Status */}
        {!isConnected && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-3 text-sm text-center animate-pulse backdrop-blur-sm">
            <div className="flex items-center justify-center">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-ping"></div>
              Reconnecting to server...
            </div>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 text-sm text-center animate-shake backdrop-blur-sm">
            {error}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, i) => (
            <div key={i} className={`flex ${message.sender === username ? 'justify-end' : 'justify-start'} animate-message-in`} style={{animationDelay: `${i * 50}ms`}}>
              <div className={`max-w-lg lg:max-w-2xl px-4 py-3 rounded-2xl shadow-sm transform hover:scale-105 transition-all duration-200 ${
                message.isAI 
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 shadow-blue-100' 
                  : message.sender === username 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-200' 
                    : 'bg-white border border-gray-200 shadow-gray-100 hover:shadow-md'
              }`}>
                <div className={`text-xs mb-2 flex items-center ${
                  message.isAI ? 'text-blue-600' : message.sender === username ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.isAI && <Bot className="w-3 h-3 mr-1" />}
                  <span className="font-medium">{message.sender}</span>
                  <span className="mx-1">•</span>
                  <span>{format(new Date(message.timestamp), 'HH:mm')}</span>
                </div>
                <div className="text-sm leading-relaxed">{message.text}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 border-t bg-white/80 backdrop-blur-sm animate-slide-up">
          <div className="flex space-x-3">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message... (use @AI for commands)"
              className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
            />
            <button
              type="submit"
              disabled={!isConnected}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 flex items-center disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg shadow-blue-500/25 disabled:hover:scale-100 disabled:shadow-none"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-2 animate-fade-in-delay">
            💡 Try: @AI summarize, @AI next steps, @AI explain [topic]
          </div>
        </form>
      </div>
    </div>
  );
}