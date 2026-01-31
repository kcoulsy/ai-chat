# Phase 4: Utility Buttons

## Overview
Add floating action buttons to AI message bubbles for quick actions: copy response content and jump to previous message.

## Goal
Add subtle utility buttons on AI messages that appear on hover:
1. **Copy button**: Copies full message content to clipboard
2. **Jump to previous button**: Scrolls to the previous message

## Technical Design

### 1. Button Placement

**Location:** Right side of AI message bubbles
**Visibility:** Show on hover, hide by default (subtle UX)
**Position:** Absolute positioned, vertically centered on the right

```
┌────────────────────────────────────────────────────┐
│ 🤖  Message content here...              [📋] [⬆️] │
│     More content...                                │
└────────────────────────────────────────────────────┘
          ↑ Copy    ↑ Jump to previous
```

### 2. Component Updates

**File:** `src/components/chat/MessageBubble.tsx`

**Add imports:**
```typescript
import { Copy, ArrowUp } from 'lucide-react';
import { useState } from 'react';
```

**Add state:**
```typescript
const [showActions, setShowActions] = useState(false);
const [copied, setCopied] = useState(false);
```

**Button container (inside message bubble, for AI messages only):**
```tsx
{!isUser && (
  <div 
    className={`
      absolute right-0 top-1/2 -translate-y-1/2 translate-x-full
      flex flex-col gap-1 pl-2
      opacity-0 transition-opacity duration-200
      ${showActions ? 'opacity-100' : ''}
    `}
  >
    <CopyButton content={message.content} />
    <JumpButton messageId={message.id} />
  </div>
)}
```

### 3. Copy Button Implementation

```typescript
interface CopyButtonProps {
  content: string;
}

function CopyButton({ content }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="
        p-1.5 rounded-md
        bg-muted hover:bg-muted/80
        text-muted-foreground hover:text-foreground
        transition-colors
        shadow-sm
      "
      title={copied ? 'Copied!' : 'Copy message'}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}
```

### 4. Jump to Previous Button Implementation

```typescript
interface JumpButtonProps {
  messageId: string;
}

function JumpButton({ messageId }: JumpButtonProps) {
  const currentChat = useAppStore((state) => 
    state.chats.find((c) => c.id === state.currentChatId)
  );

  const handleJump = () => {
    if (!currentChat) return;
    
    const messageIndex = currentChat.messages.findIndex(
      (m) => m.id === messageId
    );
    
    if (messageIndex > 0) {
      const previousMessage = currentChat.messages[messageIndex - 1];
      const element = document.querySelector(
        `[data-message-id="${previousMessage.id}"]`
      );
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <button
      onClick={handleJump}
      className="
        p-1.5 rounded-md
        bg-muted hover:bg-muted/80
        text-muted-foreground hover:text-foreground
        transition-colors
        shadow-sm
      "
      title="Jump to previous message"
    >
      <ArrowUp size={14} />
    </button>
  );
}
```

### 5. MessageBubble Structure Updates

**Current structure (simplified):**
```tsx
<div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
  <Avatar />
  <div className="flex-1 max-w-[80%]">
    <div className="inline-block px-4 py-2 rounded-lg">
      {/* Content */}
    </div>
  </div>
</div>
```

**New structure with action buttons:**
```tsx
<div 
  className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
  onMouseEnter={() => setShowActions(true)}
  onMouseLeave={() => setShowActions(false)}
>
  <Avatar />
  <div className="flex-1 max-w-[80%] relative">
    <div className="inline-block px-4 py-2 rounded-lg relative">
      {/* Content */}
    </div>
    {/* Action buttons positioned here */}
    {!isUser && (
      <div className="action-buttons-container">
        <CopyButton />
        <JumpButton />
      </div>
    )}
  </div>
</div>
```

### 6. Styling Considerations

**Visibility approach - Option A: Hover on message bubble**
- Pros: Intuitive, clean default state
- Cons: Not discoverable on mobile

**Visibility approach - Option B: Always visible (subtle)**
- Pros: Always accessible, mobile-friendly
- Cons: Adds visual clutter

**Visibility approach - Option C: Hover on buttons area**
- Pros: Easy to target
- Cons: Requires knowing buttons exist

**Recommendation:** Option A with mobile fallback (always visible on touch devices)

### 7. Mobile Considerations

For touch devices, buttons should always be visible or use a long-press menu:

```typescript
const isTouchDevice = 'ontouchstart' in window;

// Always show on touch devices
className={`... ${isTouchDevice || showActions ? 'opacity-100' : 'opacity-0'}`}
```

### 8. Accessibility

- Buttons have descriptive `title` attributes
- Focus visible states for keyboard navigation
- `aria-label` for screen readers
- Sufficient touch target size (min 24x24px)

## Files to Modify

### MessageBubble.tsx
1. Add imports (Copy, ArrowUp, Check icons)
2. Add local state for hover and copied status
3. Create CopyButton sub-component
4. Create JumpButton sub-component
5. Add hover handlers and button container
6. Position buttons appropriately

## Edge Cases

1. **First message**: Hide jump button (no previous message)
2. **Clipboard API unavailable**: Graceful fallback (show error or use deprecated methods)
3. **Long messages**: Buttons should stay visible during hover
4. **Nested scroll containers**: Ensure scrollIntoView works correctly

## Future Enhancements

- **Regenerate button**: For retrying AI responses
- **Edit button**: For editing user messages
- **Delete button**: For removing messages
- **Quote/Reply button**: For threaded replies

## Questions to Resolve

1. **Button visibility**: Always visible on desktop or hover-only?
2. **Button order**: Copy first or jump first?
3. **Icons**: ArrowUp for previous, or different icon?
4. **Animation**: Should buttons slide in or fade in?

**Recommendations:**
- Hover-only on desktop, always visible on mobile
- Copy button first (more commonly used)
- ArrowUp is clear, or use CornerLeftUp for "reply" semantics
- Subtle fade-in animation (200ms)
