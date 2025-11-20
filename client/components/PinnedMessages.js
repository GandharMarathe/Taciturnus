import { Pin, X } from 'lucide-react';

export default function PinnedMessages({ pinnedMessages, onUnpin, isDark }) {
  if (pinnedMessages.length === 0) return null;

  return (
    <div className={`border-b p-3 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-yellow-50 border-yellow-200'}`}>
      <div className="flex items-center gap-2 mb-2">
        <Pin className="w-4 h-4 text-yellow-600" />
        <span className={`text-sm font-medium ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>
          Pinned Messages
        </span>
      </div>
      <div className="space-y-2">
        {pinnedMessages.map(msg => (
          <div key={msg.id} className={`flex items-start justify-between p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
            <div className="flex-1">
              <div className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{msg.sender}</div>
              <div className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{msg.text}</div>
            </div>
            <button onClick={() => onUnpin(msg.id)} className="ml-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
