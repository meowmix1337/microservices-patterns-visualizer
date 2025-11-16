import { memo, type SelectHTMLAttributes, type ReactNode } from 'react'
import './Select.css'

export interface SelectOption<T = string> {
  /**
   * The value of the option
   */
  value: T

  /**
   * The label to display for the option
   */
  label: string

  /**
   * Optional icon to display before the label (emoji or text)
   */
  icon?: string

  /**
   * Whether this option is disabled
   */
  disabled?: boolean
}

export interface SelectProps<T = string>
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange'> {
  /**
   * Label text to display above the select
   */
  label?: string

  /**
   * Array of options to display
   */
  options: SelectOption<T>[]

  /**
   * Current selected value
   */
  value: T

  /**
   * Callback when selection changes
   */
  onChange: (value: T, event: React.ChangeEvent<HTMLSelectElement>) => void

  /**
   * Placeholder text when no option is selected
   */
  placeholder?: string

  /**
   * Helper text to display below the select
   */
  helperText?: string

  /**
   * Error message to display
   */
  error?: string
}

/**
 * Select component for choosing from a list of options
 *
 * @example
 * ```tsx
 * // Basic select
 * <Select
 *   label="Status"
 *   value={status}
 *   onChange={(value) => setStatus(value)}
 *   options={[
 *     { value: 'active', label: 'Active' },
 *     { value: 'inactive', label: 'Inactive' }
 *   ]}
 * />
 *
 * // Select with icons
 * <Select
 *   label="Redis Status"
 *   value={redisStatus}
 *   onChange={(value) => setRedisStatus(value)}
 *   options={[
 *     { value: 'healthy', label: 'Healthy', icon: '✅' },
 *     { value: 'down', label: 'Down', icon: '🔴' }
 *   ]}
 * />
 * ```
 */
function Select<T extends string = string>({
  label,
  options,
  value,
  onChange,
  placeholder,
  helperText,
  error,
  className = '',
  id,
  disabled,
  ...props
}: SelectProps<T>) {
  const selectId = id || `select-${label?.replace(/\s+/g, '-').toLowerCase()}`

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value as T, event)
  }

  return (
    <div className={`ui-select-container ${className}`}>
      {label && (
        <label htmlFor={selectId} className="ui-select-label">
          {label}
        </label>
      )}
      <select
        id={selectId}
        value={value}
        onChange={handleChange}
        className={`ui-select ${error ? 'ui-select--error' : ''}`}
        disabled={disabled}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={String(option.value)} value={option.value} disabled={option.disabled}>
            {option.icon ? `${option.icon} ${option.label}` : option.label}
          </option>
        ))}
      </select>
      {(helperText || error) && (
        <span className={`ui-select-helper ${error ? 'ui-select-helper--error' : ''}`}>
          {error || helperText}
        </span>
      )}
    </div>
  )
}

export default memo(Select) as typeof Select
