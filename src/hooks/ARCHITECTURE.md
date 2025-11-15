# Step-by-Step System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Your Pattern Component                       │
│  (e.g., AsyncMicroservicesPattern.jsx)                          │
│                                                                   │
│  State:                                                           │
│  ├─ messages, logs, cacheData (visualization state)             │
│  └─ animationSpeed (user preference)                             │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              useStepByStep Hook                             │ │
│  │                                                              │ │
│  │  State Management:                                          │ │
│  │  ├─ currentStep (1-indexed)                                 │ │
│  │  ├─ steps[] (scenario definition)                           │ │
│  │  ├─ isAutoPlaying (play/pause)                              │ │
│  │  ├─ isRunning (scenario active)                             │ │
│  │  └─ scenarioName (current scenario)                         │ │
│  │                                                              │ │
│  │  Core Functions:                                            │ │
│  │  ├─ executeStep() - Run step action safely                 │ │
│  │  ├─ goToNextStep() - Advance + execute                     │ │
│  │  ├─ goToPreviousStep() - Go back (no re-exec)              │ │
│  │  ├─ toggleAutoPlay() - Play/pause control                  │ │
│  │  └─ loadScenario() - Initialize new scenario               │ │
│  │                                                              │ │
│  │  Effects:                                                    │ │
│  │  ├─ Auto-play timer (respects duration + speed)            │ │
│  │  ├─ Keyboard shortcuts (→, ←, Space)                        │ │
│  │  └─ Cleanup on unmount                                      │ │
│  │                                                              │ │
│  │  Returns: stepControl object                                │ │
│  └────────────────────────────────────────────────────────────┘ │
│                            ↓                                     │
│  Usage:                                                          │
│  stepControl.loadScenario('Demo', steps)                        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   Scenario Definition Layer                      │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              scenarioHelpers.js                             │ │
│  │                                                              │ │
│  │  createStep()                                               │ │
│  │  ├─ Validates step structure                                │ │
│  │  ├─ Applies defaults (duration: 1500)                       │ │
│  │  └─ Returns: { explanation, action, duration, metadata }   │ │
│  │                                                              │ │
│  │  createScenario()                                           │ │
│  │  ├─ Bundles steps with metadata                             │ │
│  │  └─ Returns: { name, description, steps, metadata }        │ │
│  │                                                              │ │
│  │  createStepBuilder(context)                                 │ │
│  │  ├─ requestStep()        → HTTP request pattern            │ │
│  │  ├─ responseStep()       → HTTP response pattern           │ │
│  │  ├─ cacheCheckStep()     → Cache lookup pattern            │ │
│  │  ├─ cacheHitStep()       → Cache hit response              │ │
│  │  ├─ cacheMissStep()      → Cache miss response             │ │
│  │  ├─ publishEventStep()   → Event publishing                │ │
│  │  ├─ cleanupStep()        → Cleanup actions                 │ │
│  │  └─ customStep()         → Custom logic                     │ │
│  │                                                              │ │
│  │  createSpeedDelay(speed)                                    │ │
│  │  └─ Returns delay function respecting animation speed       │ │
│  │                                                              │ │
│  │  validateScenario(scenario)                                 │ │
│  │  └─ Returns: { valid: boolean, errors: string[] }          │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    UI Layer (Rendering)                          │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │          StepByStepControls Component                       │ │
│  │                                                              │ │
│  │  Props:                                                      │ │
│  │  ├─ currentStep (from stepControl)                          │ │
│  │  ├─ totalSteps (from stepControl)                           │ │
│  │  ├─ stepExplanation (from stepControl)                      │ │
│  │  ├─ onNext (stepControl.goToNextStep)                       │ │
│  │  ├─ onPrevious (stepControl.goToPreviousStep)               │ │
│  │  ├─ onToggleAutoPlay (stepControl.toggleAutoPlay)           │ │
│  │  ├─ isAutoPlaying (from stepControl)                        │ │
│  │  └─ isRunning (from stepControl)                            │ │
│  │                                                              │ │
│  │  Renders:                                                    │ │
│  │  ├─ Step counter: "Step X of Y"                             │ │
│  │  ├─ Explanation text (current step)                         │ │
│  │  ├─ ← Prev button (disabled at start)                       │ │
│  │  ├─ ▶ Play / ⏸ Pause button (toggle)                        │ │
│  │  └─ Next → button (disabled at end)                         │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Scenario Definition Phase

