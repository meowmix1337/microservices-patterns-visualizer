import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './CommandPalette.css'
import { patterns } from '../patterns/patternRegistry'

export default function CommandPalette({ isOpen, onClose, onSelectPattern, selectedPattern }) {
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)

  const filteredPatterns = patterns.filter(pattern =>
    pattern.name.toLowerCase().includes(search.toLowerCase()) ||
    pattern.description.toLowerCase().includes(search.toLowerCase()) ||
    pattern.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
  )

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
      setSearch('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  useEffect(() => {
    setSelectedIndex(0)
  }, [search])

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev + 1) % filteredPatterns.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev - 1 + filteredPatterns.length) % filteredPatterns.length)
    } else if (e.key === 'Enter' && filteredPatterns[selectedIndex]) {
      e.preventDefault()
      onSelectPattern(filteredPatterns[selectedIndex].id)
      onClose()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="command-palette-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="command-palette"
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="command-palette-header">
            <span className="search-icon-large">🔍</span>
            <input
              ref={inputRef}
              type="text"
              className="command-palette-input"
              placeholder="Search patterns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="close-btn" onClick={onClose} title="Close (Esc)">
              ✕
            </button>
          </div>

          <div className="command-palette-results">
            {filteredPatterns.length === 0 ? (
              <div className="no-results">
                <span className="no-results-icon">🔍</span>
                <p>No patterns found</p>
                <span className="no-results-hint">Try different keywords</span>
              </div>
            ) : (
              filteredPatterns.map((pattern, index) => (
                <button
                  key={pattern.id}
                  className={`palette-pattern-item ${index === selectedIndex ? 'selected' : ''} ${selectedPattern === pattern.id ? 'current' : ''}`}
                  onClick={() => {
                    onSelectPattern(pattern.id)
                    onClose()
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="palette-pattern-main">
                    <span className="palette-pattern-icon" style={{ color: pattern.color }}>
                      {pattern.icon}
                    </span>
                    <div className="palette-pattern-info">
                      <div className="palette-pattern-header">
                        <span className="palette-pattern-name">{pattern.name}</span>
                        {selectedPattern === pattern.id && (
                          <span className="current-badge">Current</span>
                        )}
                      </div>
                      <p className="palette-pattern-description">{pattern.description}</p>
                    </div>
                  </div>
                  <div className="palette-pattern-meta">
                    <span className={`difficulty-badge difficulty-${pattern.difficulty}`}>
                      {pattern.difficulty}
                    </span>
                    <div className="palette-pattern-tags">
                      {pattern.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="palette-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="command-palette-footer">
            <div className="keyboard-hints">
              <span className="hint">
                <kbd>↑↓</kbd> Navigate
              </span>
              <span className="hint">
                <kbd>↵</kbd> Select
              </span>
              <span className="hint">
                <kbd>Esc</kbd> Close
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
