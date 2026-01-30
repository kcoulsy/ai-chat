import { useState, useRef } from 'react';
import { MessageSquare, Bookmark, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useMarkers } from '../../hooks/useMarkers';
import { categoryColors, categoryLabels, type MarkerCategory } from '../../types';

interface FloatingToolbarProps {
  selectedText: string;
  rect: DOMRect;
  messageId: string;
  onClose: () => void;
}

export function FloatingToolbar({ selectedText, rect, messageId, onClose }: FloatingToolbarProps) {
  const [showMarkerDialog, setShowMarkerDialog] = useState(false);
  const [markerLabel, setMarkerLabel] = useState('');
  const [markerCategory, setMarkerCategory] = useState<MarkerCategory>('note');
  const { addMarker } = useMarkers();
  const createThread = useAppStore((state) => state.createThread);
  const currentChatId = useAppStore((state) => state.currentChatId);
  const setCurrentThread = useAppStore((state) => state.setCurrentThread);

  const toolbarRef = useRef<HTMLDivElement>(null);

  const handleCreateThread = () => {
    if (!currentChatId) return;
    
    const context = prompt(`What would you like to explore about: "${selectedText.slice(0, 50)}..."?`);
    if (context && context.trim()) {
      const threadId = createThread(currentChatId, messageId, selectedText, context.trim());
      setCurrentThread(threadId);
      onClose();
      window.getSelection()?.removeAllRanges();
    }
  };

  const handleAddMarker = () => {
    if (markerLabel.trim()) {
      addMarker(messageId, markerLabel.trim(), markerCategory);
      setShowMarkerDialog(false);
      setMarkerLabel('');
      onClose();
      window.getSelection()?.removeAllRanges();
    }
  };

  // Calculate position
  const toolbarHeight = showMarkerDialog ? 180 : 50;
  const top = rect.top - toolbarHeight - 10;
  const left = Math.max(10, Math.min(rect.left + rect.width / 2 - 100, window.innerWidth - 220));

  return (
    <div
      ref={toolbarRef}
      className="fixed z-50 bg-popover rounded-lg shadow-lg border border-border p-2"
      style={{ top: `${top}px`, left: `${left}px` }}
    >
      {!showMarkerDialog ? (
        <div className="flex gap-2">
          <button
            onClick={handleCreateThread}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded hover:opacity-90 transition-colors"
          >
            <MessageSquare size={14} />
            Create Thread
          </button>
          <button
            onClick={() => setShowMarkerDialog(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-muted text-foreground text-sm rounded hover:bg-muted/80 transition-colors"
          >
            <Bookmark size={14} />
            Add Marker
          </button>
        </div>
      ) : (
        <div className="w-64">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Add Marker</span>
            <button onClick={() => setShowMarkerDialog(false)} className="text-muted-foreground hover:text-foreground">
              <X size={16} />
            </button>
          </div>

          <input
            type="text"
            placeholder="Marker label..."
            value={markerLabel}
            onChange={(e) => setMarkerLabel(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
            autoFocus
          />

          <div className="flex gap-1 mb-3">
            {(Object.keys(categoryColors) as MarkerCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setMarkerCategory(cat)}
                className={`flex-1 text-[10px] py-1 px-1 rounded transition-colors ${
                  markerCategory === cat
                    ? `${categoryColors[cat]} text-white`
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {categoryLabels[cat]}
              </button>
            ))}
          </div>

          <button
            onClick={handleAddMarker}
            disabled={!markerLabel.trim()}
            className="w-full py-1.5 bg-primary text-primary-foreground text-sm rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Add Marker
          </button>
        </div>
      )}
    </div>
  );
}
