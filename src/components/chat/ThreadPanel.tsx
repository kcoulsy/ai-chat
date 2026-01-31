import { useState, useEffect, useRef } from 'react';
import { X, MessageSquare, Send, ArrowUpRight } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useChat } from '../../hooks/useChat';
import { useThreads } from '../../hooks/useThreads';
import { MessageBubble } from './MessageBubble';
import type { Thread } from '../../types';

interface ThreadPanelProps {
  thread: Thread;
  onClose: () => void;
}

export function ThreadPanel({ thread, onClose }: ThreadPanelProps) {
  const [input, setInput] = useState('');
  const { currentChat, sendMessage } = useChat();
  const { convertThreadToChat } = useAppStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get messages for this thread
  const threadMessages = currentChat?.messages.filter(
    (m) => m.threadId === thread.id
  ) || [];

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threadMessages]);

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const content = input.trim();
    setInput('');

    await sendMessage(content, {
      threadId: thread.id,
      context: `Context: Exploring "${thread.selectedText}"\nInstruction: ${thread.context}`,
    });
  };

  // Truncate selected text for title
  const threadTitle = thread.selectedText.length > 40
    ? thread.selectedText.slice(0, 40) + '...'
    : thread.selectedText;

  return (
    <div className="h-full flex flex-col bg-card border-l border-border shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-3 min-w-0">
          <MessageSquare size={18} className="text-primary flex-shrink-0" />
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-foreground truncate">
              "{threadTitle}"
            </h3>
            <span className="text-xs text-muted-foreground">Thread</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => convertThreadToChat(thread.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
            title="Convert this thread to its own chat"
            aria-label="Convert thread to chat"
          >
            <ArrowUpRight size={14} />
            Convert to Chat
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            aria-label="Close thread panel"
          >
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Thread Context Section */}
      <div className="p-4 border-b border-border bg-accent/10">
        <div className="space-y-3">
          <div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Source
            </span>
            <p className="text-sm text-foreground italic mt-1">
              "{thread.selectedText}"
            </p>
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Context
            </span>
            <p className="text-sm text-foreground mt-1">{thread.context}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {threadMessages.length === 0 ? (
          <div className="text-center text-muted-foreground mt-8">
            <p className="text-sm">No messages yet</p>
            <p className="text-xs mt-1">Start exploring this thread below</p>
          </div>
        ) : (
          threadMessages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-4 bg-card">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Continue exploring..."
            className="flex-1 px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground text-sm"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
