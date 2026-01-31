import { useState } from 'react';
import { X, MessageSquare, Bookmark } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useMarkers } from '../../hooks/useMarkers';
import { markerColors, type Marker } from '../../types';

export function RightPanel() {
  const { currentChatId, threads, setCurrentThread, currentThreadId, chats } = useAppStore();
  const { markers: chatMarkers, removeMarker, editMarker } = useMarkers();
  const chatThreads = threads.filter((t) => t.chatId === currentChatId);

  // Group markers by message
  const markersByMessage = chatMarkers.reduce((acc, marker) => {
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

  // Handle thread click - scroll to the thread
  const handleThreadScroll = (threadId: string) => {
    const thread = threads.find((t) => t.id === threadId);
    if (!thread) return;

    // Close any open thread panel to show main chat
    setCurrentThread(null);

    // Scroll to the parent message
    setTimeout(() => {
      const messageEl = document.querySelector(`[data-message-id="${thread.parentMessageId}"]`);
      if (messageEl) {
        messageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  // Handle thread open - open thread panel
  const handleThreadOpen = (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentThread(threadId);

    // Also scroll to the thread location
    const thread = threads.find((t) => t.id === threadId);
    if (thread) {
      setTimeout(() => {
        const messageEl = document.querySelector(`[data-message-id="${thread.parentMessageId}"]`);
        if (messageEl) {
          messageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
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
        {/* Markers */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-sidebar-foreground/60">Markers</h3>
          </div>

          {/* Marker List - Grouped by Message */}
          <div className="space-y-3">
            {chatMarkers.length === 0 ? (
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
                      {markers.map((marker) => {
                        const colorClass = markerColors.find(c => c.value === marker.color)?.class || 'bg-gray-500';
                        return (
                          <button
                            key={marker.id}
                            onClick={() => handleMarkerClick(marker)}
                            className="w-full group flex items-center gap-2 p-1.5 rounded hover:bg-sidebar-accent/50 transition-colors text-left"
                          >
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${colorClass}`} />
                            <Bookmark size={10} className="text-sidebar-foreground/40 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <span className="text-xs text-sidebar-foreground truncate block">
                                {marker.label}
                              </span>
                              <span className="text-[10px] text-sidebar-foreground/50 truncate block">
                                Line {(marker.lineIndex || 0) + 1}{marker.selectedText ? `: "${marker.selectedText.slice(0, 25)}${marker.selectedText.length > 25 ? '...' : ''}"` : ''}
                              </span>
                            </div>
                            {/* Edit button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Open inline edit in the message bubble
                                const markerEl = document.querySelector(`[data-marker-id="${marker.id}"]`);
                                if (markerEl) {
                                  (markerEl as HTMLElement).click();
                                  // Trigger edit mode after a short delay
                                  setTimeout(() => {
                                    const editBtn = markerEl.querySelector('[data-edit-marker]');
                                    editBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                                  }, 100);
                                }
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-sidebar-foreground/50 hover:text-primary transition-opacity flex-shrink-0"
                              title="Edit marker"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            {/* Remove button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeMarker(marker.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-sidebar-foreground/50 hover:text-destructive transition-opacity flex-shrink-0"
                              title="Delete marker"
                            >
                              <X size={12} />
                            </button>
                          </button>
                        );
                      })}
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
          </div>

          <div className="space-y-1">
            {chatThreads.length === 0 ? (
              <p className="text-xs text-sidebar-foreground/40 italic">No threads yet</p>
            ) : (
              chatThreads.map((thread) => (
                <div
                  key={thread.id}
                  className={`w-full group flex items-center gap-2 p-2 rounded text-left transition-colors cursor-pointer ${
                    currentThreadId === thread.id
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'
                  }`}
                  onClick={() => handleThreadScroll(thread.id)}
                  title="Click to scroll, double-click or → to open"
                >
                  <MessageSquare size={14} className="flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs truncate">"{thread.selectedText.slice(0, 30)}..."</p>
                    <p className="text-[10px] text-sidebar-foreground/60 truncate">{thread.context.slice(0, 40)}</p>
                  </div>
                  {/* Open button */}
                  <button
                    onClick={(e) => handleThreadOpen(thread.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-sidebar-foreground/50 hover:text-primary transition-opacity flex-shrink-0"
                    title="Open thread"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
