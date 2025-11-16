/**
 * Interactive Demo of the Step-by-Step Execution System
 *
 * This component demonstrates all features of useStepByStep hook:
 * - Loading scenarios
 * - Auto-play mode
 * - Manual navigation
 * - Keyboard shortcuts
 * - Progress tracking
 * - Callbacks
 */

import { useState } from 'react'
import { useStepByStep } from '../hooks/useStepByStep'
import { createStep, createScenario, createStepBuilder, createSpeedDelay } from '../utils/scenarioHelpers'
import StepByStepControls from '../components/pattern/StepByStepControls'

export default function StepByStepDemo() {
  const [animationSpeed, setAnimationSpeed] = useState(1)
  const [logs, setLogs] = useState([])
  const [visualState, setVisualState] = useState({
    activeService: null,
    messages: []
  })

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, { timestamp, message, type }].slice(-10))
  }

  const clearLogs = () => setLogs([])
  const speedDelay = createSpeedDelay(animationSpeed)

  // Initialize step control with callbacks
  const stepControl = useStepByStep({
    animationSpeed,

    onScenarioStart: (name) => {
      clearLogs()
      setVisualState({ activeService: null, messages: [] })
      addLog(`━━━ SCENARIO STARTED: ${name} ━━━`, 'info')
    },

    onScenarioComplete: () => {
      addLog('━━━ SCENARIO COMPLETE ━━━', 'success')
    },

    onStepChange: (stepNum, step) => {
      console.log(`Step ${stepNum}:`, step.explanation)
    }
  })

  /**
   * DEMO SCENARIO 1: Simple Linear Flow
   */
  const runSimpleDemo = () => {
    const steps = [
      createStep({
        explanation: 'Initialize the system and prepare resources',
        duration: 1500,
        action: async () => {
          addLog('Initializing...', 'info')
          setVisualState({ activeService: 'init', messages: [] })
          await speedDelay(300)
        }
      }),

      createStep({
        explanation: 'Load configuration from environment',
        duration: 1500,
        action: async () => {
          addLog('Loading config...', 'info')
          setVisualState({ activeService: 'config', messages: ['Config loaded'] })
          await speedDelay(300)
        }
      }),

      createStep({
        explanation: 'Connect to database and verify connection',
        duration: 1500,
        action: async () => {
          addLog('Connecting to database...', 'info')
          setVisualState({ activeService: 'database', messages: ['DB connected'] })
          await speedDelay(500)
          addLog('✅ Database connection established', 'success')
        }
      }),

      createStep({
        explanation: 'Start HTTP server and listen for requests',
        duration: 1500,
        action: async () => {
          addLog('Starting HTTP server...', 'info')
          setVisualState({ activeService: 'server', messages: ['Server listening on port 3000'] })
          await speedDelay(300)
          addLog('✅ Server ready to accept requests', 'success')
        }
      }),

      createStep({
        explanation: 'System ready! Application is now fully operational',
        duration: 2000,
        action: async () => {
          addLog('━━━ SYSTEM READY ━━━', 'success')
          setVisualState({ activeService: 'ready', messages: ['All systems operational'] })
          await speedDelay(500)
        }
      })
    ]

    stepControl.loadScenario('Simple Linear Flow', steps, { autoPlay: false })
  }

  /**
   * DEMO SCENARIO 2: Using Step Builders
   */
  const runBuilderDemo = () => {
    const builder = createStepBuilder({
      addLog,
      setMessages: (updater) => {
        setVisualState(prev => ({
          ...prev,
          messages: typeof updater === 'function' ? updater(prev.messages) : updater
        }))
      },
      delay: speedDelay,
      positions: {} // Mock positions
    })

    const scenario = createScenario({
      name: 'API Request Flow',
      description: 'Demonstrates request/response pattern using builders',
      steps: [
        builder.customStep({
          explanation: 'Client application sends GET request',
          duration: 1500,
          action: async () => {
            addLog('→ GET /api/users', 'request')
            setVisualState({ activeService: 'api', messages: ['Processing request...'] })
            await speedDelay(300)
          }
        }),

        builder.customStep({
          explanation: 'API Gateway validates authentication token',
          duration: 1500,
          action: async () => {
            addLog('Validating auth token...', 'info')
            setVisualState({ activeService: 'auth', messages: ['Token valid'] })
            await speedDelay(400)
          }
        }),

        builder.customStep({
          explanation: 'Query database for user records',
          duration: 1500,
          action: async () => {
            addLog('Querying database...', 'info')
            setVisualState({ activeService: 'database', messages: ['Fetching users...'] })
            await speedDelay(500)
            addLog('Retrieved 42 users', 'info')
          }
        }),

        builder.customStep({
          explanation: 'Transform data and apply business logic',
          duration: 1500,
          action: async () => {
            addLog('Transforming data...', 'info')
            setVisualState({ activeService: 'transform', messages: ['Applying filters...'] })
            await speedDelay(300)
          }
        }),

        builder.customStep({
          explanation: 'Send JSON response back to client',
          duration: 1500,
          action: async () => {
            addLog('← 200 OK (42 users)', 'success')
            setVisualState({ activeService: 'response', messages: ['Response sent'] })
            await speedDelay(500)
          }
        }),

        builder.cleanupStep({
          explanation: 'Request complete! Total time: 1.2s',
          duration: 2000
        })
      ]
    })

    stepControl.loadScenario(scenario.name, scenario.steps, { autoPlay: true })
  }

  /**
   * DEMO SCENARIO 3: Error Handling
   */
  const runErrorDemo = () => {
    const steps = [
      {
        explanation: 'Attempt to connect to external service',
        duration: 1500,
        action: async () => {
          addLog('Connecting to external API...', 'info')
          setVisualState({ activeService: 'external', messages: ['Connecting...'] })
          await speedDelay(500)
        }
      },

      {
        explanation: 'Connection timeout! External service is not responding',
        duration: 2000,
        action: async () => {
          addLog('❌ Connection timeout (5s)', 'error')
          setVisualState({ activeService: 'external', messages: ['Timeout error'] })
          await speedDelay(500)
        }
      },

      {
        explanation: 'Activate circuit breaker to prevent cascading failures',
        duration: 1500,
        action: async () => {
          addLog('⚠️ Circuit breaker OPEN', 'warning')
          setVisualState({ activeService: 'circuit-breaker', messages: ['Breaker activated'] })
          await speedDelay(500)
        }
      },

      {
        explanation: 'Fallback to cached data for graceful degradation',
        duration: 1500,
        action: async () => {
          addLog('Using cached fallback data', 'warning')
          setVisualState({ activeService: 'cache', messages: ['Serving stale data'] })
          await speedDelay(500)
        }
      },

      {
        explanation: 'Partial response sent - service degraded but still functional',
        duration: 2000,
        action: async () => {
          addLog('⚠️ 200 OK (partial data)', 'warning')
          setVisualState({ activeService: 'response', messages: ['Degraded response'] })
          await speedDelay(500)
        }
      }
    ]

    stepControl.loadScenario('Error Handling & Resilience', steps)
  }

  /**
   * DEMO SCENARIO 4: Progress Tracking
   */
  const runProgressDemo = () => {
    const tasks = [
      'Validating user input',
      'Uploading file to S3',
      'Processing image',
      'Generating thumbnails',
      'Updating database',
      'Sending notification',
      'Cleaning up temp files'
    ]

    const steps = tasks.map((task, index) => ({
      explanation: `${task} (${index + 1}/${tasks.length})`,
      duration: 1200,
      action: async () => {
        addLog(`Processing: ${task}`, 'info')
        setVisualState({
          activeService: 'processing',
          messages: [`${task}...`, `${Math.round(((index + 1) / tasks.length) * 100)}% complete`]
        })
        await speedDelay(400)

        if (index === tasks.length - 1) {
          addLog('✅ All tasks completed!', 'success')
        }
      }
    }))

    stepControl.loadScenario('Multi-Step Process', steps, { autoPlay: true })
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
      <h1>Step-by-Step Execution System Demo</h1>

      {/* Controls */}
      <div style={{ marginBottom: '30px', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
        <h2>Demo Scenarios</h2>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <button
            onClick={runSimpleDemo}
            style={{
              padding: '10px 20px',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            1. Simple Linear Flow
          </button>

          <button
            onClick={runBuilderDemo}
            style={{
              padding: '10px 20px',
              background: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            2. API Request (Auto-play)
          </button>

          <button
            onClick={runErrorDemo}
            style={{
              padding: '10px 20px',
              background: '#FF9800',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            3. Error Handling
          </button>

          <button
            onClick={runProgressDemo}
            style={{
              padding: '10px 20px',
              background: '#9C27B0',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            4. Progress Tracking
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label>
            Animation Speed:
            <select
              value={animationSpeed}
              onChange={(e) => setAnimationSpeed(Number(e.target.value))}
              style={{ marginLeft: '10px', padding: '5px' }}
            >
              <option value={0.5}>0.5x (Slow)</option>
              <option value={1}>1x (Normal)</option>
              <option value={2}>2x (Fast)</option>
              <option value={4}>4x (Very Fast)</option>
            </select>
          </label>

          <button
            onClick={stepControl.stopScenario}
            disabled={!stepControl.isRunning}
            style={{
              padding: '5px 15px',
              background: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: stepControl.isRunning ? 'pointer' : 'not-allowed',
              opacity: stepControl.isRunning ? 1 : 0.5
            }}
          >
            Stop Scenario
          </button>

          <button
            onClick={stepControl.resetScenario}
            disabled={!stepControl.isRunning}
            style={{
              padding: '5px 15px',
              background: '#607D8B',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: stepControl.isRunning ? 'pointer' : 'not-allowed',
              opacity: stepControl.isRunning ? 1 : 0.5
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Step Controls */}
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

      {/* Progress Bar */}
      {stepControl.isRunning && (
        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '5px',
            fontSize: '14px',
            color: '#666'
          }}>
            <span>Progress: {Math.round(stepControl.progress)}%</span>
            <span>
              {stepControl.isComplete ? 'Complete!' : `${stepControl.currentStep}/${stepControl.totalSteps} steps`}
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            background: '#e0e0e0',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${stepControl.progress}%`,
              height: '100%',
              background: stepControl.isComplete ? '#4CAF50' : '#2196F3',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      )}

      {/* Visual State Display */}
      <div style={{
        marginTop: '30px',
        padding: '20px',
        background: '#fff',
        border: '1px solid #ddd',
        borderRadius: '8px',
        minHeight: '150px'
      }}>
        <h3>Visual State</h3>
        {visualState.activeService ? (
          <div>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#2196F3',
              marginBottom: '10px'
            }}>
              {visualState.activeService}
            </div>
            {visualState.messages.map((msg, idx) => (
              <div key={idx} style={{ color: '#666', marginBottom: '5px' }}>
                {msg}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: '#999', fontStyle: 'italic' }}>
            No scenario running. Click a button above to start.
          </div>
        )}
      </div>

      {/* Logs */}
      <div style={{
        marginTop: '20px',
        padding: '20px',
        background: '#1e1e1e',
        color: '#d4d4d4',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '13px',
        maxHeight: '300px',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <strong>Event Log</strong>
          <button
            onClick={clearLogs}
            style={{
              padding: '2px 10px',
              fontSize: '11px',
              background: '#444',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            Clear
          </button>
        </div>
        {logs.length === 0 ? (
          <div style={{ color: '#666' }}>No logs yet</div>
        ) : (
          logs.map((log, idx) => (
            <div
              key={idx}
              style={{
                color: log.type === 'error' ? '#f44336' :
                       log.type === 'success' ? '#4CAF50' :
                       log.type === 'warning' ? '#FF9800' :
                       log.type === 'request' ? '#2196F3' : '#d4d4d4',
                marginBottom: '5px'
              }}
            >
              [{log.timestamp}] {log.message}
            </div>
          ))
        )}
      </div>

      {/* Instructions */}
      <div style={{
        marginTop: '30px',
        padding: '20px',
        background: '#E3F2FD',
        borderRadius: '8px'
      }}>
        <h3>Keyboard Shortcuts (when scenario is running)</h3>
        <ul style={{ marginTop: '10px', lineHeight: '1.8' }}>
          <li><kbd style={{ padding: '2px 8px', background: 'white', borderRadius: '3px', border: '1px solid #ccc' }}>→</kbd> Next step</li>
          <li><kbd style={{ padding: '2px 8px', background: 'white', borderRadius: '3px', border: '1px solid #ccc' }}>←</kbd> Previous step</li>
          <li><kbd style={{ padding: '2px 8px', background: 'white', borderRadius: '3px', border: '1px solid #ccc' }}>Space</kbd> Toggle auto-play</li>
        </ul>

        <h3 style={{ marginTop: '20px' }}>Features Demonstrated</h3>
        <ul style={{ marginTop: '10px', lineHeight: '1.8' }}>
          <li>Step-by-step execution with explanations</li>
          <li>Auto-play mode with configurable speed</li>
          <li>Manual navigation (next/previous/jump)</li>
          <li>Keyboard shortcuts for quick control</li>
          <li>Progress tracking and completion detection</li>
          <li>Scenario lifecycle callbacks</li>
          <li>Dynamic step durations</li>
          <li>Visual state updates per step</li>
        </ul>
      </div>
    </div>
  )
}
