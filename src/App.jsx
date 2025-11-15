import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './App.css'
import PatternSelector from './components/PatternSelector'
import AsyncMicroservicesPattern from './patterns/AsyncMicroservicesPattern'
import RequestResponsePattern from './patterns/RequestResponsePattern'
import ComingSoonPattern from './components/ComingSoonPattern'
import { getPatternById } from './patterns/patternRegistry'
import { useTheme } from './contexts/ThemeContext'

function App() {
  const [selectedPattern, setSelectedPattern] = useState('async-microservices')
  const [animationSpeed, setAnimationSpeed] = useState(1)
  const [showPatternSelector, setShowPatternSelector] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const currentPattern = getPatternById(selectedPattern)

  const renderPattern = () => {
    switch (selectedPattern) {
      case 'async-microservices':
        return <AsyncMicroservicesPattern animationSpeed={animationSpeed} />
      case 'request-response':
        return <RequestResponsePattern animationSpeed={animationSpeed} />
      case 'saga-pattern':
        return (
          <ComingSoonPattern
            patternName="Saga Pattern"
            patternIcon="🔀"
            patternDescription="Distributed transaction management with compensating actions and choreography-based coordination"
          />
        )
      case 'cqrs':
        return (
          <ComingSoonPattern
            patternName="CQRS Pattern"
            patternIcon="📊"
            patternDescription="Command Query Responsibility Segregation with separate read and write models for optimal performance"
          />
        )
      case 'circuit-breaker':
        return (
          <ComingSoonPattern
            patternName="Circuit Breaker Pattern"
            patternIcon="🔌"
            patternDescription="Prevent cascading failures and improve system resilience with intelligent failure detection"
          />
        )
      default:
        return <AsyncMicroservicesPattern animationSpeed={animationSpeed} />
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div>
            <h1>🔄 Communication Patterns Visualizer</h1>
            <p>Interactive demonstrations of distributed system communication patterns</p>
          </div>
          <div className="header-controls">
            <div className="speed-control">
              <label>
                Speed: {animationSpeed}x
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.25"
                  value={animationSpeed}
                  onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                  className="slider-compact"
                  aria-label="Adjust global animation speed"
                />
              </label>
            </div>
            <button
              className="pattern-toggle-btn theme-toggle-btn"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={`Switch to ${theme === 'dark' ? 'Neo-Brutalism' : 'Dark'} theme`}
            >
              {theme === 'dark' ? '🎨 Brutalism' : '🌙 Dark'}
            </button>
            <button
              className="pattern-toggle-btn"
              onClick={() => setShowPatternSelector(!showPatternSelector)}
              aria-label="Toggle pattern selector"
            >
              {showPatternSelector ? '✕ Close' : '📚 Patterns'}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {showPatternSelector && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <PatternSelector
              selectedPattern={selectedPattern}
              onSelectPattern={(patternId) => {
                setSelectedPattern(patternId)
                setShowPatternSelector(false)
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="current-pattern-badge">
        <span className="pattern-badge-icon" style={{ color: currentPattern?.color }}>
          {currentPattern?.icon}
        </span>
        <span className="pattern-badge-name">{currentPattern?.name}</span>
        <span className="pattern-badge-desc">{currentPattern?.description}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedPattern}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderPattern()}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default App
