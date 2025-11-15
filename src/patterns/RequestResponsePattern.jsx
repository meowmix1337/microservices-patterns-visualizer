import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import ServiceBox from '../components/ServiceBox'
import MessageFlow from '../components/MessageFlow'
import InfoTabs from '../components/InfoTabs'
import { useLogs } from '../hooks/useLogs'
import { delay } from '../utils/delay'

export default function RequestResponsePattern({ animationSpeed }) {
  const [messages, setMessages] = useState([])
  const { logs, addLog, clearLogs } = useLogs()
  const [runCounter, setRunCounter] = useState(0)
  const [tagsServiceStatus, setTagsServiceStatus] = useState('healthy')

  const speedDelay = (ms) => delay(ms / animationSpeed)

  const startNewRun = (scenarioName) => {
    const newRunNumber = runCounter + 1
    setRunCounter(newRunNumber)
    clearLogs()
    setMessages([])
    addLog(`━━━ Run #${newRunNumber}: ${scenarioName} ━━━`, 'info')
  }

  // Scenario 1: Simple direct request
  const simulateSimpleRequest = async () => {
    startNewRun('Simple Request')
    await speedDelay(300)
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

    await speedDelay(800)
    addLog('Notes service processing...', 'info')

    await speedDelay(500)
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

    await speedDelay(1000)
    setMessages([])
  }

  // Scenario 2: Cascade/Chain request (Client -> Notes -> Tags)
  const simulateCascadeRequest = async () => {
    startNewRun('Cascade Request')
    await speedDelay(300)
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

    await speedDelay(800)
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

    await speedDelay(800)
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
    addLog('Total latency: 150ms (sequential)', 'info')

    await speedDelay(1000)
    setMessages([])
  }

  // Scenario 3: Parallel requests
  const simulateParallelRequests = async () => {
    startNewRun('Parallel Requests')
    await speedDelay(300)
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

    await speedDelay(800)
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

    await speedDelay(900)
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
    addLog('Total latency: 120ms (parallel is faster!)', 'success')

    await speedDelay(1000)
    setMessages([])
  }

  // Scenario 4: Timeout/Error handling
  const simulateTimeout = async () => {
    startNewRun('Request Timeout')
    await speedDelay(300)
    setTagsServiceStatus('down')
    addLog('⚠️ Tags service is slow/unresponsive', 'warning')

    await speedDelay(300)
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

    await speedDelay(800)
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

    await speedDelay(1500)
    addLog('❌ Tags service timeout (5000ms exceeded)', 'error')
    addLog('Notes service applies fallback strategy', 'warning')

    await speedDelay(500)
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

    await speedDelay(1000)
    setMessages([])
    setTagsServiceStatus('healthy')
    addLog('Tags service recovered', 'success')
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
