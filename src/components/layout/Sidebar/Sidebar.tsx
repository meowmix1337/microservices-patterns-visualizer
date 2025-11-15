import { useState } from 'react'
import { motion } from 'framer-motion'
import './Sidebar.css'
import { patterns, PATTERN_CATEGORIES, type PatternCategory, type Pattern } from '../../../patterns/patternRegistry'

export interface SidebarProps {
  selectedPattern: string
  onSelectPattern: (patternId: string) => void
  onOpenCommandPalette: () => void
}

type ExpandedCategories = Record<PatternCategory, boolean>

export default function Sidebar({ selectedPattern, onSelectPattern, onOpenCommandPalette }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false)
  const [expandedCategories, setExpandedCategories] = useState<ExpandedCategories>({
    [PATTERN_CATEGORIES.ASYNC]: true,
    [PATTERN_CATEGORIES.SYNC]: true,
    [PATTERN_CATEGORIES.HYBRID]: false,
    [PATTERN_CATEGORIES.RESILIENCE]: false,
  })

  const categoryNames: Record<PatternCategory, string> = {
    [PATTERN_CATEGORIES.ASYNC]: 'Async',
    [PATTERN_CATEGORIES.SYNC]: 'Sync',
    [PATTERN_CATEGORIES.HYBRID]: 'Hybrid',
    [PATTERN_CATEGORIES.RESILIENCE]: 'Resilience',
  }

  const categoryIcons: Record<PatternCategory, string> = {
    [PATTERN_CATEGORIES.ASYNC]: '⚡',
    [PATTERN_CATEGORIES.SYNC]: '↔️',
    [PATTERN_CATEGORIES.HYBRID]: '🔀',
    [PATTERN_CATEGORIES.RESILIENCE]: '🛡️',
  }

  const groupedPatterns = patterns.reduce<Record<PatternCategory, Pattern[]>>((acc, pattern) => {
    if (!acc[pattern.category]) {
      acc[pattern.category] = []
    }
    acc[pattern.category].push(pattern)
    return acc
  }, {} as Record<PatternCategory, Pattern[]>)

  const toggleCategory = (category: PatternCategory): void => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  return (
    <motion.div
      className="sidebar"
      animate={{ width: isCollapsed ? '60px' : '280px' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div className="sidebar-header">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="sidebar-title"
          >
            Patterns
          </motion.div>
        )}
        <button
          className="sidebar-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? '»' : '«'}
        </button>
      </div>

      <button
        className="command-palette-trigger"
        onClick={onOpenCommandPalette}
        title="Open command palette (Cmd/Ctrl + K)"
      >
        <span className="search-icon">🔍</span>
        {!isCollapsed && <span className="search-text">Search patterns...</span>}
        {!isCollapsed && <kbd className="kbd">⌘K</kbd>}
      </button>

      <div className="sidebar-content">
        {Object.entries(groupedPatterns).map(([category, categoryPatterns]) => (
          <div key={category} className="sidebar-category">
            <button
              className="category-header"
              onClick={() => toggleCategory(category as PatternCategory)}
              title={isCollapsed ? categoryNames[category as PatternCategory] : ''}
            >
              <span className="category-icon">{categoryIcons[category as PatternCategory]}</span>
              {!isCollapsed && (
                <>
                  <span className="category-name">{categoryNames[category as PatternCategory]}</span>
                  <span className="category-chevron">
                    {expandedCategories[category as PatternCategory] ? '▼' : '▶'}
                  </span>
                </>
              )}
            </button>

            {(expandedCategories[category as PatternCategory] || isCollapsed) && (
              <div className="category-patterns">
                {categoryPatterns.map((pattern) => (
                  <button
                    key={pattern.id}
                    className={`pattern-item ${selectedPattern === pattern.id ? 'active' : ''}`}
                    onClick={() => onSelectPattern(pattern.id)}
                    title={isCollapsed ? pattern.name : pattern.description}
                    style={{
                      borderLeftColor: selectedPattern === pattern.id ? pattern.color : 'transparent'
                    }}
                  >
                    <span className="pattern-icon">{pattern.icon}</span>
                    {!isCollapsed && (
                      <span className="pattern-name">{pattern.name}</span>
                    )}
                    {!isCollapsed && selectedPattern === pattern.id && (
                      <motion.div
                        className="active-indicator"
                        layoutId="active-pattern"
                        style={{ background: pattern.color }}
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  )
}
