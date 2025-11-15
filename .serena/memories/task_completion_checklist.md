# Task Completion Checklist

When completing a coding task in this project, follow these steps:

## 1. Code Quality Checks

### Performance
- [ ] All new components wrapped with `React.memo()` if appropriate
- [ ] List items have unique, stable keys (not array index)
- [ ] No unnecessary re-renders (check with React DevTools)
- [ ] Animations target 60fps performance

### Accessibility
- [ ] Interactive elements have ARIA labels
- [ ] Semantic HTML used appropriately
- [ ] Keyboard navigation works
- [ ] Color contrast meets standards

### React Best Practices
- [ ] Functional components only (no class components)
- [ ] Proper hook usage (no hooks in conditionals/loops)
- [ ] Clean up effects (return cleanup functions)
- [ ] PropTypes or TypeScript types (when available)

## 2. Code Style Compliance

- [ ] **Naming conventions** followed:
  - PascalCase for components
  - camelCase for functions/variables
  - UPPER_SNAKE_CASE for constants
  - kebab-case for CSS classes

- [ ] **Import order** maintained:
  1. React imports
  2. Third-party libraries
  3. Internal components
  4. Hooks
  5. Utils/Constants
  6. Styles

- [ ] **File organization** correct:
  - Components in `/src/components/`
  - Patterns in `/src/patterns/`
  - Hooks in `/src/hooks/`
  - Utils in `/src/utils/`
  - Constants in `/src/constants/`

## 3. Build & Run Tests

### Build Check
```bash
npm run build
```
- [ ] Build succeeds without errors
- [ ] No warnings in build output
- [ ] dist/ folder created successfully

### Development Server Check
```bash
npm run dev
```
- [ ] Dev server starts successfully
- [ ] No console errors in browser
- [ ] No console warnings in browser
- [ ] Features work as expected

### Preview Production Build
```bash
npm run preview
```
- [ ] Production build serves correctly
- [ ] All features work in production mode

## 4. Manual Testing

- [ ] Test in Chrome/Edge
- [ ] Test in Firefox (if major UI change)
- [ ] Test responsive design (mobile/tablet/desktop)
- [ ] Test all interactive scenarios
- [ ] Test animation smoothness at different speeds
- [ ] Test error states and edge cases
- [ ] Check browser console for errors/warnings

## 5. Code Review

- [ ] Self-review code changes
- [ ] Remove console.log() debug statements
- [ ] Remove commented-out code
- [ ] Ensure comments are accurate and helpful
- [ ] Check for TODO comments (address or track)

## 6. Documentation

- [ ] Update README.md if feature affects usage
- [ ] Update comments/JSDoc for new functions
- [ ] Update pattern registry if adding new pattern
- [ ] Add inline comments for complex logic

## 7. Git Workflow

- [ ] Commit messages are descriptive
- [ ] Commits are atomic (one logical change)
- [ ] Branch name is descriptive
- [ ] No sensitive data in commits

## 8. Performance Validation

- [ ] Check React DevTools Profiler for render performance
- [ ] Verify animations are smooth (60fps)
- [ ] Check bundle size (if concerned)
- [ ] Test with slow network (if applicable)

## Notes

### Currently NOT Required (but planned for future)
- ❌ Running unit tests (no test framework yet)
- ❌ Running linter (no ESLint config)
- ❌ Running formatter (no Prettier config)
- ❌ TypeScript type checking (not yet migrated)

### Future Improvements (v3.0)
- Add automated testing (Jest, React Testing Library)
- Add E2E tests (Playwright)
- Set up ESLint and Prettier
- Migrate to TypeScript
