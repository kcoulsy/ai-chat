import { useState } from 'react';
import { MessageSquare, Plus, Settings, Search, Trash2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export function LeftSidebar() {
  const { chats, currentChatId, setCurrentChat, createChat, deleteChat, setSettingsOpen } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewChat = () => {
    createChat();
  };

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold text-sidebar-foreground">Story AI</h1>
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-colors"
            title="Settings"
          >
            <Settings size={18} />
          </button>
        </div>
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 bg-sidebar-primary text-sidebar-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-colors"
        >
          <Plus size={18} />
          New Chat
        </button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-sidebar-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-sidebar-foreground/50" size={16} />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="p-4 text-center text-sidebar-foreground/50 text-sm">
            {searchQuery ? 'No chats found' : 'No chats yet'}
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setCurrentChat(chat.id)}
                className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  currentChatId === chat.id
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'
                }`}
              >
                <MessageSquare size={18} className="flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{chat.title}</p>
                  <p className="text-xs text-sidebar-foreground/60 truncate">
                    {new Date(chat.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(chat.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-sidebar-foreground/50 hover:text-destructive transition-opacity"
                  title="Delete chat"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
