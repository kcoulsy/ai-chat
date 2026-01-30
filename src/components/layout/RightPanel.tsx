import { useState } from 'react';
import { X, MessageSquare, Bookmark } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useMarkers } from '../../hooks/useMarkers';
import { MiniMap } from '../navigation/MiniMap';
import { categoryColors, categoryLabels, type MarkerCategory, type Marker } from '../../types';

export function RightPanel() {
  const { currentChatId, threads, setCurrentThread, currentThreadId, chats } = useAppStore();
  const { markers: chatMarkers, removeMarker } = useMarkers();
  const chatThreads = threads.filter((t) => t.chatId === currentChatId);
  const [selectedCategory, setSelectedCategory] = useState<MarkerCategory | 'all'>('all');

  const filteredMarkers =
    selectedCategory === 'all'
      ? chatMarkers
      : chatMarkers.filter((m) => m.category === selectedCategory);

  // Group markers by message
  const markersByMessage = filteredMarkers.reduce((acc, marker) => {
    if (!acc[marker.messageId]) acc[marker.messageId] = [];
    acc[marker.messageId].push(marker);
    return acc;
  }, {} as Record<string, Marker[]>);

  // Get message info for each group
  const getMessageInfo = (messageId: string) => {
    const currentChat = chats.find((c) => c.id === currentChatId);
    const message = currentChat?.messages.find((m) => m.id === messageId);
    return {
      content: message?.content.slice(0, 50) || 'Unknown message',
      messageId,
    };
  };

  // Handle marker click - navigate to specific line
  const handleMarkerClick = (marker: Marker) => {
    // First, clear any thread view to show the main chat
    setCurrentThread(null);
    
    // Then scroll to the message and line
    setTimeout(() => {
      const messageEl = document.querySelector(`[data-message-id="${marker.messageId}"]`);
      if (messageEl) {
        messageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Highlight the line temporarily
        const lines = messageEl.querySelectorAll('.prose > div > div');
        if (lines[marker.lineIndex]) {
          const lineEl = lines[marker.lineIndex] as HTMLElement;
          lineEl.style.backgroundColor = 'rgba(255, 255, 0, 0.2)';
          setTimeout(() => {
            lineEl.style.backgroundColor = '';
          }, 2000);
        }
      }
    }, 100);
  };

  if (!currentChatId) {
    return (
      <div className="w-72 bg-sidebar border-l border-sidebar-border flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center text-sidebar-foreground/50 text-sm">
          Select a chat to see navigation
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 bg-sidebar border-l border-sidebar-border flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="text-sm font-semibold text-sidebar-foreground uppercase tracking-wide">Navigation</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Minimap */}
        <div className="p-4 border-b border-sidebar-border">
          <h3 className="text-xs font-medium text-sidebar-foreground/60 mb-2">Overview</h3>
          <MiniMap />
        </div>

        {/* Markers */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-sidebar-foreground/60">Markers</h3>
            <span className="text-xs text-sidebar-foreground/40">{chatMarkers.length}</span>
          </div>

          {/* Category Filter */}
          <div className="flex gap-1 mb-3 flex-wrap">
            {(['all', 'plot', 'character', 'world', 'note'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-[10px] px-2 py-1 rounded-full transition-colors ${
                  selectedCategory === cat
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'bg-sidebar-accent text-sidebar-foreground/70 hover:bg-sidebar-accent/80'
                }`}
              >
                {cat === 'all' ? 'All' : categoryLabels[cat]}
              </button>
            ))}
          </div>

          {/* Marker List - Grouped by Message */}
          <div className="space-y-3">
            {filteredMarkers.length === 0 ? (
              <p className="text-xs text-sidebar-foreground/40 italic">No markers yet</p>
            ) : (
              Object.entries(markersByMessage).map(([messageId, markers]) => {
                const messageInfo = getMessageInfo(messageId);
                return (
                  <div key={messageId} className="border-l-2 border-sidebar-border pl-2">
                    <div className="text-[10px] text-sidebar-foreground/50 mb-1 truncate">
                      {messageInfo.content}...
                    </div>
                    <div className="space-y-1">
                      {markers.map((marker) => (
                        <button
                          key={marker.id}
                          onClick={() => handleMarkerClick(marker)}
                          className="w-full group flex items-center gap-2 p-1.5 rounded hover:bg-sidebar-accent/50 transition-colors text-left"
                        >
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${categoryColors[marker.category]}`} />
                          <Bookmark size={10} className="text-sidebar-foreground/40 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="text-xs text-sidebar-foreground truncate block">
                              {marker.label}
                            </span>
                            <span className="text-[10px] text-sidebar-foreground/50 truncate block">
                              Line {(marker.lineIndex || 0) + 1}{marker.selectedText ? `: "${marker.selectedText.slice(0, 25)}${marker.selectedText.length > 25 ? '...' : ''}"` : ''}
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeMarker(marker.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-sidebar-foreground/50 hover:text-destructive transition-opacity flex-shrink-0"
                          >
                            <X size={12} />
                          </button>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Threads */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-sidebar-foreground/60">Threads</h3>
            <span className="text-xs text-sidebar-foreground/40">{chatThreads.length}</span>
          </div>

          <div className="space-y-1">
            {chatThreads.length === 0 ? (
              <p className="text-xs text-sidebar-foreground/40 italic">No threads yet</p>
            ) : (
              chatThreads.map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => setCurrentThread(thread.id)}
                  className={`w-full flex items-center gap-2 p-2 rounded text-left transition-colors ${
                    currentThreadId === thread.id
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'
                  }`}
                >
                  <MessageSquare size={14} className="flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs truncate">"{thread.selectedText.slice(0, 30)}..."</p>
                    <p className="text-[10px] text-sidebar-foreground/60 truncate">{thread.context.slice(0, 40)}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
