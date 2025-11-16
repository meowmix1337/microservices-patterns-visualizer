# ServiceBox UI Improvements - Implementation Plan

## User Requirements
1. Prevent service boxes from overlapping
2. Show dependencies between services visually
3. Support variable sizing for service boxes
4. Move descriptions to hover tooltips to save space

## Recommended Solution: Hybrid Approach (3 Phases)

### Phase 1: Foundation (Week 1 - Critical Priority)

**1. Tooltips Implementation**
- Library: Radix UI Tooltip (@radix-ui/react-tooltip)
- Rationale: Accessibility-first, unstyled, lightweight (~5KB), TypeScript native
- Move all service descriptions from inline to hover tooltips
- Add metadata support (type, port, dependencies)

**2. Role-Based Sizing**
- Service: 160px (largest - core business logic)
- Cache/Queue: 135px (medium - infrastructure)
- Client: 120px (smallest - entry point)
- Scale icons proportionally

**3. Fix Current Overlaps**
- RequestResponse pattern: Tags Service (80%, 50%) and User Service (80%, 10%) overlap
- Manual position adjustment
- Add overlap detection validation

### Phase 2: Dependency Visualization (Weeks 2-3)

**4. Static Dependency Arrows**
- Create DependencyArrow component (SVG-based)
- Bezier curves for smooth paths
- Line styles: solid (HTTP/sync), dashed (events/async), thick (cache)
- Color-coded by connection type
- Define dependencies per pattern in separate files

**5. Interactive Highlights**
- Hover service → highlight connections, dim unrelated services
- Use ArchitectureContext for hover state management
- Opacity animations: related (100%), unrelated (30%)
- Scale hovered service to 105%

### Phase 3: Grid System (Week 4)

**6. Grid-Based Positioning**
- 12 columns × 8 rows grid system
- 5% margin X, 8% margin Y
- gridToPosition() helper function
- Convert existing percentage positions to grid coordinates
- Development-only visual grid overlay

**7. Development Tools**
- GridOverlay component (dev mode only)
- Unit tests for overlap detection
- positionValidation.ts utility
- CI/CD validation checks

## Component Structure

### New Components to Create
```
src/components/pattern/
├── DependencyArrow/
│   ├── DependencyArrow.tsx
│   ├── DependencyArrow.css
│   └── index.ts
src/components/dev/
├── GridOverlay.tsx
└── GridOverlay.css
src/contexts/
├── ArchitectureContext.tsx
src/utils/
├── positionValidation.ts
src/patterns/AsyncMicroservices/
├── dependencies.ts
src/patterns/RequestResponse/
├── dependencies.ts
```

### Updated Components
- ServiceBox.tsx - Add tooltip support, data-type attribute, hover handling
- ServiceBox.css - Add role-based sizing, responsive styles
- colors.ts - Add grid system functions, GRID_POSITIONS
- All pattern files - Use tooltips, add dependency arrows, use grid positions

## Key Implementation Details

### Tooltip Props
```typescript
interface ServiceBoxProps {
  name: string
  type: ServiceType
  position: Position
  icon: string
  status?: ServiceStatus
  tooltip?: {
    description: string
    metadata?: Array<{ label: string; value: string }>
  }
}
```

### Dependency Definition
```typescript
interface DependencyDefinition {
  from: string
  to: string
  type: 'sync' | 'async' | 'cache'
  label?: string
}
```

### Grid System
```typescript
export function gridToPosition(col: number, row: number): Position {
  const cellWidth = (100 - 2 * GRID_CONFIG.marginX) / GRID_CONFIG.columns
  const cellHeight = (100 - 2 * GRID_CONFIG.marginY) / GRID_CONFIG.rows
  return {
    x: GRID_CONFIG.marginX + (col + 0.5) * cellWidth,
    y: GRID_CONFIG.marginY + (row + 0.5) * cellHeight
  }
}
```

## Visual Design

### Dependency Arrow Types
- **HTTP (sync)**: Solid blue line with arrow head
- **Events (async)**: Dashed orange line with arrow head
- **Cache**: Thick green line with arrow head

### Sizing Hierarchy
- Services appear larger (most important)
- Infrastructure (cache/queue) medium
- Clients appear smallest

### Responsive Breakpoints
- Desktop (>1024px): Full size
- Tablet (768-1024px): Reduced sizes
- Mobile (<768px): Hide dependency arrows, smaller boxes

## Performance Considerations
- Static SVG arrows: minimal rendering cost
- Context updates only on hover state changes
- Memoized components prevent unnecessary re-renders
- Expected: 60fps smooth on all modern browsers

## Theme Compatibility
- Dark Mode: rgba backgrounds, subtle borders
- Neo-Brutalism: solid backgrounds, thick borders, sharp corners

## Success Metrics
- Zero overlapping services in all patterns
- 100% service descriptions in tooltips
- Dependency visualization in all patterns
- <100ms hover interaction latency
- Mobile responsive on screens >375px
- Accessibility score 100/100

## Estimated Timeline
- Phase 1: 5-7 days
- Phase 2: 10-14 days
- Phase 3: 7-10 days
- Total: 22-31 days of focused development

## Files Modified (Approximate)
- 8-10 new component files
- 5-7 updated component files
- 3-4 new utility files
- 2 pattern dependency definition files
- 1 new context file
