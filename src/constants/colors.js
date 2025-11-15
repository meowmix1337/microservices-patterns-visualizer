/**
 * Color constants for consistent theming throughout the application
 */

export const COLORS = {
  // Service types
  client: '#8b5cf6',
  service: '#3b82f6',
  cache: '#10b981',
  queue: '#f59e0b',

  // Message types
  http: '#3b82f6',
  event: '#f59e0b',

  // States
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  default: '#6b7280',
}

export const POSITIONS = {
  client: { x: 10, y: 50 },
  notesService: { x: 25, y: 50 },
  redis: { x: 50, y: 35 },
  tagsService: { x: 75, y: 50 },
  kafka: { x: 50, y: 65 },
}

export const TIMING = {
  messageDelay: 500,
  cacheCheckDelay: 500,
  syncCallDelay: 800,
  updateDelay: 500,
  responseDelay: 1000,
  serviceRecoveryDelay: 1500,
}
