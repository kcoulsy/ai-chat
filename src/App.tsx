import { useEffect } from 'react';
import { LeftSidebar } from './components/layout/LeftSidebar';
import { ChatPanel } from './components/chat/ChatPanel';
import { ThreadPanel } from './components/chat/ThreadPanel';
import { RightPanel } from './components/layout/RightPanel';
import { SettingsPanel } from './components/settings/SettingsPanel';
import { useAppStore } from './store/useAppStore';
import { useThreads } from './hooks/useThreads';
import { initializeOpenAI } from './services/openai';
import './App.css';

function App() {
  const { settings, closeThreadPanel } = useAppStore();
  const { currentThread, currentThreadId } = useThreads();

  useEffect(() => {
    if (settings.openaiApiKey) {
      initializeOpenAI(settings.openaiApiKey);
    }
  }, [settings.openaiApiKey]);

  return (
    <div className="h-screen flex bg-background relative overflow-hidden">
      <LeftSidebar />
      <ChatPanel />
      <RightPanel />
      <SettingsPanel />

      {/* ThreadPanel - slides in as modal overlay over ChatPanel */}
      {currentThreadId && currentThread && (
        <>
          {/* Backdrop overlay - darkens the chat underneath */}
          <div
            className="fixed inset-0 bg-black/30 z-20 transition-opacity duration-300"
            onClick={closeThreadPanel}
            style={{
              left: '256px', // LeftSidebar width (w-64)
              right: '288px', // RightPanel width (w-72)
            }}
          />

          {/* ThreadPanel - 80% width of the chat area */}
          <div
            className={`
              fixed top-0 bottom-0 z-30
              transform transition-transform duration-300 ease-in-out
              ${currentThreadId ? 'translate-x-0' : 'translate-x-full'}
            `}
            style={{
              right: '288px', // RightPanel width (w-72 = 288px)
              width: 'calc((100% - 256px - 288px) * 0.8)', // 80% of (viewport - LeftSidebar - RightPanel)
            }}
          >
            <ThreadPanel thread={currentThread} onClose={closeThreadPanel} />
          </div>
        </>
      )}
    </div>
  );
}

export default App;
