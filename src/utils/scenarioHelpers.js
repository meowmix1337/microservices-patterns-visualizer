/**
 * Scenario definition helpers for step-by-step visualizations
 *
 * This module provides utilities to create well-structured scenario definitions
 * that work seamlessly with the useStepByStep hook.
 */

/**
 * Creates a step object with validation and defaults
 *
 * @param {Object} config - Step configuration
 * @param {string} config.explanation - Human-readable explanation of what happens in this step
 * @param {Function} config.action - Async function to execute for this step
 * @param {number} config.duration - How long to pause before auto-advancing (in ms, default: 1500)
 * @param {Object} config.metadata - Optional metadata for the step (analytics, debugging, etc.)
 *
 * @returns {Object} Validated step object
 *
 * @example
 * const step = createStep({
 *   explanation: 'Client sends GET request to Notes Service',
 *   duration: 2000,
 *   action: async () => {
 *     addLog('Request received')
 *     setMessages([createMessage()])
 *     await delay(500)
 *   }
 * })
 */
export const createStep = ({ explanation, action, duration = 1500, metadata = {} }) => {
  if (!explanation || typeof explanation !== 'string') {
    console.warn('Step missing required explanation text')
  }

  if (!action || typeof action !== 'function') {
    console.warn('Step missing required action function')
  }

  return {
    explanation,
    action,
    duration,
    metadata
  }
}

/**
 * Creates a scenario with multiple steps
 *
 * @param {Object} config - Scenario configuration
 * @param {string} config.name - Scenario name
 * @param {string} config.description - Optional scenario description
 * @param {Array<Object>} config.steps - Array of step objects (use createStep for validation)
 * @param {Object} config.metadata - Optional scenario-level metadata
 *
 * @returns {Object} Scenario object ready for useStepByStep.loadScenario()
 *
 * @example
 * const cacheHitScenario = createScenario({
 *   name: 'Cache Hit (Fast Path)',
 *   description: 'Demonstrates ultra-low latency when data is in cache',
 *   steps: [
 *     createStep({ ... }),
 *     createStep({ ... })
 *   ]
 * })
 */
export const createScenario = ({ name, description = '', steps = [], metadata = {} }) => {
  if (!name || typeof name !== 'string') {
    throw new Error('Scenario must have a name')
  }

  if (!Array.isArray(steps) || steps.length === 0) {
    console.warn(`Scenario "${name}" has no steps defined`)
  }

  return {
    name,
    description,
    steps,
    metadata,
    stepCount: steps.length
  }
}

/**
 * Creates a step builder for scenarios with common patterns
 * Provides a fluent API for building steps with sensible defaults
 *
 * @param {Object} context - Context object containing common dependencies
 * @param {Function} context.addLog - Function to add logs
 * @param {Function} context.setMessages - Function to set messages
 * @param {Function} context.delay - Delay function that respects animation speed
 * @param {Object} context.positions - Service position constants
 *
 * @returns {Object} Builder object with helper methods
 *
 * @example
 * const builder = createStepBuilder({ addLog, setMessages, delay, positions })
 *
 * const steps = [
 *   builder.requestStep({
 *     from: 'client',
 *     to: 'notes-service',
 *     label: 'GET /notes',
 *     explanation: 'Client requests notes'
 *   }),
 *   builder.cacheCheckStep({
 *     service: 'notes-service',
 *     cache: 'redis',
 *     key: 'tags:note:123'
 *   })
 * ]
 */
