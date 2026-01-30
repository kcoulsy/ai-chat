import { Bookmark, X } from 'lucide-react';
import { categoryColors, type Marker } from '../../types';

interface MarkerPinProps {
  marker: Marker;
  onClick?: () => void;
  onRemove?: () => void;
  showLabel?: boolean;
}

export function MarkerPin({ marker, onClick, onRemove, showLabel = false }: MarkerPinProps) {
  return (
    <div
      className={`
        group inline-flex items-center gap-1 
        ${categoryColors[marker.category]} 
        text-primary-foreground
        rounded-r-full rounded-l-sm
        px-2 py-0.5
        text-xs
        cursor-pointer
        hover:opacity-90
        transition-all
        shadow-sm
        border-l-2 border-white/30
      `}
      onClick={onClick}
      title={`${marker.label}${marker.selectedText ? ` (${marker.selectedText.slice(0, 50)}${marker.selectedText.length > 50 ? '...' : ''})` : ''}`}
    >
      <Bookmark size={10} className="flex-shrink-0" />
      {showLabel && (
        <span className="truncate max-w-[120px]">{marker.label}</span>
      )}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-white/20 rounded transition-opacity"
        >
          <X size={10} />
        </button>
      )}
    </div>
  );
}
