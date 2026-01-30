import { MessageSquare, ArrowLeft } from 'lucide-react';
import type { Thread } from '../../types';
import { useAppStore } from '../../store/useAppStore';

interface ThreadContextBarProps {
  thread: Thread;
}

export function ThreadContextBar({ thread }: ThreadContextBarProps) {
  const setCurrentThread = useAppStore((state) => state.setCurrentThread);

  return (
    <div className="bg-accent/20 border-b border-accent p-4">
      <div className="flex items-start gap-3">
        <button
          onClick={() => setCurrentThread(null)}
          className="flex items-center gap-1 text-sm text-accent-foreground hover:opacity-80 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to main
        </button>
      </div>

      <div className="mt-3 p-3 bg-card rounded-lg border border-accent">
        <div className="flex items-center gap-2 text-accent-foreground mb-2">
          <MessageSquare size={16} />
          <span className="text-sm font-medium">Thread Context</span>
        </div>

        <div className="space-y-2">
          <div>
            <span className="text-xs text-muted-foreground">Selected text:</span>
            <p className="text-sm text-foreground italic">"{thread.selectedText}"</p>
          </div>

          <div>
            <span className="text-xs text-muted-foreground">Your instruction:</span>
            <p className="text-sm text-foreground">{thread.context}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