```
Developer writes scenario
         ↓
Uses createStep() / builders
         ↓
Assembles into steps array
         ↓
Optionally wraps in createScenario()
         ↓
Ready for execution
```

### 2. Scenario Execution Phase

```
User clicks button
         ↓
Component calls stepControl.loadScenario(name, steps)
         ↓
Hook resets state, sets up scenario
         ↓
Hook sets currentStep = 1, isRunning = true
         ↓
Hook executes steps[0].action()
         ↓
UI updates (StepByStepControls shows step 1)
```

### 3. Step Navigation (Manual)

```
User clicks "Next" button
         ↓
Calls stepControl.goToNextStep()
         ↓
Hook increments currentStep
         ↓
Hook executes steps[currentStep - 1].action()
         ↓
onStepChange callback fires
         ↓
UI updates with new explanation
```

### 4. Step Navigation (Auto-Play)

```
User clicks "Play" button
         ↓
Calls stepControl.toggleAutoPlay()
         ↓
Hook sets isAutoPlaying = true
         ↓
useEffect detects change
         ↓
Sets timeout for steps[currentStep - 1].duration
         ↓
After duration, calls goToNextStep()
         ↓
Repeats until end of scenario
```

### 5. Keyboard Shortcuts

```
User presses → key
         ↓
useEffect keyboard handler detects
         ↓
Calls goToNextStep()
         ↓
Same flow as manual navigation
```

## State Management

### Hook Internal State

```javascript
{
  currentStep: 0,           // Which step (0 = not started)
  steps: [],                // Array of step definitions
  isAutoPlaying: false,     // Auto-advance enabled?
  isRunning: false,         // Scenario active?
  scenarioName: '',         // Current scenario name
  autoPlayTimer: ref,       // Timeout reference (cleanup)
  isExecutingStep: ref      // Prevent concurrent execution
}
```

### Component State (Your Component)

```javascript
{
  messages: [],             // Visual message flows
  cacheData: {},            // Cache state
  queueMessages: [],        // Queue state
  logs: [],                 // Event logs
  // ... other visualization state
}
```

State is cleanly separated:
- Hook manages **step orchestration**
- Component manages **visualization data**

## Step Execution Lifecycle

```
1. loadScenario(name, steps)
   ├─ Clear existing timers
   ├─ Reset state
   ├─ Fire onScenarioStart(name)
   ├─ Set currentStep = 1, isRunning = true
   └─ Execute steps[0].action()

2. Step executes
   ├─ Check: not already executing? (prevent concurrent)
   ├─ Set isExecutingStep.current = true
   ├─ Try: await step.action()
   ├─ Catch: log error but continue
   ├─ Finally: set isExecutingStep.current = false
   └─ Fire onStepChange(stepNum, step)

3. Auto-play timer fires
   ├─ Wait: steps[currentStep - 1].duration / animationSpeed
   ├─ Call: goToNextStep()
   └─ Repeat: until currentStep === totalSteps

4. Manual navigation
   ├─ goToNextStep(): advance + execute
   ├─ goToPreviousStep(): go back (no execute)
   └─ goToStep(n): jump to specific step

5. Scenario completes
   ├─ currentStep === totalSteps
   ├─ Fire onScenarioComplete()
   └─ Auto-play stops

6. Cleanup (on unmount or new scenario)
   ├─ Clear autoPlayTimer
   ├─ Reset isExecutingStep
   └─ Prevent memory leaks
```

## Error Handling

