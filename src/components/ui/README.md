# UI Primitive Components

This directory contains reusable UI primitive components that form the design system layer of the application. These components provide consistent styling, behavior, and accessibility across the entire codebase.

## Overview

The UI primitives were created to:
- **Reduce code duplication** - Consolidate 20+ button variations into a single component
- **Ensure consistency** - Maintain uniform styling and animations across the app
- **Improve maintainability** - Centralize UI logic and styling in one place
- **Enhance accessibility** - Built-in ARIA labels and keyboard navigation
- **Support theming** - Works seamlessly with both Dark and Neo-Brutalism themes

## Components

### Button

A versatile button component with multiple variants, sizes, and states.

**Location:** `/src/components/ui/Button/`

**Variants:**
- `primary` - Main call-to-action buttons (gradient background)
- `secondary` - Secondary actions (outlined)
- `success` - Positive actions (green border)
- `warning` - Caution actions (orange border)
- `error` - Destructive actions (red border)
- `info` - Informational actions (blue border)
- `ghost` - Minimal styling for subtle actions

**Sizes:**
- `small` - Compact buttons (6px 12px padding)
- `medium` - Default size (10px 16px padding)
- `large` - Prominent buttons (14px 24px padding)

**Features:**
- Left and right icon support
- Loading state with spinner
- Disabled state
- Full width option
- Consistent Framer Motion animations
- Theme-aware styling (Dark/Brutalism)

**Usage:**
```tsx
import { Button } from '@/components/ui'

// Primary button
<Button variant="primary" onClick={handleClick}>
  Save Changes
</Button>

// Button with icon
<Button variant="success" iconLeft="✅">
  Cache Hit
</Button>

// Loading state
<Button loading disabled>
  Processing...
</Button>

// Full width button
<Button variant="primary" fullWidth>
  Submit
</Button>
```

**Props:**
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'ghost'
  size?: 'small' | 'medium' | 'large'
  iconLeft?: ReactNode
  iconRight?: ReactNode
  fullWidth?: boolean
  loading?: boolean
  children?: ReactNode
  // ...extends ButtonHTMLAttributes
}
```

---

### Badge

A component for displaying labels, tags, and status indicators.

**Location:** `/src/components/ui/Badge/`

**Variants:**
- `success` - Green badge for positive states
- `warning` - Orange badge for warnings
- `error` - Red badge for errors
- `info` - Blue badge for information
- `neutral` - Gray badge for neutral content
- `custom` - Custom colors via props

**Sizes:**
- `small` - Compact badges (3px 8px padding, 11px font)
- `medium` - Default size (4px 10px padding, 12px font)

**Features:**
- Custom color support for variant="custom"
- Theme-aware styling
- Consistent spacing and typography

**Usage:**
```tsx
import { Badge } from '@/components/ui'

// Success badge
<Badge variant="success">Active</Badge>

// Custom colored badge
<Badge variant="custom" backgroundColor="#ff006e" color="#ffffff">
  Custom
</Badge>

// Small neutral badge
<Badge variant="neutral" size="small">
  tag
</Badge>
```

**Props:**
```typescript
interface BadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'custom'
  size?: 'small' | 'medium'
  backgroundColor?: string  // Only used with variant="custom"
  color?: string           // Only used with variant="custom"
  children?: ReactNode
  // ...extends HTMLAttributes<HTMLSpanElement>
}
```

---

### Card

A container component for grouping related content with consistent styling.

**Location:** `/src/components/ui/Card/`

**Variants:**
- `default` - Standard card with border
- `glass` - Glassmorphism effect with backdrop blur
- `elevated` - Card with shadow elevation

**Padding:**
- `none` - No padding
- `small` - 12px padding
- `medium` - 16px padding (default)
- `large` - 24px padding

**Features:**
- Hoverable state with animations
- Selected state with accent border
- Optional Framer Motion animations
- Click handler support
- Theme-aware styling

**Usage:**
```tsx
import { Card } from '@/components/ui'

// Basic card
<Card>
  <h3>Title</h3>
  <p>Content here</p>
</Card>

// Glass effect card with hover
<Card variant="glass" hoverable onClick={handleClick}>
  Interactive content
