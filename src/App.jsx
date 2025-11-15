import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './App.css'
import Sidebar from './components/Sidebar'
import CommandPalette from './components/CommandPalette'
import PatternInfoModal from './components/PatternInfoModal'
import AsyncMicroservicesPattern from './patterns/AsyncMicroservicesPattern'
import RequestResponsePattern from './patterns/RequestResponsePattern'
import ComingSoonPattern from './components/ComingSoonPattern'
import { getPatternById } from './patterns/patternRegistry'
import { useTheme } from './contexts/ThemeContext'

function App() {
  const [selectedPattern, setSelectedPattern] = useState('async-microservices')
  const [animationSpeed, setAnimationSpeed] = useState(1)
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [showPatternInfo, setShowPatternInfo] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const currentPattern = getPatternById(selectedPattern)

  // Keyboard shortcut for command palette (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowCommandPalette(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const renderPattern = () => {
    switch (selectedPattern) {
      case 'async-microservices':
        return <AsyncMicroservicesPattern animationSpeed={animationSpeed} />
      case 'request-response':
        return <RequestResponsePattern animationSpeed={animationSpeed} />
      default:
        // For all placeholder patterns, use ComingSoonPattern with pattern data
        return (
          <ComingSoonPattern
            patternName={currentPattern?.name}
            patternIcon={currentPattern?.icon}
            patternDescription={currentPattern?.description}
          />
        )
    }
  }

  return (
    <div className="app">
      <Sidebar
        selectedPattern={selectedPattern}
        onSelectPattern={setSelectedPattern}
        onOpenCommandPalette={() => setShowCommandPalette(true)}
      />

      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onSelectPattern={setSelectedPattern}
        selectedPattern={selectedPattern}
      />

      <PatternInfoModal
        pattern={currentPattern}
        isOpen={showPatternInfo}
        onClose={() => setShowPatternInfo(false)}
      />

      <div className="app-main">
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
            </div>
          </div>
        </header>

        <div className="current-pattern-badge">
          <span className="pattern-badge-icon" style={{ color: currentPattern?.color }}>
            {currentPattern?.icon}
          </span>
          <span className="pattern-badge-name">{currentPattern?.name}</span>
          <span className="pattern-badge-desc">{currentPattern?.description}</span>
          <button
            className="pattern-info-btn"
            onClick={() => setShowPatternInfo(true)}
            title="View pattern details"
          >
            ℹ️
          </button>
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
    </div>
  )
}

export default App
