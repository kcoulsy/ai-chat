export interface Message {
  id: string;
  chatId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  threadId?: string;
  parentMessageId?: string;
}

export interface Chat {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
}

export interface Thread {
  id: string;
  chatId: string;
  parentMessageId: string;
  selectedText: string;
  context: string;
  createdAt: number;
}

export type MarkerCategory = 'plot' | 'character' | 'world' | 'note';

export interface Marker {
  id: string;
  chatId: string;
  messageId: string;
  label: string;
  category: MarkerCategory;
  timestamp: number;
}

export const themeNames = ['amethyst-haze', 'coffee'] as const;

export type ThemeName = typeof themeNames[number];

export type ThemeMode = 'light' | 'dark' | 'system';

export interface AppSettings {
  openaiApiKey: string;
  model: string;
  theme: ThemeName;
  themeMode: ThemeMode;
}

export const categoryColors: Record<MarkerCategory, string> = {
  plot: 'bg-red-500',
  character: 'bg-green-500',
  world: 'bg-blue-500',
  note: 'bg-yellow-500',
};

export const categoryLabels: Record<MarkerCategory, string> = {
  plot: 'Plot',
  character: 'Character',
  world: 'World',
  note: 'Note',
};
