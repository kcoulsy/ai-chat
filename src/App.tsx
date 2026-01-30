import { useEffect } from 'react';
import { LeftSidebar } from './components/layout/LeftSidebar';
import { ChatPanel } from './components/chat/ChatPanel';
import { RightPanel } from './components/layout/RightPanel';
import { SettingsPanel } from './components/settings/SettingsPanel';
import { useAppStore } from './store/useAppStore';
import { initializeOpenAI } from './services/openai';
import './App.css';

function App() {
  const { settings } = useAppStore();

  useEffect(() => {
    if (settings.openaiApiKey) {
      initializeOpenAI(settings.openaiApiKey);
    }
  }, [settings.openaiApiKey]);

  return (
    <div className="h-screen flex bg-background">
      <LeftSidebar />
      <ChatPanel />
      <RightPanel />
      <SettingsPanel />
    </div>
  );
}

export default App;
