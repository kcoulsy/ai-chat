import { Bot, User, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Message, Thread } from '../../types';
import { ThreadBubble } from './ThreadBubble';
import { useAppStore } from '../../store/useAppStore';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const allThreads = useAppStore((state) => state.threads);
  const setCurrentThread = useAppStore((state) => state.setCurrentThread);
  const threads = allThreads.filter((t: Thread) => t.parentMessageId === message.id);
  
  // Find the thread this message belongs to (if it's a thread response)
  const parentThread = message.threadId 
    ? allThreads.find((t: Thread) => t.id === message.threadId)
    : null;

  const handleViewThread = () => {
    if (message.threadId) {
      setCurrentThread(message.threadId);
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
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
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

        {/* Thread bubbles for assistant messages */}
        {!isUser && threads.length > 0 && (
          <div className="mt-2 space-y-1">
            {threads.map((thread: Thread) => (
              <ThreadBubble key={thread.id} thread={thread} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