</Card>

// Selected card with custom padding
<Card selected padding="large">
  Selected item
</Card>

// Animated card
<Card variant="elevated" animated hoverable>
  Will animate on hover
</Card>
```

**Props:**
```typescript
interface CardProps {
  variant?: 'default' | 'glass' | 'elevated'
  padding?: 'none' | 'small' | 'medium' | 'large'
  hoverable?: boolean
  selected?: boolean
  animated?: boolean
  children?: ReactNode
  onClick?: () => void
  // ...extends HTMLAttributes<HTMLDivElement>
}
```

---

### Slider

A range input component for selecting numeric values.

**Location:** `/src/components/ui/Input/Slider.tsx`

**Features:**
- Label with formatted value display
- Min/max/step configuration
- Custom value formatter
- Optional min/max labels below slider
- Theme-aware thumb styling
- Smooth animations on hover/active

**Usage:**
```tsx
import { Slider } from '@/components/ui'

// Basic slider
<Slider
  label="Volume"
  value={volume}
  onChange={(e) => setVolume(parseFloat(e.target.value))}
  min={0}
  max={100}
/>

// Slider with custom formatting and labels
<Slider
  label="Animation Speed"
  value={speed}
  onChange={(e) => setSpeed(parseFloat(e.target.value))}
  min={0.5}
  max={3}
  step={0.25}
  formatValue={(v) => `${v}x`}
  showLabels
  minLabel="0.5x (Slower)"
  maxLabel="3x (Faster)"
/>
```

**Props:**
```typescript
interface SliderProps {
  label?: string
  min?: number
  max?: number
  step?: number
  value: number
  formatValue?: (value: number) => string
  showLabels?: boolean
  minLabel?: string
  maxLabel?: string
  // ...extends InputHTMLAttributes<HTMLInputElement>
}
```

---

### Select

A dropdown select component with icon support.

**Location:** `/src/components/ui/Input/Select.tsx`

**Features:**
- Label support
- Icon support for options (emojis or text)
- TypeScript generics for value types
- Helper text and error messages
- Disabled options
- Custom arrow styling
- Theme-aware styling

**Usage:**
```tsx
import { Select } from '@/components/ui'

// Basic select
<Select
  label="Status"
  value={status}
  onChange={(value) => setStatus(value)}
  options={[
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ]}
/>

// Select with icons and error
<Select
  label="Redis Status"
  value={redisStatus}
  onChange={(value) => setRedisStatus(value)}
  options={[
    { value: 'healthy', label: 'Healthy', icon: '✅' },
    { value: 'down', label: 'Down', icon: '🔴' }
  ]}
  error={validationError}
/>

// Select with helper text
<Select
  label="Environment"
  value={env}
  onChange={setEnv}
  options={envOptions}
  helperText="Select the deployment environment"
/>
```

**Props:**
```typescript
interface SelectOption<T = string> {
  value: T
  label: string
  icon?: string
  disabled?: boolean
}

interface SelectProps<T = string> {
  label?: string
  options: SelectOption<T>[]
  value: T
  onChange: (value: T, event: ChangeEvent<HTMLSelectElement>) => void
  placeholder?: string
  helperText?: string
  error?: string
  // ...extends SelectHTMLAttributes<HTMLSelectElement>
}
```

---

## Import Pattern

All components can be imported from the barrel export:

```tsx
// Import individual components
import { Button, Badge, Card, Slider, Select } from '@/components/ui'

