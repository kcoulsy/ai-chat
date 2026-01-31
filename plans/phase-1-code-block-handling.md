# Phase 1: Code Block Handling

## Overview
Currently, message content is split by newlines which breaks code blocks apart. This phase ensures code blocks are treated as single units for proper rendering and marker positioning.

## Current Behavior
In `MessageBubble.tsx` line 34:
```typescript
const contentLines = message.content.split('\n');
```

This splits everything by newlines, breaking code blocks into separate lines.

## Goal
Treat code blocks (```) as single units instead of splitting them by newlines.

## Technical Design

### 1. Content Parsing Strategy
Create a parser that splits content into segments:
- Regular text lines (split by newlines)
- Code blocks (preserved as single units)

### 2. Data Structure
```typescript
interface ContentSegment {
  type: 'text' | 'code';
  content: string;
  lineIndex: number;  // Starting line index for marker positioning
}
```

### 3. Algorithm
1. Use regex to find code block boundaries: `/```[\s\S]*?```/g`
2. Split non-code content by newlines
3. Assign line indices accounting for code block line counts
4. Render each segment appropriately

### 4. Regex Pattern
```typescript
// Matches code blocks with optional language specifier
const codeBlockRegex = /```[\s\S]*?```/g;
```

### 5. Line Index Calculation
For marker positioning compatibility, we need to track:
- Line index where a code block starts
- Number of lines within the code block

## Files to Modify

### MessageBubble.tsx
**Changes needed:**
1. Replace simple `split('\n')` with smart content parser
2. Create `parseContent()` function that returns `ContentSegment[]`
3. Update render logic to handle both text lines and code blocks
4. Pass correct line indices to markers and threads

**Implementation approach:**
```typescript
function parseContent(content: string): ContentSegment[] {
  const segments: ContentSegment[] = [];
  let currentLine = 0;
  let lastIndex = 0;
  
  // Find all code blocks
  const codeBlockRegex = /```[\s\S]*?```/g;
  let match;
  
  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add text before code block (split by lines)
    const textBefore = content.slice(lastIndex, match.index);
    const lines = textBefore.split('\n');
    lines.forEach((line, idx) => {
      if (idx > 0 || line) {
        segments.push({ type: 'text', content: line, lineIndex: currentLine + idx });
      }
    });
    currentLine += lines.length - 1;
    
    // Add code block as single segment
    const codeContent = match[0];
    const codeLines = codeContent.split('\n').length;
    segments.push({ type: 'code', content: codeContent, lineIndex: currentLine });
    currentLine += codeLines;
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  const remaining = content.slice(lastIndex);
  if (remaining) {
    const lines = remaining.split('\n');
    lines.forEach((line, idx) => {
      segments.push({ type: 'text', content: line, lineIndex: currentLine + idx });
    });
  }
  
  return segments;
}
```

### Render Updates
Update the render to handle segments:
```typescript
{segments.map((segment, idx) => (
  segment.type === 'code' ? (
    <div key={idx} data-line-index={segment.lineIndex} className="code-block-wrapper">
      <pre className="bg-muted p-3 rounded overflow-x-auto">
        <code>{segment.content.replace(/```/g, '').trim()}</code>
      </pre>
    </div>
  ) : (
    <div key={idx} data-line-index={segment.lineIndex} className="relative">
      {/* Markers and threads */}
      {line ? <ReactMarkdown>{line}</ReactMarkdown> : <br />}
    </div>
  )
))}
```

## Considerations

### Backward Compatibility
- Existing markers use `lineIndex` - this approach preserves that
- Code blocks get the starting line index, so markers can still target specific positions

### Edge Cases
1. **Incomplete code blocks**: Handle unclosed ``` markers gracefully
2. **Nested backticks**: Code blocks with ``` inside (rare but possible)
3. **Language specifiers**: Preserve them for syntax highlighting (future enhancement)
4. **Empty code blocks**: Handle `````` edge case

### Future Enhancements
- Syntax highlighting using libraries like `prismjs` or `react-syntax-highlighter`
- Copy code button on code blocks
- Line numbers in code blocks

## Questions to Resolve
1. Should we also support indented code blocks (4 spaces) or only fenced blocks (```)?
2. Do we want to show language identifiers in the UI?
3. Should inline code (`code`) also be preserved or just block code?

## Testing Scenarios
1. Message with code block at start
2. Message with code block in middle
3. Message with multiple code blocks
4. Message with code block at end
5. Message without any code blocks (backward compatibility)
6. Empty code block
7. Code block with only whitespace
