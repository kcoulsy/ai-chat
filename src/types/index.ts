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
  sourceThreadId?: string; // Links to original thread if this chat was converted from a thread
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

export interface Marker {
  id: string;
  chatId: string;
  messageId: string;
  label: string;
  color: string;
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

// Predefined marker colors
export const markerColors = [
  { name: 'Red', value: '#ef4444', class: 'bg-red-500' },
  { name: 'Orange', value: '#f97316', class: 'bg-orange-500' },
  { name: 'Amber', value: '#f59e0b', class: 'bg-amber-500' },
  { name: 'Green', value: '#22c55e', class: 'bg-green-500' },
  { name: 'Blue', value: '#3b82f6', class: 'bg-blue-500' },
  { name: 'Purple', value: '#a855f7', class: 'bg-purple-500' },
  { name: 'Pink', value: '#ec4899', class: 'bg-pink-500' },
  { name: 'Teal', value: '#14b8a6', class: 'bg-teal-500' },
] as const;

export const defaultMarkerColor = markerColors[4].value; // Blue

// Content segment type for parsing messages with code blocks
export interface ContentSegment {
  type: 'text' | 'code';
  content: string;
  lineIndex: number;  // Starting line index for marker positioning
  lineCount: number;  // Number of lines this segment spans
}
