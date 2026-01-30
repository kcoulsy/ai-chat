import { useCallback, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { streamChatCompletion, generateChatTitle } from '../services/openai';
import type { Message } from '../types';

export function useChat() {
  const {
    chats,
    currentChatId,
    settings,
    addMessage,
    updateMessage,
    createChat,
    updateChatTitle,
  } = useAppStore();

  const currentChat = useMemo(() => chats.find((c) => c.id === currentChatId), [chats, currentChatId]);

  const sendMessage = useCallback(
    async (content: string, threadContext?: { threadId: string; context: string }) => {
      if (!currentChatId) return;

      // Add user message
      addMessage(currentChatId, {
        chatId: currentChatId,
        role: 'user',
        content: threadContext ? `${threadContext.context}\n\n${content}` : content,
      });

      // Generate title on first message
      if (currentChat?.messages.length === 0) {
        try {
          const title = await generateChatTitle(content);
          updateChatTitle(currentChatId, title);
        } catch {
          // Fallback to first 30 chars
          updateChatTitle(currentChatId, content.slice(0, 30) + '...');
        }
      }

      // Create placeholder for assistant message
      const assistantMessageId = crypto.randomUUID();
      addMessage(currentChatId, {
        chatId: currentChatId,
        role: 'assistant',
        content: '',
        threadId: threadContext?.threadId,
      });

      // Get last assistant message (the one we just added)
      const chat = useAppStore.getState().chats.find((c) => c.id === currentChatId);
      const lastMessage = chat?.messages[chat.messages.length - 1];
      if (lastMessage) {
        // Update with the correct ID
        useAppStore.getState().updateMessage(currentChatId, lastMessage.id, {
          id: assistantMessageId,
        });
      }

      // Stream response
      try {
        const messages: Pick<Message, 'role' | 'content'>[] = [
          ...(currentChat?.messages || []).map((m) => ({ role: m.role, content: m.content })),
          { role: 'user', content: threadContext ? `${threadContext.context}\n\n${content}` : content },
        ];

        let fullContent = '';
        for await (const chunk of streamChatCompletion(messages, settings.model)) {
          fullContent += chunk;
          updateMessage(currentChatId, assistantMessageId, { content: fullContent });
        }
      } catch (error) {
        updateMessage(
          currentChatId,
          assistantMessageId,
          {
            content: `Error: ${error instanceof Error ? error.message : 'Failed to get response'}`,
          }
        );
      }
    },
    [currentChatId, currentChat, settings.model, addMessage, updateMessage, updateChatTitle]
  );

  return {
    currentChat,
    sendMessage,
    createChat,
  };
}
