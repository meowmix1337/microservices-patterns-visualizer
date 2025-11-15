# Code Style and Conventions

## File Organization
- **ES6 Modules**: All files use `import`/`export` syntax
- **Module Type**: Package.json specifies `"type": "module"`
- **File Extensions**: `.jsx` for React components, `.js` for utilities/hooks

## Component Patterns

### Functional Components
- **All functional components** (no class components)
- Use arrow functions or function declarations
- Export default for main component

Example:
```javascript
export default function ComponentName({ prop1, prop2 }) {
  // component logic
  return (...)
}
```

### React.memo
- All components wrapped with `React.memo()` for performance optimization
- Prevents unnecessary re-renders

### Hooks Usage
- Heavy use of built-in hooks: `useState`, `useEffect`, etc.
- Custom hooks in `/src/hooks/` directory
- Hook naming: `use*` prefix (e.g., `useLogs`, `useStepByStep`)

## Naming Conventions

### Components
- **PascalCase** for component files and names: `ServiceBox.jsx`, `PatternSelector.jsx`
- **Props**: camelCase with descriptive names

### Functions
- **camelCase** for functions: `simulateCacheHit`, `speedDelay`
- **Verb-first naming**: Actions start with verbs (set, handle, simulate, etc.)

### State Variables
- **camelCase**: `cacheData`, `queueMessages`, `animationSpeed`
- **Setter functions**: `set*` prefix (e.g., `setCacheData`, `setMessages`)

### Constants
- **UPPER_SNAKE_CASE** for true constants
- Defined in `/src/constants/` directory
- Example: `POSITIONS`, `PATTERN_CATEGORIES`

### CSS
- **kebab-case** for class names: `.pattern-layout`, `.cache-viewer`
- Component-specific CSS files: `ComponentName.css`

## Code Organization

### Import Order
1. React and React-related imports
2. Third-party libraries (Framer Motion)
3. Internal components
4. Hooks
5. Utils
6. Constants
7. Styles (CSS)

### File Structure
```
src/
├── patterns/          # Pattern implementations
├── components/        # Reusable UI components
├── hooks/            # Custom React hooks
├── utils/            # Utility functions
├── constants/        # Application constants
├── contexts/         # React contexts
└── examples/         # Example code/demos
```

## Documentation

### JSDoc Comments
- Functions include JSDoc-style documentation
- Self-documenting code emphasized
- Clear parameter names reduce need for comments

### Code Comments
- Inline comments for complex logic explanations
- Step explanations in scenario objects
- TODO comments for planned features

## Performance Best Practices
- Components wrapped with `React.memo()`
- Unique keys for list rendering (no warnings)
- Optimized re-render behavior
- 60fps target for animations

## Accessibility
- ARIA labels on interactive elements
- Semantic HTML structure
- Keyboard navigation support
- Screen reader friendly

## State Management
- Local component state with `useState`
- Context API for theme management (`ThemeContext`)
- No external state management library (Redux, etc.)

## Styling Approach
- **CSS Modules pattern** (separate CSS files per component)
- **Glassmorphism design** system
- **CSS custom properties** for theming
- **Responsive design** with media queries
