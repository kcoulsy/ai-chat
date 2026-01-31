import { useState, useEffect } from 'react';
import { Send, MessageSquare, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useChat } from '../../hooks/useChat';
import { MessageBubble } from './MessageBubble';
import { FloatingToolbar } from '../navigation/FloatingToolbar';
import { useTextSelection } from '../../hooks/useTextSelection';

export function ChatPanel() {
  const [input, setInput] = useState('');
  const [showThreadContext, setShowThreadContext] = useState(false);
  const { currentChatId, pendingThreadContext, setPendingThreadContext, createThread, currentThreadId } = useAppStore();
  const { currentChat, sendMessage } = useChat();
  const { text: selectedText, rect, messageId, lineIndex, clearSelection } = useTextSelection();

  // Handle animation when thread context is pending
  useEffect(() => {
    if (pendingThreadContext) {
      // Small delay for animation
      requestAnimationFrame(() => setShowThreadContext(true));
    } else {
      setShowThreadContext(false);
    }
  }, [pendingThreadContext]);

  // Handle Escape key to cancel thread creation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && pendingThreadContext) {
        setPendingThreadContext(null);
        setInput('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pendingThreadContext, setPendingThreadContext]);

  const handleCreateThread = (text: string, parentMessageId: string, lineIndex: number) => {
    setPendingThreadContext({ selectedText: text, parentMessageId, lineIndex });
  };

  const handleCancelThread = () => {
    setPendingThreadContext(null);
    setInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentChatId) return;

    const content = input.trim();
    setInput('');

    if (pendingThreadContext) {
      // Create the thread and send message as a new standalone message
      const threadId = createThread(
        currentChatId,
        pendingThreadContext.parentMessageId,
        pendingThreadContext.selectedText,
        content,
        pendingThreadContext.lineIndex
      );

      // Send message with thread reference but without full context
      await sendMessage(content, { threadId });

      // Clear the pending context
      setPendingThreadContext(null);
    } else {
      await sendMessage(content);
    }
  };

  // Filter out thread messages when viewing main chat
  // Always show main chat messages (visible underneath ThreadPanel when active)
  const displayMessages = currentChat?.messages.filter((m) => !m.threadId) || [];

  if (!currentChatId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Welcome to Story AI</h2>
          <p className="text-muted-foreground mb-4">Start a new chat or select an existing one</p>
          <button
            onClick={() => useAppStore.getState().createChat()}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors"
          >
            Start New Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background relative">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {displayMessages.length === 0 ? (
          <div className="text-center text-muted-foreground mt-8">
            Start the conversation by typing a message below
          </div>
        ) : (
          displayMessages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
      </div>

      {/* Floating Toolbar */}
      {selectedText && rect && messageId && (
        <FloatingToolbar
          selectedText={selectedText}
          rect={rect}
          messageId={messageId}
          lineIndex={lineIndex}
          onClose={clearSelection}
          onCreateThread={handleCreateThread}
        />
      )}

      {/* Thread Context Card - shown when creating a thread */}
      {pendingThreadContext && (
        <div
          className={`
            mx-4 overflow-hidden transition-all duration-300 ease-out
            ${showThreadContext ? 'max-h-40 opacity-100 mb-3' : 'max-h-0 opacity-0 mb-0'}
          `}
        >
          <div className="bg-accent/10 border-l-4 border-primary rounded-r-lg p-3">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-primary flex items-center gap-2">
                <MessageSquare size={14} />
                Creating thread
              </span>
              <button
                onClick={handleCancelThread}
                className="
                  text-muted-foreground hover:text-destructive
                  p-1 rounded hover:bg-destructive/10
                  transition-colors
                "
                title="Cancel thread creation"
                aria-label="Cancel thread creation"
              >
                <X size={14} />
              </button>
            </div>

            {/* Selected Text Display */}
            <div className="
              bg-background/50 rounded px-3 py-2
              text-sm text-muted-foreground italic
              border border-border/50
            ">
              "{pendingThreadContext.selectedText.length > 150
                ? pendingThreadContext.selectedText.slice(0, 150) + '...'
                : pendingThreadContext.selectedText}"
            </div>
          </div>
        </div>
      )}

      {/* Input - hidden when viewing a thread */}
      <div className={`border-t border-border p-4 transition-opacity duration-300 ${currentThreadId ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              pendingThreadContext
                ? 'Add your message about the selected text...'
                : currentThreadId
                ? 'Explore the thread context...'
                : 'Type your message...'
            }
            className="flex-1 px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
