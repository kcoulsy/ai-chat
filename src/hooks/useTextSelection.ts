import { useEffect, useState, useCallback, useRef } from 'react';

interface SelectionState {
  text: string;
  rect: DOMRect | null;
  messageId: string | null;
}

export function useTextSelection() {
  const [selection, setSelection] = useState<SelectionState>({
    text: '',
    rect: null,
    messageId: null,
  });
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSelection = useCallback(() => {
    setSelection({ text: '', rect: null, messageId: null });
  }, []);

  useEffect(() => {
    const handleSelectionChange = () => {
      const sel = window.getSelection();
      
      if (!sel || sel.isCollapsed) {
        // Delay clearing to allow clicking toolbar
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }
        hideTimeoutRef.current = setTimeout(() => {
          // Check if focus is inside the floating toolbar
          const activeElement = document.activeElement;
          const toolbar = document.querySelector('[data-floating-toolbar]');
          if (toolbar && (toolbar.contains(activeElement) || activeElement?.closest('[data-floating-toolbar]'))) {
            return;
          }
          clearSelection();
        }, 200);
        return;
      }

      const text = sel.toString().trim();
      if (!text) return;

      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      // Find the message element
      let element: HTMLElement | null = range.commonAncestorContainer as HTMLElement;
      if (element.nodeType === Node.TEXT_NODE) {
        element = element.parentElement;
      }
      
      const messageEl = element?.closest('[data-message-id]');
      const messageId = messageEl?.getAttribute('data-message-id') || null;

      // Only allow selection in assistant messages
      const role = messageEl?.getAttribute('data-role');
      if (role !== 'assistant') {
        clearSelection();
        return;
      }

      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }

      setSelection(prev => {
        // Only update if something actually changed
        if (prev.text === text && prev.messageId === messageId && 
            prev.rect?.top === rect.top && prev.rect?.left === rect.left) {
          return prev;
        }
        return { text, rect, messageId };
      });
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [clearSelection]);

  return {
    ...selection,
    clearSelection,
  };
}