export const createStepBuilder = (context) => {
  const {
    addLog = () => {},
    setMessages = () => {},
    delay = async (ms) => new Promise(resolve => setTimeout(resolve, ms)),
    positions = {}
  } = context

  return {
    /**
     * Creates an HTTP request step
     */
    requestStep: ({ from, to, label, explanation, duration = 2000, logMessage }) => createStep({
      explanation,
      duration,
      action: async () => {
        if (logMessage) addLog(logMessage, 'request')

        const message = {
          id: Date.now(),
          from,
          to,
          type: 'http',
          label,
          path: [positions[from], positions[to]]
        }

        setMessages(prev => [...prev, message])
        await delay(500)
      }
    }),

    /**
     * Creates a cache check step
     */
    cacheCheckStep: ({ service, cache, key, explanation, duration = 2000 }) => createStep({
      explanation,
      duration,
      action: async () => {
        addLog(`Checking ${cache} cache...`, 'info')

        const message = {
          id: Date.now(),
          from: service,
          to: cache,
          type: 'cache',
          label: `GET ${key}`,
          path: [positions[service], positions[cache]]
        }

        setMessages(prev => [...prev, message])
        await delay(500)
      }
    }),

    /**
     * Creates a cache hit response step
     */
    cacheHitStep: ({ cache, service, value, explanation, duration = 2000 }) => createStep({
      explanation,
      duration,
      action: async () => {
        addLog(`✅ Cache HIT! Retrieved from ${cache}`, 'success')

        const message = {
          id: Date.now(),
          from: cache,
          to: service,
          type: 'cache',
          label: value,
          path: [positions[cache], positions[service]],
          success: true
        }

        setMessages(prev => [...prev, message])
        await delay(500)
      }
    }),

    /**
     * Creates a cache miss response step
     */
    cacheMissStep: ({ cache, service, explanation, duration = 2000 }) => createStep({
      explanation,
      duration,
      action: async () => {
        addLog(`❌ Cache MISS! Need to fetch from source`, 'warning')

        const message = {
          id: Date.now(),
          from: cache,
          to: service,
          type: 'cache',
          label: 'null',
          path: [positions[cache], positions[service]],
          success: false
        }

        setMessages(prev => [...prev, message])
        await delay(500)
      }
    }),

    /**
     * Creates a service response step
     */
    responseStep: ({ from, to, label, explanation, duration = 2000, success = true, logMessage }) => createStep({
      explanation,
      duration,
      action: async () => {
        if (logMessage) addLog(logMessage, success ? 'success' : 'error')

        const message = {
          id: Date.now(),
          from,
          to,
          type: 'http',
          label,
          path: [positions[from], positions[to]],
          success
        }

        setMessages(prev => [...prev, message])
        await delay(500)
      }
    }),

    /**
     * Creates an event publishing step
     */
    publishEventStep: ({ from, to, eventName, explanation, duration = 2000 }) => createStep({
      explanation,
      duration,
      action: async () => {
        addLog(`Publishing ${eventName} event...`, 'info')

        const message = {
          id: Date.now(),
          from,
          to,
          type: 'event',
          label: `${eventName} event`,
          path: [positions[from], positions[to]]
        }

        setMessages(prev => [...prev, message])
        await delay(500)
      }
    }),

    /**
     * Creates a cleanup/completion step
     */
    cleanupStep: ({ explanation, duration = 2000, customAction }) => createStep({
      explanation,
      duration,
      action: async () => {
        await delay(500)
        if (customAction) {
          await customAction()
        } else {
          setMessages([])
        }
      }
    }),

    /**
     * Creates a custom step (for scenarios that don't fit patterns)
     */
    customStep: createStep
  }
}

/**
 * Helper to create a delay function that respects animation speed
 *
 * @param {number} animationSpeed - Speed multiplier (1 = normal, 2 = 2x faster)
 * @returns {Function} Delay function
 *
 * @example
 * const speedDelay = createSpeedDelay(animationSpeed)
 * await speedDelay(1000) // Will wait 1000ms at 1x speed, 500ms at 2x speed
 */
export const createSpeedDelay = (animationSpeed = 1) => {
  return (ms) => {
    return new Promise(resolve => {
      setTimeout(resolve, ms / animationSpeed)
    })
  }
}

/**
 * Validates a scenario definition
 * Useful for catching errors during development
 *
 * @param {Object} scenario - Scenario to validate
 * @returns {Object} Validation result with { valid: boolean, errors: string[] }
 *
 * @example
 * const result = validateScenario(myScenario)
 * if (!result.valid) {
 *   console.error('Scenario validation failed:', result.errors)
 * }
 */
export const validateScenario = (scenario) => {
  const errors = []

  if (!scenario) {
    errors.push('Scenario is null or undefined')
    return { valid: false, errors }
  }

  if (!scenario.name || typeof scenario.name !== 'string') {
    errors.push('Scenario must have a name (string)')
  }

  if (!scenario.steps || !Array.isArray(scenario.steps)) {
    errors.push('Scenario must have steps (array)')
  } else {
    scenario.steps.forEach((step, index) => {
      if (!step.explanation) {
        errors.push(`Step ${index + 1} missing explanation`)
      }

      if (!step.action || typeof step.action !== 'function') {
        errors.push(`Step ${index + 1} missing or invalid action function`)
      }

      if (step.duration && typeof step.duration !== 'number') {
        errors.push(`Step ${index + 1} has invalid duration (must be number)`)
      }
    })
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
