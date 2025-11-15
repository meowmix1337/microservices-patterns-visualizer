import { memo, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import './Button.css'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'ghost'

export type ButtonSize = 'small' | 'medium' | 'large'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual style variant of the button
   * @default 'primary'
   */
  variant?: ButtonVariant

  /**
   * Size of the button
   * @default 'medium'
   */
  size?: ButtonSize

  /**
   * Icon to display before the button text
   */
  iconLeft?: ReactNode

  /**
   * Icon to display after the button text
   */
  iconRight?: ReactNode

  /**
   * Whether the button should take full width of its container
   * @default false
   */
  fullWidth?: boolean

  /**
   * Whether the button is in loading state
   * @default false
   */
  loading?: boolean

  /**
   * Content to display inside the button
   */
  children?: ReactNode
}

/**
 * Button component with consistent styling, animations, and variants
 *
 * @example
 * ```tsx
 * // Primary button
 * <Button variant="primary" onClick={handleClick}>Click Me</Button>
 *
 * // Success button with icon
 * <Button variant="success" iconLeft="✅">
 *   Save Changes
 * </Button>
 *
 * // Loading state
 * <Button loading disabled>Processing...</Button>
 * ```
 */
function Button({
  variant = 'primary',
  size = 'medium',
  iconLeft,
  iconRight,
  fullWidth = false,
  loading = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const classNames = [
    'ui-button',
    `ui-button--${variant}`,
    `ui-button--${size}`,
    fullWidth && 'ui-button--full-width',
    loading && 'ui-button--loading',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <motion.button
      className={classNames}
      disabled={disabled || loading}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      {...props}
    >
      {loading ? (
        <span className="ui-button__spinner" aria-label="Loading" />
      ) : (
        <>
          {iconLeft && <span className="ui-button__icon-left">{iconLeft}</span>}
          {children && <span className="ui-button__content">{children}</span>}
          {iconRight && <span className="ui-button__icon-right">{iconRight}</span>}
        </>
      )}
    </motion.button>
  )
}

export default memo(Button)
