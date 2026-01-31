# Phase 2: Thread Panel Redesign

## Overview
Convert the thread view from a top bar in ChatPanel to a slide-out right panel positioned between ChatPanel and RightPanel. This provides better space utilization and doesn't block navigation.

## Current Implementation

### ThreadContextBar (to be deprecated)
- Location: `src/components/chat/ThreadContextBar.tsx`
- Current usage: Rendered at top of ChatPanel when `currentThreadId` is set
- Shows: Back button, thread context (selected text, instruction)

### Current Layout Flow
```
┌─────────────────────────────────────────────────────────────┐
│  LeftSidebar  │  ChatPanel                        │ RightPanel│
│               │  ┌─────────────────────────────┐  │           │
│               │  │ ThreadContextBar (if thread)│  │           │
│               │  └─────────────────────────────┘  │           │
│               │  │ Messages...                 │  │           │
│               │  └─────────────────────────────┘  │           │
│               │  │ Input                       │  │           │
│               │  └─────────────────────────────┘  │           │
└─────────────────────────────────────────────────────────────┘
```

## Goal
Create a slide-out ThreadPanel that:
- Slides in from the right (between ChatPanel and RightPanel)
- Doesn't push RightPanel (overlays content)
- Contains all thread context and messages
- Allows easy navigation back to main chat

## New Layout Design

### Normal State (No Thread)
```
┌─────────────────────────────────────────────────────────────┐
│  LeftSidebar  │  ChatPanel                        │ RightPanel│
│   (w-64)      │  (flex-1)                         │ (w-72)    │
└─────────────────────────────────────────────────────────────┘
```

### Thread Active State
```
┌──────────────────────────────────────────────────────────────────────┐
│  LeftSidebar  │  ChatPanel    │ ThreadPanel │ RightPanel            │
│   (w-64)      │  (shrinks)    │  (w-96)     │ (w-72 - stays)        │
│               │               │  slides over│                       │
└──────────────────────────────────────────────────────────────────────┘
```

## Technical Design

### 1. New Component: ThreadPanel
**Location:** `src/components/chat/ThreadPanel.tsx`

**Props:**
```typescript
interface ThreadPanelProps {
  thread: Thread;
  onClose: () => void;
}
```

**Features:**
- Fixed width slide-out panel (suggested: 400px / w-96)
- Header with:
  - Close button (X icon)
  - Thread title (truncated selected text)
  - "Thread" label
- Thread context section:
  - Selected text display (with "Source" label)
  - Original instruction/context
- Message list:
  - All messages belonging to this thread
  - Same styling as main chat
- Input area:
  - Continue the thread conversation
  - Placeholder: "Continue exploring..."

**Styling:**
- Background: slightly different from ChatPanel (use bg-card)
- Border: left border to separate from ChatPanel
- Shadow: subtle box-shadow on left edge for depth
- Animation: slide in/out with CSS transitions

### 2. App.tsx Layout Changes

**Current:**
```tsx
<div className="h-screen flex bg-background">
  <LeftSidebar />
  <ChatPanel />
  <RightPanel />
  <SettingsPanel />
</div>
```

**New:**
```tsx
<div className="h-screen flex bg-background relative">
  <LeftSidebar />
  <ChatPanel />
  <ThreadPanel /> {/* Conditionally rendered, absolute positioned */}
  <RightPanel />
  <SettingsPanel />
</div>
```

**Positioning Strategy:**
- ThreadPanel uses `absolute` or `fixed` positioning
- Positioned `right: 288px` (width of RightPanel: w-72 = 288px)
- Height: full height (`h-full` or `top-0 bottom-0`)
- Z-index: above ChatPanel but below SettingsPanel

### 3. Store State Updates

**Current store state:**
```typescript
currentThreadId: string | null;
```

**Add new state:**
```typescript
isThreadPanelOpen: boolean;  // For animation control
```

**Actions:**
- `setCurrentThread(threadId)` - opens panel
- `closeThreadPanel()` - closes panel, clears currentThreadId
- `toggleThreadPanel()` - toggle visibility

### 4. ChatPanel Modifications

**Remove:**
- ThreadContextBar import and usage
- Thread-related header logic (lines 83-86)
- Thread message filtering (ChatPanel currently shows thread messages inline)

**Update:**
- Messages should NOT include thread messages when viewing main chat
- Current behavior: `currentChat?.messages` includes all
- New behavior: Filter out messages with `threadId` when `!currentThreadId`

**Current message rendering (lines 95-98):**
```tsx
{currentChat?.messages.map((message) => (
  <MessageBubble key={message.id} message={message} />
))}
```

**New logic:**
```tsx
const displayMessages = currentThreadId 
  ? [] // ThreadPanel handles its own messages
  : currentChat?.messages.filter(m => !m.threadId) || [];

{displayMessages.map((message) => (
  <MessageBubble key={message.id} message={message} />
))}
```

### 5. ThreadPanel Message Loading

ThreadPanel needs to load messages for the current thread:
```typescript
const threadMessages = currentChat?.messages.filter(
  m => m.threadId === currentThreadId
) || [];
```

### 6. Animation Implementation

**CSS Transition approach:**
```tsx
<div className={`
  fixed top-0 bottom-0 right-72 w-96 bg-card border-l border-border
  transform transition-transform duration-300 ease-in-out
  ${isThreadPanelOpen ? 'translate-x-0' : 'translate-x-full'}
`}>
```

**Alternative: Framer Motion (if available)**
```tsx
<motion.div
  initial={{ x: '100%' }}
  animate={{ x: isThreadPanelOpen ? 0 : '100%' }}
  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
>
```

### 7. RightPanel Persistence

Key requirement: RightPanel must remain accessible when ThreadPanel is open.

**Solution:**
- ThreadPanel overlays ChatPanel content
- RightPanel stays in place
- ChatPanel shrinks visually but maintains its DOM position

## Questions to Resolve

1. **Panel Width**: 
   - Option A: Fixed 400px (w-96)
   - Option B: 50% of available space
   - Option C: Resizable by user
   - **Recommendation**: Start with 400px fixed

2. **Thread Opening Behavior**:
   - Option A: Click thread in RightPanel → slides out ThreadPanel
   - Option B: Click thread → replaces main chat entirely
   - Option C: Modal/overlay approach
   - **Recommendation**: Option A (slide-out)

3. **Multiple Threads**:
   - Can user have multiple thread panels open?
   - **Recommendation**: No, single thread view at a time

## Migration Plan

1. Create new `ThreadPanel.tsx` component
2. Update `App.tsx` to include ThreadPanel in layout
3. Modify `ChatPanel.tsx`:
   - Remove ThreadContextBar
   - Filter messages to exclude thread messages
4. Update store if needed for panel state
5. Deprecate `ThreadContextBar.tsx` (can be deleted after verification)
6. Update `RightPanel.tsx` thread click handler to open ThreadPanel

## Edge Cases

1. **Small screens**: ThreadPanel may need to be full-width on mobile
2. **Very long thread**: Scroll behavior within ThreadPanel
3. **Thread deleted while viewing**: Graceful fallback to main chat
4. **SettingsPanel open**: Ensure z-index layering is correct

## Accessibility

- Focus trap within ThreadPanel when open
- Escape key to close
- ARIA labels for close button
- Keyboard navigation between panels
