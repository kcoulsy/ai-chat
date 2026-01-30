import { useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';

export function useThreads() {
  const { threads, currentChatId, createThread, currentThreadId, setCurrentThread } = useAppStore();

  const chatThreads = threads.filter((t) => t.chatId === currentChatId);

  const startThread = useCallback(
    (parentMessageId: string, selectedText: string, context: string) => {
      if (!currentChatId) return null;
      const threadId = createThread(currentChatId, parentMessageId, selectedText, context);
      return threadId;
    },
    [currentChatId, createThread]
  );

  const getThreadById = useCallback(
    (threadId: string) => {
      return threads.find((t) => t.id === threadId);
    },
    [threads]
  );

  const selectThread = useCallback(
    (threadId: string | null) => {
      setCurrentThread(threadId);
    },
    [setCurrentThread]
  );

  return {
    threads: chatThreads,
    currentThread: currentThreadId ? getThreadById(currentThreadId) : null,
    currentThreadId,
    startThread,
    getThreadById,
    selectThread,
  };
}
