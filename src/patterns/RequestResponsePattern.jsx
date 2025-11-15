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

  const speedDelay = (ms) => delay(ms / animationSpeed)

  const startNewRun = (scenarioName) => {
    const newRunNumber = runCounter + 1
    setRunCounter(newRunNumber)
    clearLogs()
    setMessages([])
    addLog(`━━━ Run #${newRunNumber}: ${scenarioName} ━━━`, 'info')
  }

  const simulateRequest = async () => {
    startNewRun('Simple Request')
    await speedDelay(300)
    addLog('Client sends HTTP request', 'request')

    const requestMsg = {
      id: Date.now(),
      from: 'client',
      to: 'server',
      type: 'http',
      label: 'GET /api/data',
      path: [{ x: 25, y: 50 }, { x: 75, y: 50 }]
    }
    setMessages([requestMsg])

    await speedDelay(800)
    addLog('Server processing request...', 'info')

    await speedDelay(500)
    addLog('Server sends response', 'success')

    const responseMsg = {
      id: Date.now(),
      from: 'server',
      to: 'client',
      type: 'http',
      label: '200 OK',
      path: [{ x: 75, y: 50 }, { x: 25, y: 50 }],
      success: true
    }
    setMessages(prev => [...prev, responseMsg])

    await speedDelay(1000)
    setMessages([])
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
                  <button onClick={simulateRequest} className="scenario-btn success">
                    🔄 Simple Request
                    <span className="scenario-desc">Basic HTTP request-response</span>
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
                position={{ x: 25, y: 50 }}
                icon="👤"
                details="Makes HTTP requests"
              />

              <ServiceBox
                name="Server"
                type="service"
                position={{ x: 75, y: 50 }}
                icon="🖥️"
                details="Processes requests synchronously"
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
                  <span>HTTP Request/Response</span>
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
