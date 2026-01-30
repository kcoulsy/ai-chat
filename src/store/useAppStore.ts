import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Chat, Message, Thread, Marker, AppSettings } from '../types';

interface AppState {
  // Data
  chats: Chat[];
  threads: Thread[];
  markers: Marker[];
  
  // UI State
  currentChatId: string | null;
  currentThreadId: string | null;
  isSettingsOpen: boolean;
  
  // Settings
  settings: AppSettings;
  
  // Actions
  setCurrentChat: (chatId: string | null) => void;
  setCurrentThread: (threadId: string | null) => void;
  createChat: (title?: string) => string;
  deleteChat: (chatId: string) => void;
  addMessage: (chatId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateMessage: (chatId: string, messageId: string, updates: Partial<Message>) => void;
  createThread: (chatId: string, parentMessageId: string, selectedText: string, context: string) => string;
  createMarker: (chatId: string, messageId: string, label: string, category: Marker['category']) => void;
  deleteMarker: (markerId: string) => void;
  setSettings: (settings: Partial<AppSettings>) => void;
  setSettingsOpen: (open: boolean) => void;
  updateChatTitle: (chatId: string, title: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      chats: [],
      threads: [],
      markers: [],
      currentChatId: null,
      currentThreadId: null,
      isSettingsOpen: false,
      settings: {
        openaiApiKey: '',
        model: 'gpt-4o-mini',
        theme: 'system',
      },

      // Actions
      setCurrentChat: (chatId) => set({ currentChatId: chatId, currentThreadId: null }),
      
      setCurrentThread: (threadId) => set({ currentThreadId: threadId }),
      
      createChat: (title) => {
        const id = crypto.randomUUID();
        const newChat: Chat = {
          id,
          title: title || 'New Chat',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messages: [],
        };
        set((state) => ({
          chats: [newChat, ...state.chats],
          currentChatId: id,
        }));
        return id;
      },
      
      deleteChat: (chatId) => {
        set((state) => ({
          chats: state.chats.filter((c) => c.id !== chatId),
          threads: state.threads.filter((t) => t.chatId !== chatId),
          markers: state.markers.filter((m) => m.chatId !== chatId),
          currentChatId: state.currentChatId === chatId ? null : state.currentChatId,
        }));
      },
      
      addMessage: (chatId, message) => {
        const newMessage: Message = {
          ...message,
          id: crypto.randomUUID(),
          timestamp: Date.now(),
        };
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId
              ? { ...chat, messages: [...chat.messages, newMessage], updatedAt: Date.now() }
              : chat
          ),
        }));
      },
      
      updateMessage: (chatId, messageId, updates) => {
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: chat.messages.map((m) =>
                    m.id === messageId ? { ...m, ...updates } : m
                  ),
                  updatedAt: Date.now(),
                }
              : chat
          ),
        }));
      },
      
      createThread: (chatId, parentMessageId, selectedText, context) => {
        const id = crypto.randomUUID();
        const newThread: Thread = {
          id,
          chatId,
          parentMessageId,
          selectedText,
          context,
          createdAt: Date.now(),
        };
        set((state) => ({
          threads: [...state.threads, newThread],
        }));
        return id;
      },
      
      createMarker: (chatId, messageId, label, category) => {
        const newMarker: Marker = {
          id: crypto.randomUUID(),
          chatId,
          messageId,
          label,
          category,
          timestamp: Date.now(),
        };
        set((state) => ({
          markers: [...state.markers, newMarker],
        }));
      },
      
      deleteMarker: (markerId) => {
        set((state) => ({
          markers: state.markers.filter((m) => m.id !== markerId),
        }));
      },
      
      setSettings: (settings) => {
        set((state) => ({
          settings: { ...state.settings, ...settings },
        }));
      },
      
      setSettingsOpen: (open) => set({ isSettingsOpen: open }),
      
      updateChatTitle: (chatId, title) => {
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId ? { ...chat, title, updatedAt: Date.now() } : chat
          ),
        }));
      },
    }),
    {
      name: 'story-ai-chat-storage',
      partialize: (state) => ({
        chats: state.chats,
        threads: state.threads,
        markers: state.markers,
        settings: state.settings,
      }),
    }
  )
);
