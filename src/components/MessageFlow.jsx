import { memo } from 'react'
import { motion } from 'framer-motion'
import './MessageFlow.css'
import { COLORS } from '../constants/colors'

function MessageFlow({ message }) {
  const getColor = () => {
    if (message.success === false) return COLORS.error
    if (message.success === true) return COLORS.success

    return COLORS[message.type] || COLORS.default
  }

  const pathPoints = message.path.map(p => `${p.x}% ${p.y}%`).join(', ')

  return (
    <>
      <motion.div
        className="message-path"
        style={{
          clipPath: `polygon(${pathPoints})`,
          background: `linear-gradient(90deg, transparent, ${getColor()}, transparent)`,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        exit={{ opacity: 0 }}
      />

      <motion.div
        className="message-dot"
        style={{
          background: getColor(),
          boxShadow: `0 0 20px ${getColor()}`,
        }}
        initial={{
          left: `${message.path[0].x}%`,
          top: `${message.path[0].y}%`,
          scale: 0,
        }}
        animate={{
          left: message.path.map(p => `${p.x}%`),
          top: message.path.map(p => `${p.y}%`),
          scale: [0, 1, 1, 0.8],
        }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{
          duration: 0.8,
          times: [0, 0.1, 0.9, 1],
          ease: "easeInOut"
        }}
      >
        <div className="message-label">{message.label}</div>
      </motion.div>
    </>
  )
}

export default memo(MessageFlow)
