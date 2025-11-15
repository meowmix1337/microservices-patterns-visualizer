# Step-by-Step Execution System

A comprehensive, reusable system for creating interactive, step-by-step scenario visualizations with auto-play, keyboard shortcuts, and manual navigation.

## Overview

This system consists of:

1. **`useStepByStep`** - Core React hook for step execution logic
2. **`scenarioHelpers`** - Utility functions for defining scenarios
3. **`StepByStepControls`** - UI component for step navigation

## Quick Start

### Basic Usage

```jsx
import { useStepByStep } from '../hooks/useStepByStep'

function MyComponent({ animationSpeed }) {
  const stepControl = useStepByStep({ animationSpeed })

  const runScenario = () => {
    const steps = [
      {
        explanation: 'First step happens',
        duration: 2000,
        action: async () => {
          console.log('Executing step 1')
        }
      },
      {
        explanation: 'Second step happens',
        duration: 2000,
        action: async () => {
          console.log('Executing step 2')
        }
      }
    ]

    stepControl.loadScenario('My First Scenario', steps)
  }

  return (
    <div>
      <button onClick={runScenario}>Start</button>

      <StepByStepControls
        currentStep={stepControl.currentStep}
        totalSteps={stepControl.totalSteps}
        stepExplanation={stepControl.stepExplanation}
        onNext={stepControl.goToNextStep}
        onPrevious={stepControl.goToPreviousStep}
        onToggleAutoPlay={stepControl.toggleAutoPlay}
        isAutoPlaying={stepControl.isAutoPlaying}
        isRunning={stepControl.isRunning}
      />
    </div>
  )
}
```

## API Reference

### `useStepByStep(options)`

Main hook for step-by-step execution.

#### Options

```js
{
  animationSpeed: 1,           // Speed multiplier (2 = 2x faster)
  onScenarioStart: (name) => {}, // Called when scenario starts
  onScenarioComplete: () => {},  // Called when scenario ends
  onStepChange: (num, step) => {} // Called on each step
}
```

#### Returns

```js
{
  // State
  currentStep,      // Current step number (1-indexed)
  totalSteps,       // Total number of steps
  steps,            // Array of all steps
  isAutoPlaying,    // Auto-play enabled?
  isRunning,        // Scenario running?
  scenarioName,     // Name of current scenario

  // Current step info
  currentStepData,  // Current step object
  stepExplanation,  // Current explanation text

  // Navigation
  goToNextStep,     // Advance to next step
  goToPreviousStep, // Go back one step
  goToStep,         // Jump to specific step

  // Playback
  toggleAutoPlay,   // Toggle auto-play
  startAutoPlay,    // Start auto-play
  pauseAutoPlay,    // Pause auto-play

  // Scenario management
  loadScenario,     // Load new scenario
  stopScenario,     // Stop current scenario
  resetScenario,    // Reset to beginning

  // Computed
  canGoNext,        // Can advance?
  canGoPrevious,    // Can go back?
  isComplete,       // All steps done?
  progress          // Progress % (0-100)
}
```

### Scenario Helpers

#### `createStep({ explanation, action, duration, metadata })`

Creates a validated step object.

```js
const step = createStep({
  explanation: 'User sends request',
  duration: 2000, // Optional, default: 1500
  action: async () => {
    // Your step logic here
    await doSomething()
  },
  metadata: { category: 'request' } // Optional
})
```

#### `createScenario({ name, description, steps, metadata })`

Creates a scenario with multiple steps.

```js
const scenario = createScenario({
  name: 'Cache Hit Demo',
  description: 'Shows fast path with cache',
  steps: [
    createStep({ ... }),
    createStep({ ... })
  ]
})

// Then load it
stepControl.loadScenario(scenario.name, scenario.steps)
```

#### `createStepBuilder(context)`

Creates a builder with helper methods for common patterns.

