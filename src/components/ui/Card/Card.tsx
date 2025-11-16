import { memo, type HTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import './Card.css'

export type CardVariant = 'default' | 'glass' | 'elevated'

export type CardPadding = 'none' | 'small' | 'medium' | 'large'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Visual style variant of the card
   * @default 'default'
   */
  variant?: CardVariant

  /**
   * Padding size inside the card
   * @default 'medium'
   */
  padding?: CardPadding

  /**
   * Whether the card should have hover effects
   * @default false
   */
  hoverable?: boolean

  /**
   * Whether the card is in selected state
   * @default false
   */
  selected?: boolean

  /**
   * Whether to animate the card with Framer Motion
   * @default false
   */
  animated?: boolean

  /**
   * Content to display inside the card
   */
  children?: React.ReactNode
}

/**
 * Card component for displaying content in a contained box
 *
 * @example
 * ```tsx
 * // Basic card
 * <Card>Content here</Card>
 *
 * // Glass effect card with hover
 * <Card variant="glass" hoverable onClick={handleClick}>
 *   Interactive content
 * </Card>
 *
 * // Selected card with custom padding
 * <Card selected padding="large">
 *   Selected item
 * </Card>
 * ```
 */
function Card({
  variant = 'default',
  padding = 'medium',
  hoverable = false,
  selected = false,
  animated = false,
  className = '',
  children,
  onClick,
  ...props
}: CardProps) {
  const classNames = [
    'ui-card',
    `ui-card--${variant}`,
    `ui-card--padding-${padding}`,
    hoverable && 'ui-card--hoverable',
    selected && 'ui-card--selected',
    onClick && 'ui-card--clickable',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const Component = animated ? motion.div : 'div'
  const motionProps = animated
    ? {
        whileHover: hoverable && !selected ? { scale: 1.02 } : undefined,
        whileTap: onClick && !selected ? { scale: 0.98 } : undefined,
      }
    : {}

  return (
    <Component className={classNames} onClick={onClick} {...motionProps} {...props}>
      {children}
    </Component>
  )
}

export default memo(Card)
