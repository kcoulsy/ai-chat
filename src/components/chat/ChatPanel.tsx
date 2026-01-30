import { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useChat } from '../../hooks/useChat';
import { useThreads } from '../../hooks/useThreads';
import { MessageBubble } from './MessageBubble';
import { ThreadContextBar } from './ThreadContextBar';
import { FloatingToolbar } from '../navigation/FloatingToolbar';
import { useTextSelection } from '../../hooks/useTextSelection';

export function ChatPanel() {
  const [input, setInput] = useState('');
  const { currentChatId, pendingThreadContext, setPendingThreadContext, createThread } = useAppStore();
  const { currentChat, sendMessage } = useChat();
  const { currentThread, currentThreadId } = useThreads();
  const { text: selectedText, rect, messageId, lineIndex, clearSelection } = useTextSelection();

  // Populate input with selected text when thread context is pending
  useEffect(() => {
    if (pendingThreadContext) {
      const truncatedText = pendingThreadContext.selectedText.length > 100
        ? pendingThreadContext.selectedText.slice(0, 100) + '...'
        : pendingThreadContext.selectedText;
      setInput(truncatedText);
    }
  }, [pendingThreadContext]);

  const handleCreateThread = (text: string, parentMessageId: string, lineIndex: number) => {
    setPendingThreadContext({ selectedText: text, parentMessageId, lineIndex });
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
    } else if (currentThreadId && currentThread) {
      await sendMessage(content, {
        threadId: currentThreadId,
        context: `Context: Exploring "${currentThread.selectedText}"\nInstruction: ${currentThread.context}`,
      });
    } else {
      await sendMessage(content);
    }
  };

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
      {/* Thread Context Bar */}
      {currentThreadId && currentThread && (
        <ThreadContextBar thread={currentThread} />
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentChat?.messages.length === 0 ? (
          <div className="text-center text-muted-foreground mt-8">
            Start the conversation by typing a message below
          </div>
        ) : (
          currentChat?.messages.map((message) => (
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

      {/* Input */}
      <div className="border-t border-border p-4">
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
