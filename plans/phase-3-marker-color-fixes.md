# Phase 3: Marker Color Fixes

## Overview
Current marker colors use chart colors from the theme but may not provide sufficient contrast or visibility. This phase updates marker colors to be more visible and consistent across both themes.

## Current Implementation

### Marker Category Colors
**Location:** `src/types/index.ts` lines 55-60
```typescript
export const categoryColors: Record<MarkerCategory, string> = {
  plot: 'bg-chart-1',
  character: 'bg-chart-2',
  world: 'bg-chart-3',
  note: 'bg-chart-4',
};
```

### Current Theme Colors

**Amethyst Haze Theme:**
- `--chart-1`: oklch(0.6104 0.0767 299.7335) - Purple
- `--chart-2`: oklch(0.7889 0.0802 359.9375) - Red/Pink
- `--chart-3`: oklch(0.7321 0.0749 169.8670) - Teal/Green
- `--chart-4`: oklch(0.8540 0.0882 76.8292) - Orange

**Coffee Theme:**
- `--chart-1`: oklch(0.4341 0.0392 41.9938) - Dark Brown
- `--chart-2`: oklch(0.9200 0.0651 74.3695) - Light Brown
- `--chart-3`: oklch(0.9310 0 0) - Almost White
- `--chart-4`: oklch(0.9367 0.0523 75.5009) - Cream

### MarkerPin Component
**Location:** `src/components/chat/MarkerPin.tsx`
- Uses `categoryColors` for background
- Has `text-primary-foreground` for text color
- Has border and shadow for visibility

## Goal
Make markers more visible with:
1. Higher contrast colors
2. Consistent visibility across light/dark modes
3. Distinct colors for each category
4. Better visual hierarchy

## Technical Design

### 1. Color Strategy

Option A: Use dedicated marker color variables
Option B: Use semantic color classes with high contrast
Option C: Define custom colors in types

**Recommendation: Option B with enhanced classes**

### 2. New Color Mapping

Instead of chart colors, use high-contrast Tailwind classes:

```typescript
export const categoryColors: Record<MarkerCategory, string> = {
  plot: 'bg-blue-500 dark:bg-blue-400',
  character: 'bg-emerald-500 dark:bg-emerald-400', 
  world: 'bg-amber-500 dark:bg-amber-400',
  note: 'bg-rose-500 dark:bg-rose-400',
};
```

Or define in CSS for more control:

```css
/* In theme files */
--marker-plot: oklch(0.6 0.15 250);
--marker-character: oklch(0.6 0.15 150);
--marker-world: oklch(0.6 0.15 85);
--marker-note: oklch(0.6 0.15 25);
```

### 3. Enhanced MarkerPin Styling

**Current styling issues:**
- Small size (w-2 h-2 for dots)
- May blend with background
- Shadow may be too subtle

**Proposed enhancements:**

```typescript
// MarkerPin.tsx updates
<div
  className={`
    group inline-flex items-center gap-1 
    ${categoryColors[marker.category]} 
    text-white font-medium
    rounded-full
    px-2.5 py-1
    text-xs
    cursor-pointer
    hover:brightness-110
    transition-all duration-200
    shadow-md hover:shadow-lg
    ring-2 ring-white/50 dark:ring-black/30
    border-none
  `}
>
```

### 4. RightPanel Marker Dots

**Location:** `RightPanel.tsx` line 126
Current:
```tsx
<div className={`w-2 h-2 rounded-full flex-shrink-0 ${categoryColors[marker.category]}`} />
```

Proposed:
```tsx
<div className={`w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-white dark:ring-background shadow-sm ${categoryColors[marker.category]}`} />
```

### 5. Category Color Definitions

**Recommended colors by category:**

| Category | Light Mode | Dark Mode | Rationale |
|----------|------------|-----------|-----------|
| plot | Blue-500 (#3B82F6) | Blue-400 (#60A5FA) | Trust, story progression |
| character | Emerald-500 (#10B981) | Emerald-400 (#34D399) | Growth, personality |
| world | Amber-500 (#F59E0B) | Amber-400 (#FBBF24) | Setting, environment |
| note | Rose-500 (#F43F5E) | Rose-400 (#FB7185) | Attention, important |

### 6. Alternative: Custom CSS Variables

Add to theme files:

```css
/* amethyst-haze.css and coffee.css */
--marker-plot: #3B82F6;
--marker-character: #10B981;
--marker-world: #F59E0B;
--marker-note: #F43F5E;
```

Update types:
```typescript
export const categoryColors: Record<MarkerCategory, string> = {
  plot: 'bg-[var(--marker-plot)]',
  character: 'bg-[var(--marker-character)]',
  world: 'bg-[var(--marker-world)]',
  note: 'bg-[var(--marker-note)]',
};
```

## Files to Modify

### 1. src/types/index.ts
Update `categoryColors` mapping to use high-contrast colors

### 2. src/components/chat/MarkerPin.tsx
- Enhance styling for better visibility
- Add ring/border for separation from content
- Increase shadow

### 3. src/components/layout/RightPanel.tsx
- Increase marker dot size from w-2/h-2 to w-3/h-3
- Add ring for visibility

### 4. Theme files (optional)
If using CSS variable approach:
- `src/themes/amethyst-haze.css`
- `src/themes/coffee.css`

## Visual Examples

### Before
```
[small purple dot] Plot Point
```

### After
```
[●] Plot Point  <- Larger, brighter, with ring
```

## Testing Checklist

- [ ] Colors visible in light mode
- [ ] Colors visible in dark mode
- [ ] Sufficient contrast ratio (WCAG AA)
- [ ] All four categories distinguishable
- [ ] Works in both themes
- [ ] Hover states visible
- [ ] Selected/highlighted states visible

## Accessibility Considerations

1. **Color contrast**: Ensure 4.5:1 ratio for text
2. **Color blindness**: Use distinct hues (blue, green, orange, red)
3. **Don't rely on color alone**: Icons already present (Bookmark)
4. **Focus states**: Visible focus rings for keyboard navigation
