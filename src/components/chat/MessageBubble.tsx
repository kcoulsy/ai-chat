import { useState } from 'react';
import { Bot, User, MessageSquare, Copy, ArrowUp, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Message, Thread, Marker, ContentSegment } from '../../types';
import { ThreadBubble } from './ThreadBubble';
import { MarkerPin } from './MarkerPin';
import { useAppStore } from '../../store/useAppStore';
import { useMarkers } from '../../hooks/useMarkers';

interface MessageBubbleProps {
  message: Message;
}

interface CopyButtonProps {
  content: string;
}

interface JumpButtonProps {
  messageId: string;
}

interface CodeCopyButtonProps {
  codeContent: string;
}

/**
 * Button to copy message content to clipboard
 */
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
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary
      "
      title={copied ? 'Copied!' : 'Copy message'}
      aria-label={copied ? 'Copied to clipboard' : 'Copy message content'}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}

/**
 * Button to jump to the previous message
 */
function JumpButton({ messageId }: JumpButtonProps) {
  const currentChat = useAppStore((state) =>
    state.chats.find((c) => c.id === state.currentChatId)
  );

  // Hide if this is the first message
  const messageIndex = currentChat?.messages.findIndex(
    (m) => m.id === messageId
  );

  if (messageIndex === 0) return null;

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
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary
      "
      title="Jump to previous message"
      aria-label="Jump to previous message"
    >
      <ArrowUp size={14} />
    </button>
  );
}

/**
 * Button to copy code block content to clipboard
 */
function CodeCopyButton({ codeContent }: CodeCopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="
        absolute top-2 right-2
        p-1.5 rounded-md
        bg-muted/80 hover:bg-muted
        text-muted-foreground hover:text-foreground
        transition-colors
        shadow-sm
        opacity-0 group-hover:opacity-100
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary
      "
      title={copied ? 'Copied!' : 'Copy code'}
      aria-label={copied ? 'Code copied to clipboard' : 'Copy code to clipboard'}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}

/**
 * Parse message content into segments, treating code blocks as single units
 * while keeping regular text as continuous blocks for proper markdown rendering.
 */
function parseContent(content: string): ContentSegment[] {
  const segments: ContentSegment[] = [];
  let currentLine = 0;
  let lastIndex = 0;

  // Find all code blocks (fenced with ```)
  const codeBlockRegex = /```[\s\S]*?```/g;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add text before code block as a continuous segment
    const textBefore = content.slice(lastIndex, match.index);
    if (textBefore) {
      const lineCount = textBefore.split('\n').length;
      segments.push({
        type: 'text',
        content: textBefore,
        lineIndex: currentLine,
        lineCount
      });
      currentLine += lineCount;
    }

    // Add code block as single segment
    const codeContent = match[0];
    const codeLineCount = codeContent.split('\n').length;
    segments.push({
      type: 'code',
      content: codeContent,
      lineIndex: currentLine,
      lineCount: codeLineCount
    });
    currentLine += codeLineCount;

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after last code block
  const remaining = content.slice(lastIndex);
  if (remaining) {
    const lineCount = remaining.split('\n').length;
    segments.push({
      type: 'text',
      content: remaining,
      lineIndex: currentLine,
      lineCount
    });
  }

  return segments;
}

/**
 * Extract code content (remove backticks and language specifier)
 */
