import { motion, AnimatePresence, type MouseEvent } from 'framer-motion'
import { Button, Card } from '../../ui'
import type { Pattern } from '../../../patterns/patternRegistry'
import './PatternInfoModal.css'

export interface PatternInfoModalProps {
  pattern: Pattern | null
  isOpen: boolean
  onClose: () => void
}

export default function PatternInfoModal({ pattern, isOpen, onClose }: PatternInfoModalProps) {
  if (!isOpen || !pattern) return null

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
        >
          <Card
            variant="glass"
            padding="none"
            animated
            className="modal-content"
          >
            <div className="modal-header">
              <div className="modal-title-row">
                <span className="modal-icon" style={{ color: pattern.color }}>
                  {pattern.icon}
                </span>
                <h2 className="modal-title">{pattern.name}</h2>
                <Button
                  variant="ghost"
                  size="small"
                  onClick={onClose}
                  title="Close"
                  iconLeft="✕"
                  className="modal-close-btn"
                />
              </div>
              <p className="modal-description">{pattern.description}</p>
              <div className="modal-meta">
                <span className="difficulty-badge" data-difficulty={pattern.difficulty}>
                  {pattern.difficulty}
                </span>
                <span className="category-badge">{pattern.category}</span>
              </div>
            </div>

            <div className="modal-body">
              {pattern.benefits && (
                <section className="modal-section">
                  <h3 className="section-title">✅ Benefits</h3>
                  <ul className="section-list">
                    {pattern.benefits.map((benefit, idx) => (
                      <li key={idx}>{benefit}</li>
                    ))}
                  </ul>
                </section>
              )}

              {pattern.tradeoffs && (
                <section className="modal-section">
                  <h3 className="section-title">⚖️ Trade-offs</h3>
                  <ul className="section-list">
                    {pattern.tradeoffs.map((tradeoff, idx) => (
                      <li key={idx}>{tradeoff}</li>
                    ))}
                  </ul>
                </section>
              )}

              {pattern.useCases && (
                <section className="modal-section">
                  <h3 className="section-title">💡 Use Cases</h3>
                  <ul className="section-list">
                    {pattern.useCases.map((useCase, idx) => (
                      <li key={idx}>{useCase}</li>
                    ))}
                  </ul>
                </section>
              )}

              {pattern.tags && pattern.tags.length > 0 && (
                <section className="modal-section">
                  <h3 className="section-title">🏷️ Tags</h3>
                  <div className="tags-container">
                    {pattern.tags.map((tag, idx) => (
                      <span key={idx} className="tag-badge">
                        {tag}
                      </span>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
