import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import ServiceBox from '../components/ServiceBox'
import MessageFlow from '../components/MessageFlow'
import InfoTabs from '../components/InfoTabs'
import StepByStepControls from '../components/StepByStepControls'
import { useLogs } from '../hooks/useLogs'
import { useStepByStep } from '../hooks/useStepByStep'
import { createSpeedDelay } from '../utils/scenarioHelpers'

export default function RequestResponsePattern({ animationSpeed }) {
  const [messages, setMessages] = useState([])
  const { logs, addLog, clearLogs } = useLogs()
  const [runCounter, setRunCounter] = useState(0)
  const [tagsServiceStatus, setTagsServiceStatus] = useState('healthy')

  // Step-by-step control hook
  const stepControl = useStepByStep({
    animationSpeed,
    onScenarioStart: (name) => {
      const newRunNumber = runCounter + 1
      setRunCounter(newRunNumber)
      clearLogs()
      setMessages([])
      addLog(`━━━ Run #${newRunNumber}: ${name} ━━━`, 'info')
    }
  })

  const speedDelay = createSpeedDelay(animationSpeed)

  // Scenario 1: Simple direct request
  const simulateSimpleRequest = () => {
    const simpleRequestSteps = [
      {
        explanation: "Client sends GET request to Notes Service - basic synchronous HTTP request",
        duration: 2000,
        action: async () => {
          addLog('Client sends GET request', 'request')
          const requestMsg = {
            id: Date.now(),
            from: 'client',
            to: 'notes-service',
            type: 'http',
            label: 'GET /notes',
            path: [{ x: 20, y: 30 }, { x: 50, y: 30 }]
          }
          setMessages([requestMsg])
          await speedDelay(500)
        }
      },
      {
        explanation: "Notes Service processes the request - single service handles everything (~25ms)",
        duration: 2000,
        action: async () => {
          addLog('Notes service processing...', 'info')
          await speedDelay(500)
        }
      },
      {
        explanation: "Notes Service responds immediately with data - point-to-point communication is fast!",
        duration: 2000,
        action: async () => {
          addLog('Response sent (25ms)', 'success')
          const responseMsg = {
            id: Date.now(),
            from: 'notes-service',
            to: 'client',
            type: 'http',
            label: '200 OK',
            path: [{ x: 50, y: 30 }, { x: 20, y: 30 }],
            success: true
          }
          setMessages(prev => [...prev, responseMsg])
          await speedDelay(500)
        }
      },
      {
        explanation: "Request complete! Total latency: ~25ms for simple request-response pattern",
        duration: 2000,
        action: async () => {
          await speedDelay(500)
          setMessages([])
        }
      }
    ]

    stepControl.loadScenario('Simple Request-Response', simpleRequestSteps)
  }

  // Scenario 2: Cascade/Chain request (Client -> Notes -> Tags)
  const simulateCascadeRequest = () => {
    const cascadeRequestSteps = [
      {
        explanation: "Client requests note with tags - this triggers a cascade of sequential service calls",
        duration: 2000,
        action: async () => {
          addLog('Client requests note with tags', 'request')
          const clientToNotes = {
            id: Date.now(),
            from: 'client',
            to: 'notes-service',
            type: 'http',
            label: 'GET /notes/123?includeTags=true',
            path: [{ x: 20, y: 30 }, { x: 50, y: 30 }]
          }
          setMessages([clientToNotes])
          await speedDelay(500)
        }
      },
      {
        explanation: "Notes Service must call Tags Service synchronously to get tag data - this adds latency!",
        duration: 2000,
        action: async () => {
          addLog('Notes service calls Tags service (SYNC)', 'info')
          const notesToTags = {
            id: Date.now() + 1,
            from: 'notes-service',
            to: 'tags-service',
            type: 'http',
            label: 'GET /tags?noteId=123',
            path: [{ x: 50, y: 30 }, { x: 80, y: 30 }]
          }
          setMessages(prev => [...prev, notesToTags])
          await speedDelay(500)
        }
      },
      {
        explanation: "Tags Service responds with tag data (~15ms) - Notes Service is blocked waiting for this",
        duration: 2000,
        action: async () => {
          addLog('Tags service responds (15ms)', 'info')
          const tagsToNotes = {
            id: Date.now() + 2,
            from: 'tags-service',
            to: 'notes-service',
            type: 'http',
            label: '200 OK ["work", "urgent"]',
            path: [{ x: 80, y: 30 }, { x: 50, y: 30 }],
            success: true
          }
          setMessages(prev => [...prev, tagsToNotes])
          await speedDelay(500)
        }
      },
      {
        explanation: "Notes Service merges note + tag data and sends final response to client",
        duration: 2000,
        action: async () => {
          addLog('Notes service merges data and responds', 'success')
          const notesToClient = {
            id: Date.now() + 3,
            from: 'notes-service',
            to: 'client',
            type: 'http',
            label: '200 OK {note + tags}',
            path: [{ x: 50, y: 30 }, { x: 20, y: 30 }],
            success: true
          }
          setMessages(prev => [...prev, notesToClient])
          await speedDelay(500)
        }
      },
      {
        explanation: "Cascade complete! Total latency: ~150ms. Sequential calls sum up - each service waits for the next",
        duration: 2000,
        action: async () => {
          addLog('Total latency: 150ms (sequential)', 'info')
          await speedDelay(500)
          setMessages([])
        }
      }
    ]

    stepControl.loadScenario('Cascade Request (Sequential)', cascadeRequestSteps)
  }

  // Scenario 3: Parallel requests
  const simulateParallelRequests = () => {
    const parallelRequestsSteps = [
      {
        explanation: "Client requests note with full metadata (tags + author info)",
        duration: 2000,
        action: async () => {
          addLog('Client requests note with metadata', 'request')
          const clientToNotes = {
            id: Date.now(),
            from: 'client',
            to: 'notes-service',
            type: 'http',
            label: 'GET /notes/456/full',
            path: [{ x: 20, y: 30 }, { x: 50, y: 30 }]
          }
          setMessages([clientToNotes])
          await speedDelay(500)
        }
      },
      {
        explanation: "Notes Service makes PARALLEL calls to both Tags and User services simultaneously - this is key!",
        duration: 2500,
        action: async () => {
          addLog('Notes service makes parallel calls', 'info')
          const notesToTags = {
            id: Date.now() + 1,
            from: 'notes-service',
            to: 'tags-service',
            type: 'http',
            label: 'GET /tags?noteId=456',
            path: [{ x: 50, y: 30 }, { x: 80, y: 50 }]
          }
          const notesToUser = {
            id: Date.now() + 2,
            from: 'notes-service',
            to: 'user-service',
            type: 'http',
            label: 'GET /users/author',
            path: [{ x: 50, y: 30 }, { x: 80, y: 10 }]
          }
          setMessages(prev => [...prev, notesToTags, notesToUser])
          await speedDelay(500)
        }
      },
      {
        explanation: "Both services respond - total wait time is max(tags, user), NOT the sum. Much faster than sequential!",
        duration: 2000,
        action: async () => {
          addLog('Both services respond (waiting for slowest)', 'info')
          const tagsToNotes = {
            id: Date.now() + 3,
            from: 'tags-service',
            to: 'notes-service',
            type: 'http',
            label: '200 OK',
            path: [{ x: 80, y: 50 }, { x: 50, y: 30 }],
            success: true
          }
          const userToNotes = {
            id: Date.now() + 4,
            from: 'user-service',
            to: 'notes-service',
            type: 'http',
            label: '200 OK',
            path: [{ x: 80, y: 10 }, { x: 50, y: 30 }],
            success: true
          }
          setMessages(prev => [...prev, tagsToNotes, userToNotes])
          await speedDelay(500)
        }
      },
      {
        explanation: "Notes Service aggregates all data (note + tags + author) and sends complete response",
        duration: 2000,
        action: async () => {
          addLog('Notes service aggregates and responds', 'success')
          const notesToClient = {
            id: Date.now() + 5,
            from: 'notes-service',
            to: 'client',
            type: 'http',
            label: '200 OK {note + tags + author}',
            path: [{ x: 50, y: 30 }, { x: 20, y: 30 }],
            success: true
          }
          setMessages(prev => [...prev, notesToClient])
          await speedDelay(500)
        }
      },
      {
        explanation: "Parallel requests complete! Total latency: ~120ms. Faster than 150ms sequential because calls ran concurrently",
        duration: 2000,
        action: async () => {
          addLog('Total latency: 120ms (parallel is faster!)', 'success')
          await speedDelay(500)
          setMessages([])
        }
      }
    ]

    stepControl.loadScenario('Parallel Requests (Concurrent)', parallelRequestsSteps)
  }

  // Scenario 4: Timeout/Error handling
  const simulateTimeout = () => {
    const timeoutSteps = [
      {
        explanation: "Tags Service becomes slow/unresponsive - simulating a real-world service degradation",
        duration: 2000,
        action: async () => {
          setTagsServiceStatus('down')
          addLog('⚠️ Tags service is slow/unresponsive', 'warning')
          await speedDelay(500)
        }
      },
      {
        explanation: "Client sends request for notes with tags, unaware of the downstream service issue",
        duration: 2000,
        action: async () => {
          addLog('Client sends request', 'request')
          const clientToNotes = {
            id: Date.now(),
            from: 'client',
            to: 'notes-service',
            type: 'http',
            label: 'GET /notes/789?includeTags=true',
            path: [{ x: 20, y: 30 }, { x: 50, y: 30 }]
          }
          setMessages([clientToNotes])
          await speedDelay(500)
        }
      },
      {
        explanation: "Notes Service attempts to call the unresponsive Tags Service - waiting for response...",
        duration: 2000,
        action: async () => {
          addLog('Notes service calls Tags service...', 'info')
          const notesToTags = {
            id: Date.now() + 1,
            from: 'notes-service',
            to: 'tags-service',
            type: 'http',
            label: 'GET /tags?noteId=789',
            path: [{ x: 50, y: 30 }, { x: 80, y: 30 }]
          }
          setMessages(prev => [...prev, notesToTags])
          await speedDelay(500)
        }
      },
      {
        explanation: "Timeout exceeded! Request to Tags Service failed. Resilience pattern activates fallback strategy",
        duration: 2500,
        action: async () => {
          addLog('❌ Tags service timeout (5000ms exceeded)', 'error')
          addLog('Notes service applies fallback strategy', 'warning')
          await speedDelay(500)
        }
      },
      {
        explanation: "Notes Service returns partial data (notes without tags) rather than failing completely - graceful degradation!",
        duration: 2000,
        action: async () => {
          addLog('Returning note without tags', 'warning')
          const notesToClient = {
            id: Date.now() + 2,
            from: 'notes-service',
            to: 'client',
            type: 'http',
            label: '200 OK (partial data)',
            path: [{ x: 50, y: 30 }, { x: 20, y: 30 }],
            success: true
          }
          setMessages(prev => [...prev, notesToClient])
          await speedDelay(500)
        }
      },
      {
        explanation: "Timeout scenario complete! Tags Service recovers. Fallback strategy prevented total failure and maintained availability",
        duration: 2000,
        action: async () => {
          await speedDelay(500)
          setMessages([])
          setTagsServiceStatus('healthy')
          addLog('Tags service recovered', 'success')
          await speedDelay(500)
        }
      }
    ]

    stepControl.loadScenario('Timeout & Fallback Strategy', timeoutSteps)
  }

  return (
    <>
      <div className="container">
        <div className="pattern-layout">
          <div className="pattern-sidebar">
            <div className="control-panel panel">
              <h3>🎮 Control Panel</h3>
              <div className="scenarios">
                <h4>Scenarios</h4>
                <div className="button-grid">
                  <button onClick={simulateSimpleRequest} className="scenario-btn success">
                    ✅ Simple Request
                    <span className="scenario-desc">Basic request-response</span>
                  </button>

                  <button onClick={simulateCascadeRequest} className="scenario-btn info">
                    🔗 Cascade Request
                    <span className="scenario-desc">Sequential service calls</span>
                  </button>

                  <button onClick={simulateParallelRequests} className="scenario-btn warning">
                    ⚡ Parallel Requests
                    <span className="scenario-desc">Concurrent calls (faster)</span>
                  </button>

                  <button onClick={simulateTimeout} className="scenario-btn error">
                    ⏱️ Timeout Handling
                    <span className="scenario-desc">Fallback on failure</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pattern-main">
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

            <div className="architecture">
              <ServiceBox
                name="Client"
                type="client"
                position={{ x: 20, y: 30 }}
                icon="👤"
                details="Makes HTTP requests"
              />

              <ServiceBox
                name="Notes Service"
                type="service"
                position={{ x: 50, y: 30 }}
                icon="📝"
                details="Orchestrates requests"
              />

              <ServiceBox
                name="Tags Service"
                type="service"
                position={{ x: 80, y: 50 }}
                icon="🏷️"
                status={tagsServiceStatus}
                details="Manages tags"
              />

              <ServiceBox
                name="User Service"
                type="service"
                position={{ x: 80, y: 10 }}
                icon="👥"
                details="User metadata"
              />

              <AnimatePresence>
                {messages.map(msg => (
                  <MessageFlow key={msg.id} message={msg} />
                ))}
              </AnimatePresence>
            </div>

            <footer className="footer">
              <div className="legend">
                <div className="legend-item">
                  <span className="legend-color http"></span>
                  <span>HTTP Request/Response (Sync)</span>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>

      <InfoTabs
        cacheData={{}}
        queueMessages={[]}
        logs={logs}
        onClear={() => {
          clearLogs()
          setMessages([])
        }}
      />
    </>
  )
}
