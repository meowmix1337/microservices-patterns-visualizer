# Migration Guide: Converting to useStepByStep Hook

This guide shows how to convert existing pattern components to use the new `useStepByStep` hook system.

## Step 1: Replace State Variables

### Before (AsyncMicroservicesPattern.jsx lines 23-27)

```jsx
// Step-by-step control state
const [currentStep, setCurrentStep] = useState(0)
const [steps, setSteps] = useState([])
const [isAutoPlaying, setIsAutoPlaying] = useState(false)
const [isRunning, setIsRunning] = useState(false)
const autoPlayTimer = useRef(null)
```

### After

```jsx
// Import the hook
import { useStepByStep } from '../hooks/useStepByStep'
import { createSpeedDelay } from '../utils/scenarioHelpers'

// Initialize hook
const stepControl = useStepByStep({
  animationSpeed,
  onScenarioStart: (name) => {
    const newRunNumber = runCounter + 1
    setRunCounter(newRunNumber)
    addLog(`━━━ Run #${newRunNumber}: ${name} ━━━`, 'info')
  }
})

// Create speed-aware delay
const speedDelay = createSpeedDelay(animationSpeed)
```

## Step 2: Remove Manual Step Execution Logic

### Before (lines 29-94)

```jsx
const speedDelay = (ms) => delay(ms / animationSpeed)

// Step execution
const executeStep = async (step) => {
  if (step.action) {
    await step.action()
  }
}

const goToNextStep = async () => {
  if (currentStep < steps.length) {
    const nextStep = currentStep + 1
    setCurrentStep(nextStep)
    await executeStep(steps[nextStep - 1])
  }
}

const goToPreviousStep = () => {
  if (currentStep > 1) {
    setCurrentStep(currentStep - 1)
  }
}

const toggleAutoPlay = () => {
  setIsAutoPlaying(!isAutoPlaying)
}

// Auto-play effect
useEffect(() => {
  if (isAutoPlaying && isRunning && currentStep < steps.length) {
    const currentStepData = steps[currentStep]
    const delay = currentStepData?.duration || 1500

    autoPlayTimer.current = setTimeout(() => {
      goToNextStep()
    }, delay)
  }

  return () => {
    if (autoPlayTimer.current) {
      clearTimeout(autoPlayTimer.current)
    }
  }
}, [isAutoPlaying, currentStep, steps, isRunning])

// Keyboard shortcuts
useEffect(() => {
  const handleKeyPress = (e) => {
    if (!isRunning) return

    if (e.key === 'ArrowRight') {
      e.preventDefault()
      goToNextStep()
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      goToPreviousStep()
    } else if (e.key === ' ') {
      e.preventDefault()
      toggleAutoPlay()
    }
  }

  window.addEventListener('keydown', handleKeyPress)
  return () => window.removeEventListener('keydown', handleKeyPress)
}, [isRunning, currentStep, steps])
```

### After

```jsx
// DELETE ALL OF THE ABOVE! The hook handles everything
// No manual effects, no timer management, no keyboard handling
```

## Step 3: Update startNewRun Helper

### Before (lines 96-108)

```jsx
const startNewRun = (scenarioName) => {
  const newRunNumber = runCounter + 1
  setRunCounter(newRunNumber)
  clearLogs()
  setCacheData({})
  setQueueMessages([])
  setMessages([])
  setIsRunning(false)
  setCurrentStep(0)
  setSteps([])
  setIsAutoPlaying(false)
  addLog(`━━━ Run #${newRunNumber}: ${scenarioName} ━━━`, 'info')
}
```

### After

```jsx
// Simplified - hook handles step state
const resetVisualization = () => {
  clearLogs()
  setCacheData({})
  setQueueMessages([])
  setMessages([])
}

// Run counter increment moved to onScenarioStart callback (see Step 1)
```

## Step 4: Convert Scenario Functions

### Before (lines 110-199 for simulateCacheHit)

```jsx
const simulateCacheHit = () => {
  startNewRun('Cache Hit (Step-by-Step Demo)')

  const cacheHitSteps = [
    {
      explanation: "Client initiates a GET request...",
      duration: 2000,
      action: async () => {
        addLog('GET /notes request received', 'request')
        // ... step logic
      }
    },
    // ... more steps
  ]

  setSteps(cacheHitSteps)
  setIsRunning(true)
  setCurrentStep(1)
  executeStep(cacheHitSteps[0])
}
```

### After

```jsx
const simulateCacheHit = () => {
  resetVisualization()

  const cacheHitSteps = [
    {
      explanation: "Client initiates a GET request...",
      duration: 2000,
      action: async () => {
        addLog('GET /notes request received', 'request')
        // ... same step logic (no changes needed here)
      }
    },
    // ... more steps (unchanged)
  ]

  // Just load the scenario - hook handles the rest!
  stepControl.loadScenario('Cache Hit (Step-by-Step Demo)', cacheHitSteps)
}
```

## Step 5: Update StepByStepControls Component Usage

### Before (lines 554-563)

```jsx
<StepByStepControls
  currentStep={currentStep}
  totalSteps={steps.length}
  stepExplanation={steps[currentStep - 1]?.explanation}
  onNext={goToNextStep}
  onPrevious={goToPreviousStep}
  onToggleAutoPlay={toggleAutoPlay}
  isAutoPlaying={isAutoPlaying}
  isRunning={isRunning}
