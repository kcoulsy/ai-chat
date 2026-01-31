import { useState, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { markerColors, type Chat } from '../../types';

interface MinimapData {
  position: number;
  type: 'message' | 'marker' | 'thread';
  color?: string;
  label?: string;
  preview?: string;
}

export function MiniMap() {
  const { chats, currentChatId, markers, threads } = useAppStore();
  const currentChat = chats.find((c: Chat) => c.id === currentChatId);
  const [hoveredItem, setHoveredItem] = useState<MinimapData | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const minimapData = useMemo(() => {
    if (!currentChat) return [];

    const data: MinimapData[] = [];
    const totalMessages = currentChat.messages.length;
    if (totalMessages === 0) return data;

    // Add message density bars
    currentChat.messages.forEach((_message: unknown, index: number) => {
      data.push({
        position: (index / Math.max(totalMessages - 1, 1)) * 100,
        type: 'message',
      });
    });

    // Add markers
    markers
      .filter((m) => m.chatId === currentChat.id)
      .forEach((marker) => {
        const messageIndex = currentChat.messages.findIndex((m: { id: string }) => m.id === marker.messageId);
        if (messageIndex !== -1) {
          data.push({
            position: (messageIndex / Math.max(totalMessages - 1, 1)) * 100,
            type: 'marker',
            color: marker.color,
            label: marker.label,
          });
        }
      });

    // Add threads
    threads
      .filter((t) => t.chatId === currentChat.id)
      .forEach((thread) => {
        const messageIndex = currentChat.messages.findIndex((m: { id: string }) => m.id === thread.parentMessageId);
        if (messageIndex !== -1) {
          data.push({
            position: (messageIndex / Math.max(totalMessages - 1, 1)) * 100,
            type: 'thread',
            label: thread.selectedText.slice(0, 30),
            preview: thread.context.slice(0, 50),
          });
        }
      });

    return data.sort((a, b) => a.position - b.position);
  }, [currentChat, markers, threads]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    // Find closest item
    const position = (y / rect.height) * 100;
    const closest = minimapData.reduce(
      (closest, item) => {
        const distance = Math.abs(item.position - position);
        return distance < closest.distance ? { item, distance } : closest;
      },
      { item: null as MinimapData | null, distance: Infinity }
    );

    if (closest.distance < 5) {
      setHoveredItem(closest.item);
    } else {
      setHoveredItem(null);
    }
  };

  const handleClick = () => {
    if (hoveredItem && currentChat) {
      const messageIndex = Math.round(
        (hoveredItem.position / 100) * (currentChat.messages.length - 1)
      );
      const message = currentChat.messages[messageIndex];
      if (message) {
        const element = document.querySelector(`[data-message-id="${message.id}"]`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  if (!currentChat || currentChat.messages.length === 0) {
    return (
      <div className="h-32 bg-muted rounded flex items-center justify-center">
        <span className="text-xs text-muted-foreground">No messages yet</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        className="h-32 bg-muted rounded relative cursor-crosshair overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredItem(null)}
        onClick={handleClick}
      >
        {/* Message density bars */}
        {minimapData
          .filter((d) => d.type === 'message')
          .map((item, i) => (
            <div
              key={`msg-${i}`}
              className="absolute left-1 right-1 h-1 bg-muted-foreground/30 rounded"
              style={{ top: `${item.position}%` }}
            />
          ))}

        {/* Markers */}
        {minimapData
          .filter((d) => d.type === 'marker')
          .map((item, i) => {
            const colorClass = markerColors.find(c => c.value === item.color)?.class || 'bg-gray-500';
            return (
              <div
                key={`marker-${i}`}
                className={`absolute left-2 right-2 h-2 ${colorClass} rounded-full`}
                style={{ top: `${item.position}%` }}
              />
            );
          })}

        {/* Threads */}
        {minimapData
          .filter((d) => d.type === 'thread')
          .map((item, i) => (
            <div
              key={`thread-${i}`}
              className="absolute left-1 right-1 h-3 border-2 border-accent bg-accent/20 rounded"
              style={{ top: `${item.position}%` }}
            />
          ))}
      </div>

      {/* Hover Popover */}
      {hoveredItem && (
        <div
          className="absolute z-50 bg-popover rounded-lg shadow-lg border border-border p-3 w-48 pointer-events-none"
          style={{
            left: '100%',
            top: `${mousePos.y}px`,
            marginLeft: '8px',
            transform: 'translateY(-50%)',
          }}
        >
          {hoveredItem.type === 'marker' && (
            <>
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: hoveredItem.color }}
                />
                <span className="text-xs font-medium text-foreground">{hoveredItem.label}</span>
              </div>
              <span className="text-[10px] text-muted-foreground">Click to jump</span>
            </>
          )}
          {hoveredItem.type === 'thread' && (
            <>
              <div className="text-xs font-medium text-foreground mb-1">Thread</div>
              <p className="text-[10px] text-muted-foreground italic mb-1">"{hoveredItem.label}..."</p>
              <p className="text-[10px] text-muted-foreground">{hoveredItem.preview}</p>
            </>
          )}
          {hoveredItem.type === 'message' && (
            <span className="text-xs text-muted-foreground">Click to jump to message</span>
          )}
        </div>
      )}
    </div>
  );
}
