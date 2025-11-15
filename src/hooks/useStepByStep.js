import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Custom hook for managing step-by-step scenario execution
 *
 * This hook provides a complete solution for interactive, step-by-step visualizations
 * with support for auto-play, keyboard shortcuts, and manual navigation.
 *
 * @param {Object} options - Configuration options
 * @param {number} options.animationSpeed - Speed multiplier for animations (default: 1)
 * @param {Function} options.onScenarioStart - Callback when a new scenario starts
 * @param {Function} options.onScenarioComplete - Callback when scenario completes
 * @param {Function} options.onStepChange - Callback on each step change
 *
 * @returns {Object} Step-by-step control interface
 *
 * @example
 * const stepControl = useStepByStep({
 *   animationSpeed: 2,
 *   onScenarioStart: (name) => console.log(`Starting: ${name}`),
 *   onScenarioComplete: () => console.log('Done!')
 * })
 *
 * // Load and start a scenario
 * stepControl.loadScenario('Cache Hit Demo', cacheHitSteps)
 */
export const useStepByStep = (options = {}) => {
  const {
    animationSpeed = 1,
    onScenarioStart,
    onScenarioComplete,
    onStepChange
  } = options

  // Core state management
  const [currentStep, setCurrentStep] = useState(0)
  const [steps, setSteps] = useState([])
  const [isAutoPlaying, setIsAutoPlaying] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [scenarioName, setScenarioName] = useState('')

  // Refs for cleanup and async operations
  const autoPlayTimer = useRef(null)
  const isExecutingStep = useRef(false)

  /**
   * Execute a single step's action function
   * Prevents concurrent step execution and handles errors gracefully
   */
  const executeStep = useCallback(async (step) => {
    if (!step || !step.action) return

    // Prevent concurrent step execution
    if (isExecutingStep.current) {
      console.warn('Step already executing, skipping')
      return
    }

    isExecutingStep.current = true

    try {
      await step.action()
    } catch (error) {
      console.error('Error executing step:', error)
      // Don't stop the scenario on error, but log it
    } finally {
      isExecutingStep.current = false
    }
  }, [])

  /**
   * Navigate to the next step
   * Executes the step's action and advances the counter
   */
  const goToNextStep = useCallback(async () => {
    if (currentStep >= steps.length) return

    const nextStep = currentStep + 1
    setCurrentStep(nextStep)

    // Execute the step action (steps are 0-indexed in array, 1-indexed in counter)
    const stepToExecute = steps[nextStep - 1]
    if (stepToExecute) {
      await executeStep(stepToExecute)

      // Notify step change
      if (onStepChange) {
        onStepChange(nextStep, stepToExecute)
      }

      // Check if scenario is complete
      if (nextStep === steps.length && onScenarioComplete) {
        onScenarioComplete()
      }
    }
  }, [currentStep, steps, executeStep, onStepChange, onScenarioComplete])

  /**
   * Navigate to the previous step
   * Note: Does NOT re-execute previous steps, only shows the explanation
   * This is intentional to avoid complex state rollback logic
   */
  const goToPreviousStep = useCallback(() => {
    if (currentStep <= 1) return

    const prevStep = currentStep - 1
    setCurrentStep(prevStep)

    if (onStepChange) {
      onStepChange(prevStep, steps[prevStep - 1])
    }
  }, [currentStep, steps, onStepChange])

  /**
   * Toggle auto-play mode
   * When enabled, automatically advances through steps based on their duration
   */
  const toggleAutoPlay = useCallback(() => {
    setIsAutoPlaying(prev => !prev)
  }, [])

  /**
   * Start auto-play mode
   */
  const startAutoPlay = useCallback(() => {
    setIsAutoPlaying(true)
  }, [])

  /**
   * Pause auto-play mode
   */
  const pauseAutoPlay = useCallback(() => {
    setIsAutoPlaying(false)
  }, [])

  /**
   * Load a new scenario with its steps
   * Resets all state and prepares for execution
   *
   * @param {string} name - Name of the scenario
   * @param {Array} scenarioSteps - Array of step objects
   * @param {Object} config - Optional configuration
   * @param {boolean} config.autoStart - Auto-start the scenario (default: true)
   * @param {boolean} config.autoPlay - Auto-play through steps (default: false)
   */
  const loadScenario = useCallback(async (name, scenarioSteps, config = {}) => {
    const { autoStart = true, autoPlay = false } = config

    // Clear any existing timers
    if (autoPlayTimer.current) {
      clearTimeout(autoPlayTimer.current)
      autoPlayTimer.current = null
    }

    // Reset state
    setScenarioName(name)
    setSteps(scenarioSteps)
    setCurrentStep(0)
    setIsAutoPlaying(autoPlay)
    setIsRunning(false)
    isExecutingStep.current = false

    // Notify scenario start
    if (onScenarioStart) {
      onScenarioStart(name)
    }

    // Auto-start if configured
    if (autoStart && scenarioSteps.length > 0) {
      setIsRunning(true)
      setCurrentStep(1)

      // Execute first step immediately
      await executeStep(scenarioSteps[0])

      if (onStepChange) {
        onStepChange(1, scenarioSteps[0])
      }
    }
  }, [executeStep, onScenarioStart, onStepChange])

  /**
   * Stop the current scenario
   * Clears all state and timers
   */
  const stopScenario = useCallback(() => {
    if (autoPlayTimer.current) {
      clearTimeout(autoPlayTimer.current)
      autoPlayTimer.current = null
    }

    setIsRunning(false)
    setCurrentStep(0)
    setSteps([])
    setIsAutoPlaying(false)
    setScenarioName('')
    isExecutingStep.current = false
  }, [])

  /**
   * Reset scenario to beginning
   * Keeps the same steps but resets to step 1
   */
  const resetScenario = useCallback(async () => {
    if (steps.length === 0) return

    if (autoPlayTimer.current) {
      clearTimeout(autoPlayTimer.current)
      autoPlayTimer.current = null
    }

    setCurrentStep(1)
    setIsAutoPlaying(false)
    isExecutingStep.current = false

    // Execute first step
    await executeStep(steps[0])

    if (onStepChange) {
      onStepChange(1, steps[0])
    }
  }, [steps, executeStep, onStepChange])

  /**
   * Jump to a specific step
   * Note: Does not execute intermediate steps
   */
  const goToStep = useCallback(async (stepNumber) => {
    if (stepNumber < 1 || stepNumber > steps.length) return

    setCurrentStep(stepNumber)

    const step = steps[stepNumber - 1]
    if (step && onStepChange) {
      onStepChange(stepNumber, step)
    }
  }, [steps, onStepChange])

  /**
   * Auto-play effect
   * Automatically advances to next step after the current step's duration
   */
  useEffect(() => {
    // Clear any existing timer
    if (autoPlayTimer.current) {
      clearTimeout(autoPlayTimer.current)
      autoPlayTimer.current = null
    }

    // Only auto-play if enabled, running, and not at the end
    if (isAutoPlaying && isRunning && currentStep < steps.length && currentStep > 0) {
      const currentStepData = steps[currentStep - 1]
      const duration = currentStepData?.duration || 1500

      // Apply animation speed multiplier (higher speed = shorter duration)
      const adjustedDuration = duration / animationSpeed

      autoPlayTimer.current = setTimeout(() => {
        goToNextStep()
      }, adjustedDuration)
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      if (autoPlayTimer.current) {
        clearTimeout(autoPlayTimer.current)
        autoPlayTimer.current = null
      }
    }
  }, [isAutoPlaying, currentStep, steps, isRunning, animationSpeed, goToNextStep])

  /**
   * Keyboard shortcuts effect
   * Arrow Right: Next step
   * Arrow Left: Previous step
   * Space: Toggle auto-play
   */
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Only handle keyboard shortcuts when a scenario is running
      if (!isRunning) return

      // Prevent shortcuts if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return
      }

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault()
          goToNextStep()
          break

        case 'ArrowLeft':
          e.preventDefault()
          goToPreviousStep()
          break

        case ' ':
          e.preventDefault()
          toggleAutoPlay()
          break

        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isRunning, goToNextStep, goToPreviousStep, toggleAutoPlay])

  /**
   * Cleanup on unmount
   * Ensures no memory leaks from timers
   */
  useEffect(() => {
    return () => {
      if (autoPlayTimer.current) {
        clearTimeout(autoPlayTimer.current)
      }
    }
  }, [])

  // Return the complete step-by-step control interface
  return {
    // State
    currentStep,
    totalSteps: steps.length,
    steps,
    isAutoPlaying,
    isRunning,
    scenarioName,

    // Current step info (for UI display)
    currentStepData: steps[currentStep - 1] || null,
    stepExplanation: steps[currentStep - 1]?.explanation || '',

    // Navigation functions
    goToNextStep,
    goToPreviousStep,
    goToStep,

    // Playback control
    toggleAutoPlay,
    startAutoPlay,
    pauseAutoPlay,

    // Scenario management
    loadScenario,
    stopScenario,
    resetScenario,

    // Computed properties (for UI convenience)
    canGoNext: currentStep < steps.length,
    canGoPrevious: currentStep > 1,
    isComplete: currentStep === steps.length && steps.length > 0,
    progress: steps.length > 0 ? (currentStep / steps.length) * 100 : 0
  }
}
