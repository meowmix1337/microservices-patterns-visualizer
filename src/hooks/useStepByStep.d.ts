/**
 * TypeScript type definitions for useStepByStep hook
 *
 * Even if you're not using TypeScript, these types serve as excellent
 * documentation for the hook's API and can help IDE autocomplete.
 */

/**
 * A single step in a scenario
 */
export interface Step {
  /** Human-readable explanation of what happens in this step */
  explanation: string

  /** Async function that executes the step's actions */
  action: () => Promise<void> | void

  /** Duration in milliseconds before auto-advancing (default: 1500) */
  duration?: number

  /** Optional metadata for analytics, debugging, etc. */
  metadata?: Record<string, any>
}

/**
 * Configuration options for useStepByStep hook
 */
export interface UseStepByStepOptions {
  /** Speed multiplier for animations (1 = normal, 2 = 2x faster) */
  animationSpeed?: number

  /** Callback fired when a new scenario starts */
  onScenarioStart?: (scenarioName: string) => void

  /** Callback fired when a scenario completes all steps */
  onScenarioComplete?: () => void

  /** Callback fired on each step change */
  onStepChange?: (stepNumber: number, step: Step) => void
}

/**
 * Configuration for loading a scenario
 */
export interface LoadScenarioConfig {
  /** Whether to auto-start the scenario (default: true) */
  autoStart?: boolean

  /** Whether to enable auto-play mode (default: false) */
  autoPlay?: boolean
}

/**
 * Return value from useStepByStep hook
 */
export interface StepByStepControl {
  // Current state
  /** Current step number (1-indexed, 0 = not started) */
  currentStep: number

  /** Total number of steps in the scenario */
  totalSteps: number

  /** Array of all steps */
  steps: Step[]

  /** Whether auto-play is currently enabled */
  isAutoPlaying: boolean

  /** Whether a scenario is currently running */
  isRunning: boolean

  /** Name of the current scenario */
  scenarioName: string

  // Current step information
  /** The current step object (or null if not started) */
  currentStepData: Step | null

  /** Explanation text for the current step */
  stepExplanation: string

  // Navigation functions
  /** Advance to the next step and execute its action */
  goToNextStep: () => Promise<void>

  /** Go back to the previous step (does not re-execute) */
  goToPreviousStep: () => void

  /** Jump to a specific step number (does not execute intermediate steps) */
  goToStep: (stepNumber: number) => Promise<void>

  // Playback control
  /** Toggle auto-play on/off */
  toggleAutoPlay: () => void

  /** Enable auto-play mode */
  startAutoPlay: () => void

  /** Disable auto-play mode */
  pauseAutoPlay: () => void

  // Scenario management
  /** Load and optionally start a new scenario */
  loadScenario: (
    name: string,
    steps: Step[],
    config?: LoadScenarioConfig
  ) => Promise<void>

  /** Stop the current scenario and reset all state */
  stopScenario: () => void

  /** Reset scenario to beginning (keeps same steps) */
  resetScenario: () => Promise<void>

  // Computed properties
  /** Whether next step is available */
  canGoNext: boolean

  /** Whether previous step is available */
  canGoPrevious: boolean

  /** Whether all steps are completed */
  isComplete: boolean

  /** Progress percentage (0-100) */
  progress: number
}

/**
 * Main hook function
 */
export function useStepByStep(
  options?: UseStepByStepOptions
): StepByStepControl
