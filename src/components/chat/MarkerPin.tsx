import { useState, useRef, useEffect } from 'react';
import { Bookmark, X, Edit2, Check } from 'lucide-react';
import type { Marker } from '../../types';
import { markerColors } from '../../types';

interface MarkerPinProps {
  marker: Marker;
  onClick?: () => void;
  onRemove?: () => void;
  onEdit?: (label: string, color: string) => void;
}

export function MarkerPin({ marker, onClick, onRemove, onEdit }: MarkerPinProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(marker.label);
  const [editColor, setEditColor] = useState(marker.color);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get the background color class for this marker
  const colorClass = markerColors.find(c => c.value === marker.color)?.class || 'bg-gray-500';

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editLabel.trim() && onEdit) {
      onEdit(editLabel.trim(), editColor);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditLabel(marker.label);
    setEditColor(marker.color);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div
        className="inline-flex items-center gap-1 bg-popover border border-border rounded-full px-2 py-1 shadow-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Color picker */}
        <div className="flex gap-0.5 mr-1">
          {markerColors.map((color) => (
            <button
              key={color.value}
              onClick={() => setEditColor(color.value)}
              className={`w-4 h-4 rounded-full transition-all ${color.class} ${
                editColor === color.value
                  ? 'ring-1 ring-offset-1 ring-primary scale-110'
                  : 'opacity-60 hover:opacity-100'
              }`}
              title={color.name}
            />
          ))}
        </div>

        {/* Label input */}
        <input
          ref={inputRef}
          type="text"
          value={editLabel}
          onChange={(e) => setEditLabel(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-24 px-1 py-0.5 text-xs bg-background border border-input rounded focus:outline-none focus:ring-1 focus:ring-ring"
        />

        {/* Save button */}
        <button
          onClick={handleSave}
          className="p-0.5 text-green-500 hover:bg-green-500/10 rounded transition-colors"
        >
          <Check size={12} />
        </button>

        {/* Cancel button */}
        <button
          onClick={handleCancel}
          className="p-0.5 text-muted-foreground hover:bg-muted rounded transition-colors"
        >
          <X size={12} />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`
        group inline-flex items-center gap-1 
        ${colorClass}
        text-white
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
      <span className="truncate max-w-[150px]">{marker.label}</span>

      {/* Edit button - visible on hover */}
      {onEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-white/20 rounded transition-opacity ml-0.5"
        >
          <Edit2 size={10} />
        </button>
      )}

      {/* Remove button - visible on hover */}
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
