/**
 * Scenario definition helpers for step-by-step visualizations
 *
 * This module provides utilities to create well-structured scenario definitions
 * that work seamlessly with the useStepByStep hook.
 */

import type { Step } from '../hooks/useStepByStep.d'
import type { Position } from '../constants/colors'

export interface CreateStepConfig {
  explanation: string
  action: () => Promise<void> | void
  duration?: number
  metadata?: Record<string, any>
}

export interface Scenario {
  name: string
  description: string
  steps: Step[]
  metadata: Record<string, any>
  stepCount: number
}

export interface CreateScenarioConfig {
  name: string
  description?: string
  steps?: Step[]
  metadata?: Record<string, any>
}

export interface Message {
  id: number
  from: string
  to: string
  type: 'http' | 'event' | 'cache'
  label: string
  path: [Position, Position]
  success?: boolean
}

export interface StepBuilderContext {
  addLog?: (message: string, type?: 'info' | 'success' | 'error' | 'warning' | 'request') => void
  setMessages?: React.Dispatch<React.SetStateAction<Message[]>>
  delay?: (ms: number) => Promise<void>
  positions?: Record<string, Position>
}

export interface RequestStepConfig {
  from: string
  to: string
  label: string
  explanation: string
  duration?: number
  logMessage?: string
}

export interface CacheCheckStepConfig {
  service: string
  cache: string
  key: string
  explanation: string
  duration?: number
}

export interface CacheHitStepConfig {
  cache: string
  service: string
  value: string
  explanation: string
  duration?: number
}

export interface CacheMissStepConfig {
  cache: string
  service: string
  explanation: string
  duration?: number
}

export interface ResponseStepConfig {
  from: string
  to: string
  label: string
  explanation: string
  duration?: number
  success?: boolean
  logMessage?: string
}

export interface PublishEventStepConfig {
  from: string
  to: string
  eventName: string
  explanation: string
  duration?: number
}

export interface CleanupStepConfig {
  explanation: string
  duration?: number
  customAction?: () => Promise<void> | void
}

export interface StepBuilder {
  requestStep: (config: RequestStepConfig) => Step
  cacheCheckStep: (config: CacheCheckStepConfig) => Step
  cacheHitStep: (config: CacheHitStepConfig) => Step
  cacheMissStep: (config: CacheMissStepConfig) => Step
  responseStep: (config: ResponseStepConfig) => Step
  publishEventStep: (config: PublishEventStepConfig) => Step
  cleanupStep: (config: CleanupStepConfig) => Step
  customStep: (config: CreateStepConfig) => Step
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Creates a step object with validation and defaults
 *
 * @param config - Step configuration
 * @returns Validated step object
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
export const createStep = ({ explanation, action, duration = 1500, metadata = {} }: CreateStepConfig): Step => {
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
 * @param config - Scenario configuration
 * @returns Scenario object ready for useStepByStep.loadScenario()
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
export const createScenario = ({ name, description = '', steps = [], metadata = {} }: CreateScenarioConfig): Scenario => {
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
 * @param context - Context object containing common dependencies
 * @returns Builder object with helper methods
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
export const createStepBuilder = (context: StepBuilderContext): StepBuilder => {
  const {
    addLog = () => {},
    setMessages = () => {},
    delay = async (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
    positions = {}
  } = context

  return {
    /**
     * Creates an HTTP request step
     */
    requestStep: ({ from, to, label, explanation, duration = 2000, logMessage }: RequestStepConfig): Step => createStep({
      explanation,
      duration,
      action: async () => {
        if (logMessage) addLog(logMessage, 'request')

        const message: Message = {
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
    cacheCheckStep: ({ service, cache, key, explanation, duration = 2000 }: CacheCheckStepConfig): Step => createStep({
      explanation,
      duration,
      action: async () => {
        addLog(`Checking ${cache} cache...`, 'info')

        const message: Message = {
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
    cacheHitStep: ({ cache, service, value, explanation, duration = 2000 }: CacheHitStepConfig): Step => createStep({
      explanation,
      duration,
      action: async () => {
        addLog(`✅ Cache HIT! Retrieved from ${cache}`, 'success')

        const message: Message = {
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
    cacheMissStep: ({ cache, service, explanation, duration = 2000 }: CacheMissStepConfig): Step => createStep({
      explanation,
      duration,
      action: async () => {
        addLog(`❌ Cache MISS! Need to fetch from source`, 'warning')

        const message: Message = {
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
    responseStep: ({ from, to, label, explanation, duration = 2000, success = true, logMessage }: ResponseStepConfig): Step => createStep({
      explanation,
      duration,
      action: async () => {
        if (logMessage) addLog(logMessage, success ? 'success' : 'error')

        const message: Message = {
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
    publishEventStep: ({ from, to, eventName, explanation, duration = 2000 }: PublishEventStepConfig): Step => createStep({
      explanation,
      duration,
      action: async () => {
        addLog(`Publishing ${eventName} event...`, 'info')

        const message: Message = {
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
    cleanupStep: ({ explanation, duration = 2000, customAction }: CleanupStepConfig): Step => createStep({
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
 * @param animationSpeed - Speed multiplier (1 = normal, 2 = 2x faster)
 * @returns Delay function
 *
 * @example
 * const speedDelay = createSpeedDelay(animationSpeed)
 * await speedDelay(1000) // Will wait 1000ms at 1x speed, 500ms at 2x speed
 */
export const createSpeedDelay = (animationSpeed: number = 1): ((ms: number) => Promise<void>) => {
  return (ms: number) => {
    return new Promise(resolve => {
      setTimeout(resolve, ms / animationSpeed)
    })
  }
}

/**
 * Validates a scenario definition
 * Useful for catching errors during development
 *
 * @param scenario - Scenario to validate
 * @returns Validation result with { valid: boolean, errors: string[] }
 *
 * @example
 * const result = validateScenario(myScenario)
 * if (!result.valid) {
 *   console.error('Scenario validation failed:', result.errors)
 * }
 */
export const validateScenario = (scenario: Scenario | null | undefined): ValidationResult => {
  const errors: string[] = []

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
