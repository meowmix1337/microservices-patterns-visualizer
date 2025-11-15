import { memo, type HTMLAttributes } from 'react'
import './Badge.css'

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'custom'

export type BadgeSize = 'small' | 'medium'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Visual style variant of the badge
   * @default 'neutral'
   */
  variant?: BadgeVariant

  /**
   * Size of the badge
   * @default 'medium'
   */
  size?: BadgeSize

  /**
   * Custom background color (only used when variant is 'custom')
   */
  backgroundColor?: string

  /**
   * Custom text color (only used when variant is 'custom')
   */
  color?: string

  /**
   * Content to display inside the badge
   */
  children?: React.ReactNode
}

/**
 * Badge component for displaying labels, tags, and status indicators
 *
 * @example
 * ```tsx
 * // Success badge
 * <Badge variant="success">Active</Badge>
 *
 * // Custom colored badge
 * <Badge variant="custom" backgroundColor="#ff006e" color="#ffffff">
 *   Custom
 * </Badge>
 *
 * // Small badge
 * <Badge size="small" variant="info">New</Badge>
 * ```
 */
function Badge({
  variant = 'neutral',
  size = 'medium',
  backgroundColor,
  color,
  className = '',
  style,
  children,
  ...props
}: BadgeProps) {
  const classNames = [
    'ui-badge',
    `ui-badge--${variant}`,
    `ui-badge--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const customStyle =
    variant === 'custom'
      ? {
          ...style,
          backgroundColor,
          color,
        }
      : style

  return (
    <span className={classNames} style={customStyle} {...props}>
      {children}
    </span>
  )
}

export default memo(Badge)
