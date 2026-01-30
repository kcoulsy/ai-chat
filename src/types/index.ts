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
  lineIndex: number;
}

export type MarkerCategory = 'plot' | 'character' | 'world' | 'note';

export interface Marker {
  id: string;
  chatId: string;
  messageId: string;
  label: string;
  category: MarkerCategory;
  timestamp: number;
  selectedText: string;
  lineIndex: number;
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
  plot: 'bg-chart-1',
  character: 'bg-chart-2',
  world: 'bg-chart-3',
  note: 'bg-chart-4',
};

export const categoryLabels: Record<MarkerCategory, string> = {
  plot: 'Plot',
  character: 'Character',
  world: 'World',
  note: 'Note',
};
