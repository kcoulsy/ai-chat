import { X, Key, Bot, Palette } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../theme/ThemeProvider';
import { useState } from 'react';
import type { Theme } from '../../types';

export function SettingsPanel() {
  const { settings, setSettings, isSettingsOpen, setSettingsOpen } = useAppStore();
  const { theme, setTheme } = useTheme();
  const [apiKey, setApiKey] = useState(settings.openaiApiKey);
  const [model, setModel] = useState(settings.model);

  if (!isSettingsOpen) return null;

  const handleSave = () => {
    setSettings({ openaiApiKey: apiKey, model });
    setSettingsOpen(false);
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-md mx-4 border border-border">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-card-foreground">Settings</h2>
          <button
            onClick={() => setSettingsOpen(false)}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              <div className="flex items-center gap-2">
                <Key size={16} />
                OpenAI API Key
              </div>
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Your API key is stored locally and never sent to our servers.
            </p>
          </div>

          {/* Model */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              <div className="flex items-center gap-2">
                <Bot size={16} />
                Model
              </div>
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
            >
              <option value="gpt-4o-mini">GPT-4o Mini (Recommended)</option>
              <option value="gpt-4o">GPT-4o</option>
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            </select>
          </div>

          {/* Theme */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              <div className="flex items-center gap-2">
                <Palette size={16} />
                Theme
              </div>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleThemeChange('light')}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  theme === 'light'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-foreground border-input hover:bg-muted'
                }`}
              >
                Light
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  theme === 'dark'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-foreground border-input hover:bg-muted'
                }`}
              >
                Dark
              </button>
              <button
                onClick={() => handleThemeChange('system')}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  theme === 'system'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-foreground border-input hover:bg-muted'
                }`}
              >
                System
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-border">
          <button
            onClick={() => setSettingsOpen(false)}
            className="px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
