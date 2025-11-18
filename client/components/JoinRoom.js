import { useState } from 'react';
import { MessageCircle, Plus, LogIn } from 'lucide-react';
import useChatStore from '../stores/chatStore';

export default function JoinRoom({ onJoin }) {
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const [roomName, setRoomName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const { setUsername: setStoreUsername, joinRoom, createRoom } = useChatStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    setLoading(true);
    setError('');
    setStoreUsername(username);
    
    try {
      if (isCreating) {
        const newRoomId = await createRoom(roomName);
        if (newRoomId) {
          const success = await joinRoom(newRoomId);
          if (success) onJoin();
          else setError('Failed to join room');
        } else {
          setError('Failed to create room');
        }
      } else {
        const success = await joinRoom(roomId);
        if (success) onJoin();
        else setError('Room not found or failed to join');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md transform hover:scale-105 transition-all duration-300 border border-white/20">
        <div className="text-center mb-8">
          <div className="relative">
            <MessageCircle className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-bounce-slow" />
            <div className="absolute inset-0 w-16 h-16 mx-auto bg-blue-500/20 rounded-full animate-ping"></div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 animate-slide-up">Taciturnus</h1>
          <p className="text-gray-600 animate-slide-up-delay">Join or create a room to start chatting with AI assistance</p>
        </div>

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="flex space-x-2 mb-4">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                !isCreating 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
              }`}
            >
              <LogIn className="w-4 h-4 inline mr-2" />
              Join Room
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                isCreating 
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
              }`}
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Create Room
            </button>
          </div>

          {isCreating ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room Name
              </label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white animate-slide-down"
                placeholder="Enter room name"
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room Code
              </label>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white animate-slide-down"
                placeholder="Enter room code"
                required
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm text-center p-3 rounded-xl animate-shake">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 font-medium disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 hover:shadow-lg disabled:hover:scale-100 disabled:hover:shadow-none"
          >
            <span className={loading ? 'animate-pulse' : ''}>
              {loading ? 'Loading...' : isCreating ? 'Create & Join Room' : 'Join Room'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}