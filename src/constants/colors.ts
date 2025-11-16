/**
 * Color constants for consistent theming throughout the application
 */

export interface Position {
  x: number
  y: number
}

export interface Colors {
  // Service types
  client: string
  service: string
  cache: string
  queue: string
  // Message types
  http: string
  event: string
  // States
  success: string
  error: string
  warning: string
  default: string
}

export interface Positions {
  client: Position
  notesService: Position
  redis: Position
  tagsService: Position
  kafka: Position
}

export interface Timing {
  messageDelay: number
  cacheCheckDelay: number
  syncCallDelay: number
  updateDelay: number
  responseDelay: number
  serviceRecoveryDelay: number
}

export const COLORS: Colors = {
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

export const POSITIONS: Positions = {
  client: { x: 10, y: 50 },
  notesService: { x: 25, y: 50 },
  redis: { x: 50, y: 35 },
  tagsService: { x: 75, y: 50 },
  kafka: { x: 50, y: 65 },
}

export const TIMING: Timing = {
  messageDelay: 500,
  cacheCheckDelay: 500,
  syncCallDelay: 800,
  updateDelay: 500,
  responseDelay: 1000,
  serviceRecoveryDelay: 1500,
}

// Grid System Configuration
export interface GridPosition {
  col: number
  row: number
}

export interface GridConfig {
  columns: number
  rows: number
  marginX: number
  marginY: number
}

export const GRID_CONFIG: GridConfig = {
  columns: 12,
  rows: 8,
  marginX: 5,
  marginY: 8
}

/**
 * Converts grid coordinates to percentage positions
 * @param col - Column number (0-indexed, 0 to GRID_CONFIG.columns-1)
 * @param row - Row number (0-indexed, 0 to GRID_CONFIG.rows-1)
 * @returns Position with x,y as percentages
 */
export function gridToPosition(col: number, row: number): Position {
  const cellWidth = (100 - 2 * GRID_CONFIG.marginX) / GRID_CONFIG.columns
  const cellHeight = (100 - 2 * GRID_CONFIG.marginY) / GRID_CONFIG.rows

  return {
    x: GRID_CONFIG.marginX + (col + 0.5) * cellWidth,
    y: GRID_CONFIG.marginY + (row + 0.5) * cellHeight
  }
}

/**
 * Pre-defined grid positions for common service placements
 * These can be used as references for consistent layouts
 */
export const GRID_POSITIONS = {
  // AsyncMicroservices pattern grid positions
  client: gridToPosition(1, 4),
  notesService: gridToPosition(3, 4),
  redis: gridToPosition(6, 2),
  tagsService: gridToPosition(9, 4),
  kafka: gridToPosition(6, 6)
}
