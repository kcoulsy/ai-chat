mplementation Plan
Phase 1: Code Block Handling (Priority: High)
Goal: Treat code blocks as single units instead of splitting by newlines

Changes needed:

MessageBubble.tsx - Modify line splitting logic to detect code blocks (```) and treat them as single "lines"
Use regex to split content while preserving code blocks intact
Render code blocks with proper styling without breaking them apart
Phase 2: Thread Panel Redesign (Priority: High)
Goal: Convert from top bar to slide-out right panel that doesn't block navigation

Changes needed:

Create new ThreadPanel component - Slide-out panel from the right (positioned between ChatPanel and RightPanel)
Modify App.tsx - Add ThreadPanel to layout, ensure it slides over content without pushing RightPanel
Remove/deprecate ThreadContextBar - Move its functionality into ThreadPanel
Update ChatPanel - Remove the top thread context bar
Update store - Add state for panel visibility if needed
Phase 3: Marker Color Fixes (Priority: High)
Goal: Make markers more visible

Changes needed:

types/index.ts - Update categoryColors to use more visible/contrasting colors
MarkerPin.tsx - May need styling adjustments for better visibility
Theme files - Consider if chart colors need adjustment in both themes
Phase 4: Utility Buttons (Priority: Medium)
Goal: Add copy response and jump to previous message buttons

Changes needed:

MessageBubble.tsx - Add floating action buttons on the right side for AI messages:
Copy button (copies full message content)
Jump to previous button (scrolls to previous message)
Position them subtly, maybe only visible on hover
Phase 5: Thread Creation UI (Priority: High)
Goal: Make thread creation state obvious with dedicated UI element

Changes needed:

ChatPanel.tsx input section - Redesign to show:
Animated transition/growth when entering thread creation mode
Non-selectable "Creating thread" label
Truncated display of selected text (separate from input)
Clear visual separation between context and user input
Remove auto-population - Don't put selected text in input field
Add cancel button - Easy way to exit thread creation mode
Questions for you:
Thread Panel Width: How wide should the slide-out thread panel be? (e.g., 400px, 50% of screen?)
Code Block Detection: Should we use simple ``` detection or also support indented code blocks?
Marker Colors: Do you have specific color preferences, or should I choose high-contrast colors that work in both light/dark modes?
Button Placement: For the copy/jump buttons - should they be always visible or appear on hover?
Thread Panel Behavior: When you click a thread in the right sidebar, should it:
Replace the main chat view entirely?
Slide out alongside the main chat?
Open in a modal/overlay?