/>
```

### After

```jsx
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
```

## Complete Before/After Example

### Before: Original simulateCacheHit

```jsx
const simulateCacheHit = () => {
  startNewRun('Cache Hit (Step-by-Step Demo)')

  const cacheHitSteps = [
    {
      explanation: "Client initiates a GET request to fetch notes from the Notes Service",
      duration: 2000,
      action: async () => {
        addLog('GET /notes request received', 'request')
        const msg = {
          id: Date.now(),
          from: 'client',
          to: 'notes-service',
          type: 'http',
          label: 'GET /notes',
          path: [POSITIONS.client, POSITIONS.notesService]
        }
        setMessages([msg])
        await speedDelay(500)
      }
    },
    {
      explanation: "Notes Service checks Redis cache first...",
      duration: 2000,
      action: async () => {
        addLog('Checking Redis cache...', 'info')
        // ... more logic
      }
    }
    // ... more steps
  ]

  setSteps(cacheHitSteps)
  setIsRunning(true)
  setCurrentStep(1)
  executeStep(cacheHitSteps[0])
}
```

### After: Using useStepByStep

```jsx
const simulateCacheHit = () => {
  resetVisualization()

  const cacheHitSteps = [
    {
      explanation: "Client initiates a GET request to fetch notes from the Notes Service",
      duration: 2000,
      action: async () => {
        addLog('GET /notes request received', 'request')
        const msg = {
          id: Date.now(),
          from: 'client',
          to: 'notes-service',
          type: 'http',
          label: 'GET /notes',
          path: [POSITIONS.client, POSITIONS.notesService]
        }
        setMessages([msg])
        await speedDelay(500)
      }
    },
    {
      explanation: "Notes Service checks Redis cache first...",
      duration: 2000,
      action: async () => {
        addLog('Checking Redis cache...', 'info')
        // ... more logic
      }
    }
    // ... more steps
  ]

  stepControl.loadScenario('Cache Hit (Step-by-Step Demo)', cacheHitSteps)
}
```

## Line-by-Line Changes Summary

### Lines to DELETE
- Lines 23-27: State declarations
- Lines 29-94: All manual step execution logic, effects, keyboard handlers

### Lines to MODIFY
- Lines 96-108: Simplify `startNewRun` to just `resetVisualization`
- Lines 110-199 (and similar): Each scenario function - replace last 4 lines with `stepControl.loadScenario()`
- Lines 554-563: StepByStepControls props - use `stepControl.*` instead of local state

### Lines to ADD (at top of component)
```jsx
import { useStepByStep } from '../hooks/useStepByStep'
import { createSpeedDelay } from '../utils/scenarioHelpers'

// After other state declarations:
const speedDelay = createSpeedDelay(animationSpeed)

const stepControl = useStepByStep({
  animationSpeed,
  onScenarioStart: (name) => {
    const newRunNumber = runCounter + 1
    setRunCounter(newRunNumber)
    clearLogs()
    setCacheData({})
    setQueueMessages([])
    setMessages([])
    addLog(`━━━ Run #${newRunNumber}: ${name} ━━━`, 'info')
  }
})
```

## Expected Results

### Code Reduction
- **Before**: ~94 lines of step execution logic
- **After**: ~15 lines of hook initialization
- **Savings**: ~80 lines removed

### Benefits
1. No manual timer management
2. No manual keyboard event handlers
3. No manual state synchronization
4. No manual cleanup on unmount
5. Consistent behavior across all patterns
6. Easy to add new features (progress bar, etc.)

## Testing Your Migration

After migrating, verify:

1. ✅ Click a scenario button - should start at step 1
2. ✅ Click "Next" - advances through steps
3. ✅ Click "Prev" - goes back (doesn't re-execute)
4. ✅ Click "Play" - auto-advances with timing
5. ✅ Press Space - toggles play/pause
6. ✅ Press → - next step
7. ✅ Press ← - previous step
8. ✅ Animation speed changes affect timing
9. ✅ Starting new scenario stops previous one
10. ✅ All steps execute correctly

## Common Issues

### Issue: Steps not advancing
**Cause**: Forgot to call `stepControl.loadScenario()`
**Fix**: Replace `setSteps()` + `setCurrentStep()` + `executeStep()` with `stepControl.loadScenario()`

### Issue: Keyboard shortcuts don't work
**Cause**: Already handled by hook
**Fix**: Remove manual keyboard event listeners

### Issue: Auto-play timing is wrong
**Cause**: Not using `speedDelay` from `createSpeedDelay()`
**Fix**: Create `speedDelay` and use it instead of raw `delay()`

### Issue: Multiple scenarios running at once
**Cause**: Should not happen with hook
**Fix**: Hook automatically stops previous scenario, check for double-clicks

## Next Steps

After basic migration:

1. Consider using step builders for common patterns
2. Add progress bars using `stepControl.progress`
3. Use scenario metadata for analytics
4. Validate scenarios with `validateScenario()`

See `src/examples/` for advanced usage patterns.
