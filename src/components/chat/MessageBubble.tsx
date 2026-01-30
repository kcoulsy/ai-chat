import { Bot, User, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Message, Thread, Marker } from '../../types';
import { ThreadBubble } from './ThreadBubble';
import { MarkerPin } from './MarkerPin';
import { useAppStore } from '../../store/useAppStore';
import { useMarkers } from '../../hooks/useMarkers';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const allThreads = useAppStore((state) => state.threads);
  const setCurrentThread = useAppStore((state) => state.setCurrentThread);
  const threads = allThreads.filter((t: Thread) => t.parentMessageId === message.id);
  const { getMarkersForMessage, removeMarker } = useMarkers();
  const messageMarkers = getMarkersForMessage(message.id);
  
  // Find the thread this message belongs to (if it's a thread response)
  const parentThread = message.threadId 
    ? allThreads.find((t: Thread) => t.id === message.threadId)
    : null;

  const handleViewThread = () => {
    if (message.threadId) {
      setCurrentThread(message.threadId);
    }
  };

  // Split content into lines for marker positioning
  const contentLines = message.content.split('\n');
  
  // Group markers by line index
  const markersByLine = messageMarkers.reduce((acc, marker) => {
    const lineIdx = marker.lineIndex || 0;
    if (!acc[lineIdx]) acc[lineIdx] = [];
    acc[lineIdx].push(marker);
    return acc;
  }, {} as Record<number, Marker[]>);

  // Group threads by line index
  const threadsByLine = threads.reduce((acc, thread) => {
    const lineIdx = thread.lineIndex || 0;
    if (!acc[lineIdx]) acc[lineIdx] = [];
    acc[lineIdx].push(thread);
    return acc;
  }, {} as Record<number, Thread[]>);

  // Handle marker click - scroll to the specific line
  const handleMarkerClick = (marker: Marker) => {
    const lineEl = document.querySelector(`[data-message-id="${marker.messageId}"] [data-line-index="${marker.lineIndex}"]`);
    if (lineEl) {
      lineEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div
      data-message-id={message.id}
      data-role={message.role}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? 'bg-primary' : 'bg-muted'
        }`}
      >
        {isUser ? <User size={16} className="text-primary-foreground" /> : <Bot size={16} className="text-muted-foreground" />}
      </div>

      <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : ''}`}>
        <div
          className={`inline-block px-4 py-2 rounded-lg text-left ${
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground'
          }`}
        >
          <div className={`prose prose-sm max-w-none ${isUser ? 'prose-invert' : 'dark:prose-invert'}`}>
            {/* Render content with markers inline */}
            <div className="relative">
              {contentLines.map((line, lineIndex) => (
                <div key={lineIndex} data-line-index={lineIndex} className="relative">
                  {/* Marker pins and Thread pills on the left side */}
                  {!isUser && (
                    <div className="absolute -left-6 top-0 flex flex-col gap-0.5">
                      {/* Markers */}
                      {markersByLine[lineIndex]?.map((marker) => (
                        <MarkerPin
                          key={marker.id}
                          marker={marker}
                          onClick={() => handleMarkerClick(marker)}
                          onRemove={() => removeMarker(marker.id)}
                        />
                      ))}
                      {/* Thread pills */}
                      {threadsByLine[lineIndex]?.map((thread) => (
                        <ThreadBubble key={thread.id} thread={thread} />
                      ))}
                    </div>
                  )}
                  {/* Line content */}
                  {line ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {line}
                    </ReactMarkdown>
                  ) : (
                    <br />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Thread response indicator with link back to thread */}
        {message.threadId && parentThread && (
          <div className="mt-1">
            <button
              onClick={handleViewThread}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <MessageSquare size={12} />
              View thread: "{parentThread.selectedText.slice(0, 30)}{parentThread.selectedText.length > 30 ? '...' : ''}"
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