// Import types
import type {
  ButtonProps,
  BadgeProps,
  CardProps,
  SliderProps,
  SelectProps
} from '@/components/ui'
```

Or import directly from the component:

```tsx
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
```

## Theme Support

All components support both themes defined in the application:

### Dark Theme (Default)
- Glassmorphism effects with backdrop blur
- Gradient backgrounds for primary elements
- Soft shadows and animations
- Smooth hover effects with translateY

### Neo-Brutalism Theme
- Bold, solid colors
- Sharp borders (border-radius: 0)
- Box shadow offsets instead of soft shadows
- Transform animations on hover (translate instead of scale)

Components automatically adapt based on the `data-theme` attribute on the root element.

## Accessibility

All components follow accessibility best practices:

- **Semantic HTML** - Proper element usage (button, label, input, etc.)
- **ARIA labels** - All interactive elements have descriptive labels
- **Keyboard navigation** - Full keyboard support for all inputs
- **Focus indicators** - Visible focus states for keyboard users
- **Color contrast** - WCAG compliant color combinations
- **Screen reader support** - Meaningful text for assistive technologies

## Animation

Components use Framer Motion for smooth, consistent animations:

- **Standard hover:** `whileHover={{ scale: 1.02 }}`
- **Standard tap:** `whileTap={{ scale: 0.98 }}`
- **Disabled elements** - No animations when disabled

## Migration Guide

### Migrating from old buttons to Button component

**Before:**
```tsx
<button className="scenario-btn success" onClick={handleClick}>
  ✅ Cache Hit
  <span className="scenario-desc">Fast path (~1ms)</span>
</button>
```

**After:**
```tsx
<Button variant="success" onClick={handleClick}>
  <span className="scenario-btn-content">
    <span className="scenario-btn-label">✅ Cache Hit</span>
    <span className="scenario-desc">Fast path (~1ms)</span>
  </span>
</Button>
```

### Migrating from inline badge styles to Badge component

**Before:**
```tsx
<span
  className="difficulty-badge"
  style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}
>
  Beginner
</span>
```

**After:**
```tsx
<Badge variant="success" size="small">
  Beginner
</Badge>
```

### Migrating from .panel class to Card component

**Before:**
```tsx
<div className="panel">
  <h3>Title</h3>
  <p>Content</p>
</div>
```

**After:**
```tsx
<Card variant="glass">
  <h3>Title</h3>
  <p>Content</p>
</Card>
```

## Updated Components

The following components have been updated to use the new UI primitives:

### ControlPanel
- **Buttons:** 4 scenario buttons now use `Button` component with variants
- **Slider:** Kafka lag slider uses `Slider` component
- **Select:** Redis status select uses `Select` component with icons
- **Animation Speed:** Slider with labels and custom formatting

### PatternSelector
- **Difficulty badges:** Uses `Badge` component with success/warning/error variants
- **Tag badges:** Uses `Badge` component with neutral variant

## Next Steps

Future components that can benefit from these primitives:

### High Priority
1. **StepByStepControls** - 4 control buttons (Play, Pause, Next, Restart)
2. **InfoTabs** - 3 tab buttons
3. **CommandPalette** - Close button
4. **PatternInfoModal** - Close button
5. **Sidebar** - Minimize button

### Medium Priority
6. **CacheViewer** - Update to use `Card` component
7. **QueueViewer** - Update to use `Card` component
8. **Logs** - Update to use `Card` component
9. **ServiceBox** - Status badge could use `Badge` component

### Future Enhancements
- **Toggle/Switch** component
- **Checkbox** component
- **Radio** component
- **Tooltip** component
- **Modal** component base
- **IconButton** variant

## File Structure

```
src/components/ui/
├── Button/
│   ├── Button.tsx
│   ├── Button.css
│   └── index.ts
├── Badge/
│   ├── Badge.tsx
│   ├── Badge.css
│   └── index.ts
├── Card/
│   ├── Card.tsx
│   ├── Card.css
│   └── index.ts
├── Input/
│   ├── Slider.tsx
│   ├── Slider.css
│   ├── Select.tsx
│   ├── Select.css
│   └── index.ts
├── index.ts (barrel export)
└── README.md (this file)
```

## Design Tokens

All components use CSS variables defined in `/src/index.css`:

```css
/* Colors */
--bg-primary
--bg-secondary
--bg-tertiary
--border-color
--text-primary
--text-secondary
--accent-primary
--accent-secondary
--success-color
--warning-color
--error-color

/* Spacing */
--border-width
--border-radius
--border-radius-sm

/* Effects */
--shadow
--shadow-lg
```

## Testing

All components have been tested:
- ✅ TypeScript compilation
- ✅ Build process (npm run build)
- ✅ Theme switching (Dark/Brutalism)
- ✅ Component integration (ControlPanel, PatternSelector)

---

**Created:** 2025-11-15
**Last Updated:** 2025-11-15
**Version:** 1.0.0
