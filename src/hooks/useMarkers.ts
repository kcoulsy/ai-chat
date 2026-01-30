import { useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import type { MarkerCategory } from '../types';

export function useMarkers() {
  const { markers, currentChatId, createMarker, deleteMarker } = useAppStore();

  const chatMarkers = markers.filter((m) => m.chatId === currentChatId);

  const addMarker = useCallback(
    (messageId: string, label: string, category: MarkerCategory) => {
      if (!currentChatId) return;
      createMarker(currentChatId, messageId, label, category);
    },
    [currentChatId, createMarker]
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
    removeMarker,
    getMarkersForMessage,
  };
}