function extractCodeContent(codeBlock: string): string {
  // Remove opening ``` with optional language
  let content = codeBlock.replace(/^```\w*\n?/, '');
  // Remove closing ```
  content = content.replace(/```$/, '');
  return content;
}

/**
 * Find which line within a text segment contains the target line index
 * Returns the relative line position (0-indexed within the segment)
 */
function findLineInSegment(segment: ContentSegment, targetLineIndex: number): number {
  if (targetLineIndex < segment.lineIndex) return -1;
  const relativeIndex = targetLineIndex - segment.lineIndex;
  if (relativeIndex >= (segment.lineCount || 1)) return -1;
  return relativeIndex;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const allThreads = useAppStore((state) => state.threads);
  const setCurrentThread = useAppStore((state) => state.setCurrentThread);
  const threads = allThreads.filter((t: Thread) => t.parentMessageId === message.id);
  const { getMarkersForMessage, removeMarker } = useMarkers();
  const messageMarkers = getMarkersForMessage(message.id);
  const [showActions, setShowActions] = useState(false);

  // Detect touch device for mobile fallback
  const isTouchDevice = typeof window !== 'undefined' && 'ontouchstart' in window;

  // Find the thread this message belongs to (if it's a thread response)
  const parentThread = message.threadId
    ? allThreads.find((t: Thread) => t.id === message.threadId)
    : null;

  const handleViewThread = () => {
    if (message.threadId) {
      setCurrentThread(message.threadId);
    }
  };

  // Parse content into segments (text blocks and code blocks)
  const segments = parseContent(message.content);

  // Group markers by line index
  const markersByLine = messageMarkers.reduce((acc, marker) => {
    const lineIdx = marker.lineIndex || 0;
    if (!acc[lineIdx]) acc[lineIdx] = [];
    acc[lineIdx].push(marker);
    return acc;
  }, {} as Record<number, Marker[]>);

  // Group threads by line index
  const threadsByLine = threads.reduce((acc, thread) => {
    const lineIdx = thread.lineIndex || 0;
    if (!acc[lineIdx]) acc[lineIdx] = [];
    acc[lineIdx].push(thread);
    return acc;
  }, {} as Record<number, Thread[]>);

  // Handle marker click - scroll to the specific line
  const handleMarkerClick = (marker: Marker) => {
    const lineEl = document.querySelector(`[data-message-id="${marker.messageId}"] [data-line-index="${marker.lineIndex}"]`);
    if (lineEl) {
      lineEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div
      data-message-id={message.id}
      data-role={message.role}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? 'bg-primary' : 'bg-muted'
        }`}
      >
        {isUser ? <User size={16} className="text-primary-foreground" /> : <Bot size={16} className="text-muted-foreground" />}
      </div>

      <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : ''} relative`}>
        <div
          className={`inline-block px-4 py-2 rounded-lg text-left ${
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground'
          }`}
        >
          <div className={`prose prose-sm max-w-none ${isUser ? 'prose-invert' : 'dark:prose-invert'}`}>
            {/* Render content segments (text blocks or code blocks) */}
            <div className="relative">
              {segments.map((segment, idx) => {
                // Collect all markers and threads that fall within this segment's line range
                const segmentMarkers: Marker[] = [];
                const segmentThreads: Thread[] = [];

                if (segment.lineCount) {
                  for (let i = 0; i < segment.lineCount; i++) {
                    const lineIdx = segment.lineIndex + i;
                    if (markersByLine[lineIdx]) {
                      segmentMarkers.push(...markersByLine[lineIdx]);
                    }
                    if (threadsByLine[lineIdx]) {
                      segmentThreads.push(...threadsByLine[lineIdx]);
                    }
                  }
                }

                return segment.type === 'code' ? (
                  <div
                    key={idx}
                    data-line-index={segment.lineIndex}
                    className="code-block-wrapper relative group"
                  >
                    {/* Marker pins and Thread pills on the left side */}
                    {!isUser && (segmentMarkers.length > 0 || segmentThreads.length > 0) && (
                      <div className="absolute -left-6 top-0 flex flex-col gap-0.5">
                        {/* Markers */}
                        {segmentMarkers.map((marker) => (
                          <MarkerPin
                            key={marker.id}
                            marker={marker}
                            onClick={() => handleMarkerClick(marker)}
                            onRemove={() => removeMarker(marker.id)}
                          />
                        ))}
                        {/* Thread pills */}
                        {segmentThreads.map((thread) => (
                          <ThreadBubble key={thread.id} thread={thread} />
                        ))}
                      </div>
                    )}
                    {/* Copy button for code block */}
                    <CodeCopyButton codeContent={extractCodeContent(segment.content)} />
                    <pre className="bg-muted-foreground/10 p-3 rounded overflow-x-auto m-0 text-left pr-10">
                      <code className="text-sm font-mono whitespace-pre">
                        {extractCodeContent(segment.content)}
                      </code>
                    </pre>
                  </div>
                ) : (
                  <div key={idx} data-line-index={segment.lineIndex} className="relative text-left">
                    {/* Marker pins and Thread pills on the left side */}
                    {!isUser && (segmentMarkers.length > 0 || segmentThreads.length > 0) && (
                      <div className="absolute -left-6 top-0 flex flex-col gap-0.5">
                        {/* Markers */}
                        {segmentMarkers.map((marker) => (
                          <MarkerPin
                            key={marker.id}
                            marker={marker}
                            onClick={() => handleMarkerClick(marker)}
                            onRemove={() => removeMarker(marker.id)}
                          />
                        ))}
                        {/* Thread pills */}
                        {segmentThreads.map((thread) => (
                          <ThreadBubble key={thread.id} thread={thread} />
                        ))}
                      </div>
                    )}
                    {/* Text content rendered as markdown */}
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {segment.content}
                    </ReactMarkdown>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Thread response indicator with link back to thread */}
        {message.threadId && parentThread && (
          <div className="mt-1">
            <button
              onClick={handleViewThread}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <MessageSquare size={12} />
              View thread: "{parentThread.selectedText.slice(0, 30)}{parentThread.selectedText.length > 30 ? '...' : ''}"
            </button>
          </div>
        )}

        {/* Action buttons for AI messages */}
        {!isUser && (
          <div
            className={`
              absolute right-0 bottom-0 translate-x-full
              flex flex-col gap-1 pl-2 pb-1
              transition-opacity duration-200
              ${isTouchDevice || showActions ? 'opacity-100' : 'opacity-0'}
            `}
          >
            <CopyButton content={message.content} />
            <JumpButton messageId={message.id} />
          </div>
        )}
      </div>
    </div>
  );
}