```
Step action throws error
         ↓
Caught in executeStep() try/catch
         ↓
Error logged to console
         ↓
Scenario continues (doesn't stop)
         ↓
Developer can add custom error handling in action
```

## Performance Optimizations

### 1. useCallback for Functions
- Prevents re-creation on every render
- Stable references for child components

### 2. Refs for Non-Render State
- `autoPlayTimer` doesn't cause re-renders
- `isExecutingStep` flag avoids race conditions

### 3. Cleanup on Dependencies
- Effects return cleanup functions
- Prevents memory leaks from timers

### 4. Minimal Re-Renders
- Only update state when needed
- Computed properties don't trigger re-renders

## Extension Points

### 1. Callbacks

```javascript
useStepByStep({
  onScenarioStart: (name) => {
    // Analytics, logging, state reset
  },
  onScenarioComplete: () => {
    // Show success message, metrics
  },
  onStepChange: (stepNum, step) => {
    // Update progress bar, analytics
  }
})
```

### 2. Metadata

```javascript
createStep({
  explanation: '...',
  action: async () => {},
  metadata: {
    category: 'database',
    importance: 'high',
    analytics: { trackAs: 'db-query' }
  }
})
```

### 3. Custom Builders

```javascript
const builder = createStepBuilder(context)

// Add your own pattern
builder.myCustomPattern = ({ params }) => createStep({
  explanation: `Custom: ${params}`,
  action: async () => {
    // Your custom logic
  }
})
```

## Testing Strategy

### Unit Tests
- Test hook in isolation with React Testing Library
- Mock timers with jest.useFakeTimers()
- Test all navigation functions
- Test auto-play behavior
- Test keyboard shortcuts

### Integration Tests
- Test hook + component together
- Verify UI updates correctly
- Test scenario execution end-to-end

### Example Test

```javascript
import { renderHook, act } from '@testing-library/react'
import { useStepByStep } from './useStepByStep'

test('advances to next step', async () => {
  const { result } = renderHook(() => useStepByStep())

  const steps = [
    { explanation: 'Step 1', action: jest.fn() },
    { explanation: 'Step 2', action: jest.fn() }
  ]

  await act(async () => {
    await result.current.loadScenario('Test', steps)
  })

  expect(result.current.currentStep).toBe(1)

  await act(async () => {
    await result.current.goToNextStep()
  })

  expect(result.current.currentStep).toBe(2)
  expect(steps[1].action).toHaveBeenCalled()
})
```

## Design Principles

### 1. Separation of Concerns
- Hook: orchestration logic
- Helpers: scenario definition
- Component: visualization
- Controls: user interaction

### 2. Single Responsibility
- Each function does one thing well
- Easy to understand and maintain

### 3. Composition Over Inheritance
- Build complex scenarios from simple steps
- Combine helpers for powerful patterns

### 4. Progressive Enhancement
- Start simple (manual steps)
- Add auto-play when ready
- Use builders for advanced cases

### 5. Developer Experience
- Clear, self-documenting code
- Helpful error messages
- TypeScript definitions
- Comprehensive examples

## Future Considerations

### Possible Enhancements

1. **Step Branching**
   ```javascript
   {
     explanation: 'Check condition',
     action: async () => {},
     nextStep: (result) => result ? 3 : 5
   }
   ```

2. **Parallel Steps**
   ```javascript
   {
     explanation: 'Multiple services',
     actions: [action1, action2, action3],
     waitFor: 'all' // or 'any', 'race'
   }
   ```

3. **Step History**
   ```javascript
   stepControl.history // Array of executed steps
   stepControl.undo()  // Go back and re-execute
   ```

4. **Performance Metrics**
   ```javascript
   stepControl.metrics // { totalTime, stepTimes, slowest }
   ```

5. **Visual Timeline**
   - Show all steps with progress
   - Click to jump to specific step
   - Visualize duration proportionally

---

This architecture provides a solid foundation that's:
- Easy to understand
- Simple to extend
- Performant at scale
- Developer-friendly
