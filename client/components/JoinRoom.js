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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <MessageCircle className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Collaborative AI Chat</h1>
          <p className="text-gray-600 mt-2">Join or create a room to start chatting with AI assistance</p>
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium ${
                !isCreating 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <LogIn className="w-4 h-4 inline mr-1" />
              Join Room
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium ${
                isCreating 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Plus className="w-4 h-4 inline mr-1" />
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter room code"
                required
              />
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : isCreating ? 'Create & Join Room' : 'Join Room'}
          </button>
        </form>
      </div>
    </div>
  );
}