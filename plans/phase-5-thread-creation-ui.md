# Phase 5: Thread Creation UI

## Overview
Redesign the thread creation input section to make the state obvious with a dedicated UI element. Currently, selected text is auto-populated into the input field which is confusing.

## Current Implementation

### Current Flow
1. User selects text → FloatingToolbar appears
2. User clicks "Create Thread" → `pendingThreadContext` is set
3. Input is auto-populated with truncated selected text
4. User types their message after the selected text

**Issues with current approach:**
- Auto-populated text in input is confusing (looks like user typed it)
- No clear visual indication that user is in "thread creation mode"
- Selected text and user input are mixed together
- No easy way to cancel thread creation

**Current code in ChatPanel.tsx lines 18-26:**
```typescript
useEffect(() => {
  if (pendingThreadContext) {
    const truncatedText = pendingThreadContext.selectedText.length > 100
      ? pendingThreadContext.selectedText.slice(0, 100) + '...'
      : pendingThreadContext.selectedText;
    setInput(truncatedText);
  }
}, [pendingThreadContext]);
```

## Goal
Create a clear, dedicated thread creation UI that:
- Shows an obvious "Creating thread" state
- Displays selected text separately (non-editable)
- Has clear visual separation between context and user input
- Provides an easy cancel button
- Uses animated transitions

## Technical Design

### 1. Thread Creation State UI

**New Component Structure:**
```
┌─────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Creating thread                           [Cancel X] │   │
│  │ ┌─────────────────────────────────────────────────┐ │   │
│  │ │ "Selected text appears here, truncated..."      │ │   │
│  │ └─────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [User types their message here...                    ] [➤]│
└─────────────────────────────────────────────────────────────┘
```

### 2. Visual Design

**Thread Context Card:**
- Background: Subtle accent color (`bg-accent/10` or `bg-primary/5`)
- Border: Left border accent (`border-l-4 border-primary`)
- Header: "Creating thread" label with cancel button
- Body: Truncated selected text in italic/quotes
- Animation: Slide down/grow when appearing

**Input Field:**
- Placeholder: "Add your message about the selected text..."
- Clear visual separation from the context card
- No auto-populated content

### 3. Component Updates

**File:** `src/components/chat/ChatPanel.tsx`

**Add state for animations:**
```typescript
const [showThreadContext, setShowThreadContext] = useState(false);

useEffect(() => {
  if (pendingThreadContext) {
    // Small delay for animation
    requestAnimationFrame(() => setShowThreadContext(true));
  } else {
    setShowThreadContext(false);
  }
}, [pendingThreadContext]);
```

**Thread Context UI Component:**
```tsx
{pendingThreadContext && (
  <div 
    className={`
      mx-4 mb-3 overflow-hidden transition-all duration-300 ease-out
      ${showThreadContext ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}
    `}
  >
    <div className="
      bg-accent/10 border-l-4 border-primary 
      rounded-r-lg p-3
    ">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-primary flex items-center gap-2">
          <MessageSquare size={14} />
          Creating thread
        </span>
        <button
          onClick={() => {
            setPendingThreadContext(null);
            setInput('');
          }}
          className="
            text-muted-foreground hover:text-destructive
            p-1 rounded hover:bg-destructive/10
            transition-colors
          "
          title="Cancel thread creation"
        >
          <X size={14} />
        </button>
      </div>
      
      {/* Selected Text Display */}
      <div className="
        bg-background/50 rounded px-3 py-2
        text-sm text-muted-foreground italic
        border border-border/50
      ">
        "{pendingThreadContext.selectedText.length > 150
          ? pendingThreadContext.selectedText.slice(0, 150) + '...'
          : pendingThreadContext.selectedText}"
      </div>
    </div>
  </div>
)}
```

**Updated Input Placeholder:**
```tsx
placeholder={
  pendingThreadContext
    ? 'Add your message about the selected text...'
    : currentThreadId
    ? 'Explore the thread context...'
    : 'Type your message...'
}
```

### 4. Remove Auto-Population

**Remove this useEffect entirely:**
```typescript
// REMOVE THIS:
useEffect(() => {
  if (pendingThreadContext) {
    const truncatedText = pendingThreadContext.selectedText.length > 100
      ? pendingThreadContext.selectedText.slice(0, 100) + '...'
      : pendingThreadContext.selectedText;
    setInput(truncatedText);
  }
}, [pendingThreadContext]);
```

### 5. Submit Handler Updates

**Current behavior:** User types after the auto-populated text

**New behavior:** User types their own message, context is sent separately

The submit handler (lines 32-62) already handles this correctly:
```typescript
if (pendingThreadContext) {
  const threadId = createThread(
    currentChatId,
    pendingThreadContext.parentMessageId,
    pendingThreadContext.selectedText,
    content,  // User's input
    pendingThreadContext.lineIndex
  );
  
  await sendMessage(content, { threadId });
  setPendingThreadContext(null);
}
```

### 6. Animation Details

**Entry animation:**
- Height: 0 → auto (using max-height trick)
- Opacity: 0 → 1
- Duration: 300ms
- Easing: ease-out

**Exit animation:**
- Height: auto → 0
- Opacity: 1 → 0
- Duration: 200ms
- Easing: ease-in

**CSS Implementation:**
```css
.thread-context-enter {
  max-height: 0;
  opacity: 0;
}

.thread-context-enter-active {
  max-height: 200px;
  opacity: 1;
  transition: max-height 300ms ease-out, opacity 300ms ease-out;
}
```

### 7. Alternative Design Options

**Option A: Compact Inline (Current approach)**
- Context shown above input
- Minimal space usage
- Clear separation

**Option B: Modal/Popover**
- Dedicated overlay for thread creation
- More space for context display
- Could include preview of parent message

**Option C: Inline Expanded Input**
- Input grows to show context
- Context inside input area
- Less visual separation

**Recommendation:** Option A - clear and space-efficient

## Files to Modify

### ChatPanel.tsx
1. Remove auto-population useEffect
2. Add animation state
3. Add thread context UI section above input
4. Update input placeholder
5. Ensure cancel button clears state properly

### useAppStore (if needed)
- No changes needed - `pendingThreadContext` state is sufficient

## Edge Cases

1. **Very long selected text**: Truncate with ellipsis at 150 chars
2. **Multi-line selected text**: Display as single line with ellipsis
3. **Special characters**: Ensure proper escaping in display
4. **Rapid cancel/create**: Handle animation interruptions
5. **Mobile view**: Ensure context card doesn't take too much space

## User Flow

### Before
1. Select text → "Create Thread"
2. Input auto-filled with "This is the selected text that..."
3. User confused about what to type
4. User types after the text or deletes it

### After
1. Select text → "Create Thread"
2. Context card slides down showing selected text
3. Empty input with placeholder "Add your message..."
4. User clearly understands they need to add their own message
5. Easy Cancel button visible

## Accessibility

- Context card has proper ARIA labels
- Cancel button has descriptive title
- Focus management: return focus to input after cancel
- Sufficient color contrast for all text
- Keyboard: Escape key should also cancel

## Keyboard Shortcuts

- `Escape`: Cancel thread creation
- `Enter`: Submit message (existing behavior)

## Questions to Resolve

1. **Truncate length**: 100, 150, or 200 characters?
2. **Show full text**: Click to expand or tooltip?
3. **Cancel confirmation**: Always immediate or confirm if input has text?

**Recommendations:**
- 150 characters truncation
- No expand (keeps UI clean), rely on full text in parent message
- Immediate cancel (simple, expected behavior)
