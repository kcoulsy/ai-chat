import { useState, useRef } from 'react';
import { MessageSquare, Bookmark, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useMarkers } from '../../hooks/useMarkers';
import { markerColors, defaultMarkerColor } from '../../types';

interface FloatingToolbarProps {
  selectedText: string;
  rect: DOMRect;
  messageId: string;
  lineIndex: number;
  onClose: () => void;
  onCreateThread: (text: string, parentMessageId: string, lineIndex: number) => void;
}

export function FloatingToolbar({ selectedText, rect, messageId, lineIndex, onClose, onCreateThread }: FloatingToolbarProps) {
  const [showMarkerDialog, setShowMarkerDialog] = useState(false);
  const [markerLabel, setMarkerLabel] = useState('');
  const [markerColor, setMarkerColor] = useState<string>(defaultMarkerColor);
  const { addMarker } = useMarkers();
  const currentChatId = useAppStore((state) => state.currentChatId);

  const toolbarRef = useRef<HTMLDivElement>(null);

  const handleCreateThread = () => {
    if (!currentChatId) return;

    onCreateThread(selectedText, messageId, lineIndex);
    onClose();
    window.getSelection()?.removeAllRanges();
  };

  const handleAddMarker = () => {
    if (markerLabel.trim()) {
      addMarker(messageId, markerLabel.trim(), markerColor, selectedText, lineIndex);
      setShowMarkerDialog(false);
      setMarkerLabel('');
      setMarkerColor(defaultMarkerColor);
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
      data-floating-toolbar
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

          <div className="flex gap-1 mb-3 flex-wrap">
            {markerColors.map((color) => (
              <button
                key={color.value}
                onClick={() => setMarkerColor(color.value)}
                className={`w-6 h-6 rounded-full transition-all ${color.class} ${
                  markerColor === color.value
                    ? 'ring-2 ring-offset-2 ring-primary scale-110'
                    : 'hover:scale-105'
                }`}
                title={color.name}
              />
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
