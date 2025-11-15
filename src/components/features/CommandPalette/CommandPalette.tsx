import { useState, useEffect, useRef, type KeyboardEvent, type ChangeEvent, type MouseEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './CommandPalette.css'
import { patterns, type Pattern } from '../../../patterns/patternRegistry'

export interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onSelectPattern: (patternId: string) => void
  selectedPattern: string
}

export default function CommandPalette({ isOpen, onClose, onSelectPattern, selectedPattern }: CommandPaletteProps) {
  const [search, setSearch] = useState<string>('')
  const [selectedIndex, setSelectedIndex] = useState<number>(0)
  const inputRef = useRef<HTMLInputElement>(null)

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

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
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

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearch(e.target.value)
  }

  const handlePatternClick = (patternId: string): void => {
    onSelectPattern(patternId)
    onClose()
  }

  const handleMouseEnter = (index: number): void => {
    setSelectedIndex(index)
  }

  const handleOverlayClick = (): void => {
    onClose()
  }

  const handlePaletteClick = (e: MouseEvent<HTMLDivElement>): void => {
    e.stopPropagation()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="command-palette-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleOverlayClick}
      >
        <motion.div
          className="command-palette"
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2 }}
          onClick={handlePaletteClick}
        >
          <div className="command-palette-header">
            <span className="search-icon-large">🔍</span>
            <input
              ref={inputRef}
              type="text"
              className="command-palette-input"
              placeholder="Search patterns..."
              value={search}
              onChange={handleSearchChange}
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
                  onClick={() => handlePatternClick(pattern.id)}
                  onMouseEnter={() => handleMouseEnter(index)}
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
