import { Bot, User } from 'lucide-react';
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
  const threads = allThreads.filter((t: Thread) => t.parentMessageId === message.id);

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

        {/* Thread indicator */}
        {message.threadId && (
          <div className="mt-1 text-xs text-primary">
            Thread response
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