```js
const builder = createStepBuilder({
  addLog,        // Your log function
  setMessages,   // Your message setter
  delay,         // Your delay function
  positions      // Position constants
})

// Use builder methods
const steps = [
  builder.requestStep({
    from: 'client',
    to: 'server',
    label: 'GET /api',
    explanation: 'Client sends request'
  }),

  builder.responseStep({
    from: 'server',
    to: 'client',
    label: '200 OK',
    explanation: 'Server responds',
    logMessage: 'Success!'
  }),

  builder.cleanupStep({
    explanation: 'Cleanup'
  })
]
```

##### Available Builder Methods

- `requestStep()` - HTTP request
- `responseStep()` - HTTP response
- `cacheCheckStep()` - Cache lookup
- `cacheHitStep()` - Cache hit response
- `cacheMissStep()` - Cache miss response
- `publishEventStep()` - Event publishing
- `cleanupStep()` - Cleanup actions
- `customStep()` - Custom step (alias for `createStep`)

#### `createSpeedDelay(animationSpeed)`

Creates a delay function that respects animation speed.

```js
const speedDelay = createSpeedDelay(animationSpeed)
await speedDelay(1000) // 1000ms at 1x, 500ms at 2x
```

## Keyboard Shortcuts

When a scenario is running:

- **→** (Right Arrow) - Next step
- **←** (Left Arrow) - Previous step
- **Space** - Toggle auto-play

## Common Patterns

### Pattern 1: Simple Scenario

```js
const runSimpleScenario = () => {
  const steps = [
    {
      explanation: 'Step 1',
      action: async () => { /* do something */ }
    },
    {
      explanation: 'Step 2',
      action: async () => { /* do something */ }
    }
  ]

  stepControl.loadScenario('Simple Demo', steps)
}
```

### Pattern 2: With Callbacks

```js
const stepControl = useStepByStep({
  animationSpeed,
  onScenarioStart: (name) => {
    clearLogs()
    addLog(`Starting: ${name}`)
  },
  onScenarioComplete: () => {
    addLog('Scenario complete!')
  },
  onStepChange: (stepNum, step) => {
    console.log(`Now on step ${stepNum}`)
  }
})
```

### Pattern 3: With Auto-Play

```js
stepControl.loadScenario('Auto Demo', steps, {
  autoStart: true,  // Start immediately
  autoPlay: true    // Auto-play through steps
})
```

### Pattern 4: Using Builders

```js
const builder = createStepBuilder({
  addLog,
  setMessages,
  delay: speedDelay,
  positions: POSITIONS
})

const scenario = createScenario({
  name: 'Request Flow',
  steps: [
    builder.requestStep({
      from: 'client',
      to: 'server',
      label: 'GET /api',
      explanation: 'Client sends request'
    }),
    builder.responseStep({
      from: 'server',
      to: 'client',
      label: '200 OK',
      explanation: 'Server responds'
    })
  ]
})

stepControl.loadScenario(scenario.name, scenario.steps)
```

### Pattern 5: Manual Step Control

```js
// Jump to specific step
stepControl.goToStep(3)

// Reset to beginning
stepControl.resetScenario()

// Stop completely
stepControl.stopScenario()
```

## Advanced Usage

### Custom Step Duration Per Step

```js
const steps = [
  {
    explanation: 'Quick step',
    duration: 1000, // 1 second
    action: async () => { /* ... */ }
  },
  {
    explanation: 'Slow step',
    duration: 5000, // 5 seconds
    action: async () => { /* ... */ }
  }
]
```

### Conditional Steps Based on State

```js
const createStepsForScenario = () => {
  const steps = [
    {
      explanation: 'Check cache',
      action: async () => {
        const cached = await checkCache()
        if (!cached) {
          // Add additional steps dynamically
          steps.push({
            explanation: 'Cache miss - fetch from DB',
            action: async () => { /* ... */ }
          })
        }
      }
    }
  ]
  return steps
}
```

