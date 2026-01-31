import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import type { Thread } from '../../types';
import { useAppStore } from '../../store/useAppStore';

interface ThreadBubbleProps {
  thread: Thread;
}

export function ThreadBubble({ thread }: ThreadBubbleProps) {
  const [isHovered, setIsHovered] = useState(false);
  const setCurrentThread = useAppStore((state) => state.setCurrentThread);

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 bg-accent text-accent-foreground rounded-full text-xs cursor-pointer hover:opacity-90 transition-colors w-fit my-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setCurrentThread(thread.id)}
    >
      <MessageSquare size={12} />
      <span className="truncate max-w-[200px]">
        {isHovered ? 'Click to view thread' : `"${thread.selectedText.slice(0, 40)}..."`}
      </span>
    </div>
  );
}
