import OpenAI from 'openai';
import type { Message } from '../types';

let openai: OpenAI | null = null;

export function initializeOpenAI(apiKey: string) {
  openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true,
  });
}

export function getOpenAI(): OpenAI {
  if (!openai) {
    throw new Error('OpenAI not initialized. Please set your API key in settings.');
  }
  return openai;
}

export async function* streamChatCompletion(
  messages: Pick<Message, 'role' | 'content'>[],
  model: string = 'gpt-4o-mini'
): AsyncGenerator<string, void, unknown> {
  const client = getOpenAI();
  
  const stream = await client.chat.completions.create({
    model,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}

export async function generateChatTitle(firstMessage: string): Promise<string> {
  const client = getOpenAI();
  
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'Generate a short, concise title (3-5 words) for a chat that starts with this message. Just return the title, nothing else.',
      },
      {
        role: 'user',
        content: firstMessage,
      },
    ],
    max_tokens: 20,
  });

  return response.choices[0]?.message?.content?.trim() || 'New Chat';
}
