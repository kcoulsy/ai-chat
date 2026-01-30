import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { initializeOpenAI } from '../services/openai';

export function useOpenAI() {
  const { settings } = useAppStore();

  useEffect(() => {
    if (settings.openaiApiKey) {
      initializeOpenAI(settings.openaiApiKey);
    }
  }, [settings.openaiApiKey]);

  return {
    isInitialized: !!settings.openaiApiKey,
    model: settings.model,
  };
}
