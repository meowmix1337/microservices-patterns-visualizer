import { memo } from 'react'
import { motion } from 'framer-motion'
import './ServiceBox.css'
import { COLORS, type Position } from '../constants/colors'

export type ServiceType = 'client' | 'service' | 'cache' | 'queue'
export type ServiceStatus = 'healthy' | 'down'

export interface ServiceBoxProps {
  name: string
  type: ServiceType
  position: Position
  icon: string
  status?: ServiceStatus
  details?: string
}

function ServiceBox({ name, type, position, icon, status = 'healthy', details }: ServiceBoxProps) {
  const getColor = (): string => {
    if (status === 'down') return COLORS.error
    return COLORS[type] || COLORS.default
  }

  return (
    <motion.div
      className="service-box"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        borderColor: getColor(),
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="service-icon">{icon}</div>
      <div className="service-name">{name}</div>
      {details && <div className="service-details">{details}</div>}
      {status !== 'healthy' && (
        <motion.div
          className="status-badge"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          {status === 'down' ? '🔴 DOWN' : '⚠️'}
        </motion.div>
      )}
    </motion.div>
  )
}

export default memo(ServiceBox)