### Progress Tracking

```js
const { progress, currentStep, totalSteps } = stepControl

// Show progress bar
<div style={{ width: `${progress}%` }} />

// Show step counter
<span>{currentStep} / {totalSteps}</span>
```

### Error Handling in Steps

```js
{
  explanation: 'Risky operation',
  action: async () => {
    try {
      await riskyOperation()
    } catch (error) {
      addLog('Error occurred', 'error')
      // Step will continue, error is logged
    }
  }
}
```

## Best Practices

### 1. Keep Steps Focused

Each step should do ONE thing:

```js
// Good
{ explanation: 'Send request', action: async () => sendRequest() }
{ explanation: 'Receive response', action: async () => handleResponse() }

// Bad
{ explanation: 'Send request and handle response', action: async () => {
  sendRequest()
  handleResponse()
}}
```

### 2. Use Meaningful Explanations

```js
// Good
"Client sends GET /users request to API Gateway"

// Bad
"Step 1"
```

### 3. Respect Animation Speed

Always use the speed-aware delay:

```js
const speedDelay = createSpeedDelay(animationSpeed)
await speedDelay(1000) // Respects speed setting
```

### 4. Clean Up After Scenarios

```js
const startScenario = () => {
  // Reset state first
  clearLogs()
  setMessages([])
  setErrors([])

  // Then load scenario
  stepControl.loadScenario(name, steps)
}
```

### 5. Use Builders for Common Patterns

```js
// Instead of writing boilerplate repeatedly
const builder = createStepBuilder(context)

// Reuse patterns
builder.requestStep({ ... })
builder.responseStep({ ... })
```

### 6. Validate Scenarios During Development

```js
import { validateScenario } from '../utils/scenarioHelpers'

const scenario = createScenario({ ... })
const result = validateScenario(scenario)

if (!result.valid) {
  console.error('Invalid scenario:', result.errors)
}
```

## Migration Guide

### Converting Existing Code

Before:
```js
// Old manual step management
const [currentStep, setCurrentStep] = useState(0)
const [steps, setSteps] = useState([])
const [isAutoPlaying, setIsAutoPlaying] = useState(false)
// ... lots of effect hooks and functions
```

After:
```js
// New hook-based approach
const stepControl = useStepByStep({ animationSpeed })

// Just define steps and load
stepControl.loadScenario('My Scenario', steps)
```

### Converting Step Arrays

Before:
```js
const steps = [
  {
    explanation: 'Something happens',
    duration: 2000,
    action: async () => { /* ... */ }
  }
]

setSteps(steps)
setCurrentStep(1)
executeStep(steps[0])
```

After:
```js
const steps = [
  {
    explanation: 'Something happens',
    duration: 2000,
    action: async () => { /* ... */ }
  }
]

stepControl.loadScenario('Scenario Name', steps)
```

## Troubleshooting

### Steps Not Advancing

- Check that `isRunning` is true
- Verify step actions are async and complete
- Ensure no errors in step actions (check console)

### Auto-Play Not Working

- Verify `isAutoPlaying` is true
- Check that `duration` is set on steps
- Ensure `animationSpeed` is not 0 or negative

### Keyboard Shortcuts Not Working

- Scenario must be running (`isRunning = true`)
- Make sure user isn't focused on input/textarea
- Check browser console for errors

### Steps Execute Multiple Times

- Don't manually call `executeStep()` when using the hook
- Use `loadScenario()` to start scenarios
- Check that you're not calling `goToNextStep()` in loops

## Examples

See the `src/examples/` directory for complete examples:

- `AsyncMicroservicesRefactored.example.jsx` - Full refactored pattern
- `ScenarioWithBuilders.example.jsx` - Using step builders

## Contributing

When adding new builder methods:

1. Add to `createStepBuilder` in `scenarioHelpers.js`
2. Document in this README
3. Add example usage
4. Update TypeScript definitions if applicable
