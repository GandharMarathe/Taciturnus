import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { Send, Users, Bot, Download, Moon, Sun, Smile, Edit2, Trash2, Paperclip, Check, CheckCheck, Pin } from 'lucide-react';
import useChatStore from '../stores/chatStore';
import { requestNotificationPermission } from '../utils/notifications';
import PinnedMessages from './PinnedMessages';

export default function ChatRoom() {
  const [messageText, setMessageText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const {
    room,
    messages,
    participants,
    username,
    aiMode,
    error,
    isConnected,
    typingUsers,
    theme,
    sendMessage,
    changeAIMode,
    clearError,
    setTyping,
    addReaction,
    editMessage,
    deleteMessage,
    markAsRead,
    toggleTheme,
    pinMessage,
    unpinMessage
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
      setTyping(false);
    }
  };

  const handleTyping = (e) => {
    setMessageText(e.target.value);
    if (!isTyping) {
      setIsTyping(true);
      setTyping(true);
    }
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      setTyping(false);
    }, 1000);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      alert('File too large (max 5MB)');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      sendMessage('', reader.result, file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleEdit = (msg) => {
    setEditingMessage(msg.id);
    setEditText(msg.text);
  };

  const saveEdit = () => {
    if (editText.trim()) {
      editMessage(editingMessage, editText);
      setEditingMessage(null);
      setEditText('');
    }
  };

  const emojis = ['+1', 'heart', 'laugh', 'party', 'fire', 'clap'];

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

  useEffect(() => {
    messages.forEach(msg => {
      if (msg.sender !== username && !msg.readBy?.includes(username)) {
        markAsRead(msg.id);
      }
    });
  }, [messages]);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  if (!room) return <div>Loading...</div>;

  const isDark = theme === 'dark';
  const pinnedMessages = messages.filter(m => m.pinned);

  return (
    <div className={`flex h-screen animate-fade-in ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
      {/* Sidebar */}
      <div className={`w-64 p-4 shadow-2xl animate-slide-in-left ${isDark ? 'bg-gray-800 text-white' : 'bg-gradient-to-b from-gray-800 to-gray-900 text-white'}`}>
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
            <option value="summarizer">Summarizer</option>
            <option value="brainstorm">Brainstorm</option>
            <option value="moderator">Moderator</option>
            <option value="research">Research</option>
          </select>
        </div>

        <button 
          onClick={exportChat}
          className="flex items-center w-full text-sm text-gray-300 hover:text-white p-2 rounded-lg hover:bg-gray-700/50 transition-all duration-200 transform hover:scale-105 animate-slide-down-delay-4 mb-2"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Chat
        </button>
        <button 
          onClick={toggleTheme}
          className="flex items-center w-full text-sm text-gray-300 hover:text-white p-2 rounded-lg hover:bg-gray-700/50 transition-all duration-200 transform hover:scale-105"
        >
          {isDark ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
          {isDark ? 'Light' : 'Dark'} Mode
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

        <PinnedMessages pinnedMessages={pinnedMessages} onUnpin={unpinMessage} isDark={isDark} />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, i) => (
            <div key={message.id || i} className={`flex ${message.sender === username ? 'justify-end' : 'justify-start'} animate-message-in group`} style={{animationDelay: `${i * 50}ms`}}>
              <div className={`max-w-lg lg:max-w-2xl px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 relative ${
                message.isAI 
                  ? isDark ? 'bg-blue-900/50 border-l-4 border-blue-400' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 shadow-blue-100'
                  : message.sender === username 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-200' 
                    : isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-gray-100 hover:shadow-md'
              }`}>
                <div className={`text-xs mb-2 flex items-center justify-between ${
                  message.isAI ? (isDark ? 'text-blue-300' : 'text-blue-600') : message.sender === username ? 'text-blue-100' : isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <div className="flex items-center">
                    {message.isAI && <Bot className="w-3 h-3 mr-1" />}
                    <span className="font-medium">{message.sender}</span>
                    <span className="mx-1">•</span>
                    <span>{format(new Date(message.timestamp), 'HH:mm')}</span>
                    {message.edited && <span className="ml-1 text-xs">(edited)</span>}
                  </div>
                  {!message.isAI && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {message.sender === username && (
                        <>
                          <button onClick={() => handleEdit(message)} className="p-1 hover:bg-white/20 rounded">
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button onClick={() => deleteMessage(message.id)} className="p-1 hover:bg-white/20 rounded">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </>
                      )}
                      <button onClick={() => message.pinned ? unpinMessage(message.id) : pinMessage(message.id)} className="p-1 hover:bg-white/20 rounded">
                        <Pin className={`w-3 h-3 ${message.pinned ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  )}
                </div>
                {editingMessage === message.id ? (
                  <div className="flex gap-2">
                    <input value={editText} onChange={(e) => setEditText(e.target.value)} className="flex-1 px-2 py-1 rounded text-black" />
                    <button onClick={saveEdit} className="px-2 py-1 bg-green-500 rounded text-xs">Save</button>
                    <button onClick={() => setEditingMessage(null)} className="px-2 py-1 bg-gray-500 rounded text-xs">Cancel</button>
                  </div>
                ) : (
                  <>
                    <div className="text-sm leading-relaxed">{message.text}</div>
                    {message.fileUrl && (
                      <div className="mt-2">
                        {message.fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                          <img src={message.fileUrl} alt={message.fileName} className="max-w-xs rounded" />
                        ) : (
                          <a href={message.fileUrl} download={message.fileName} className="text-blue-300 underline text-xs">{message.fileName}</a>
                        )}
                      </div>
                    )}
                  </>
                )}
                {message.reactions && Object.keys(message.reactions).length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {Object.entries(message.reactions).map(([emoji, users]) => (
                      <button key={emoji} onClick={() => addReaction(message.id, emoji)} className="px-2 py-1 bg-white/20 rounded-full text-xs flex items-center gap-1">
                        {emoji} {users.length}
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => setShowEmojiPicker(showEmojiPicker === message.id ? null : message.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Smile className="w-4 h-4" />
                  </button>
                  {message.sender !== username && (
                    <div className="text-xs opacity-50">
                      {message.readBy?.length > 0 && <CheckCheck className="w-3 h-3 inline" />}
                    </div>
                  )}
                </div>
                {showEmojiPicker === message.id && (
                  <div className="absolute bottom-full mb-2 flex gap-1 bg-white dark:bg-gray-700 p-2 rounded-lg shadow-lg">
                    {emojis.map(emoji => (
                      <button key={emoji} onClick={() => { addReaction(message.id, emoji); setShowEmojiPicker(null); }} className="text-xl hover:scale-125 transition-transform">
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {typingUsers.length > 0 && (
            <div className={`text-sm italic ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className={`p-4 border-t animate-slide-up ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white/80 backdrop-blur-sm'}`}>
          <div className="flex space-x-3">
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
            <button type="button" onClick={() => fileInputRef.current?.click()} className={`p-3 rounded-xl ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>
              <Paperclip className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={messageText}
              onChange={handleTyping}
              placeholder="Type a message... (use @AI for commands)"
              className={`flex-1 border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-gray-50 hover:bg-white'}`}
            />
            <button
              type="submit"
              disabled={!isConnected}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 flex items-center disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg shadow-blue-500/25 disabled:hover:scale-100 disabled:shadow-none"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className={`text-xs mt-2 animate-fade-in-delay ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Try: @AI summarize, @AI next steps, @AI explain [topic]
          </div>
        </form>
      </div>
    </div>
  );
}