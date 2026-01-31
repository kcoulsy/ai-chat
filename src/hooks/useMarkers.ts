import { useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';

export function useMarkers() {
  const { markers, currentChatId, createMarker, updateMarker, deleteMarker } = useAppStore();

  const chatMarkers = markers.filter((m) => m.chatId === currentChatId);

  const addMarker = useCallback(
    (messageId: string, label: string, color: string, selectedText: string, lineIndex: number) => {
      if (!currentChatId) return;
      createMarker(currentChatId, messageId, label, color, selectedText, lineIndex);
    },
    [currentChatId, createMarker]
  );

  const editMarker = useCallback(
    (markerId: string, updates: { label?: string; color?: string }) => {
      updateMarker(markerId, updates);
    },
    [updateMarker]
  );

  const removeMarker = useCallback(
    (markerId: string) => {
      deleteMarker(markerId);
    },
    [deleteMarker]
  );

  const getMarkersForMessage = useCallback(
    (messageId: string) => {
      return chatMarkers.filter((m) => m.messageId === messageId);
    },
    [chatMarkers]
  );

  return {
    markers: chatMarkers,
    addMarker,
    editMarker,
    removeMarker,
    getMarkersForMessage,
  };
}
