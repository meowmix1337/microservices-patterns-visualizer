import { memo, type InputHTMLAttributes } from 'react'
import './Slider.css'

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /**
   * Label text to display above the slider
   */
  label?: string

  /**
   * Minimum value
   * @default 0
   */
  min?: number

  /**
   * Maximum value
   * @default 100
   */
  max?: number

  /**
   * Step increment
   * @default 1
   */
  step?: number

  /**
   * Current value
   */
  value: number

  /**
   * Function to format the displayed value
   * @default (value) => value.toString()
   */
  formatValue?: (value: number) => string

  /**
   * Whether to show min/max labels below the slider
   * @default false
   */
  showLabels?: boolean

  /**
   * Custom label for minimum value
   */
  minLabel?: string

  /**
   * Custom label for maximum value
   */
  maxLabel?: string
}

/**
 * Slider component for selecting numeric values within a range
 *
 * @example
 * ```tsx
 * // Basic slider
 * <Slider
 *   label="Volume"
 *   value={volume}
 *   onChange={(e) => setVolume(parseFloat(e.target.value))}
 *   min={0}
 *   max={100}
 * />
 *
 * // Slider with custom formatting and labels
 * <Slider
 *   label="Animation Speed"
 *   value={speed}
 *   onChange={(e) => setSpeed(parseFloat(e.target.value))}
 *   min={0.5}
 *   max={3}
 *   step={0.25}
 *   formatValue={(v) => `${v}x`}
 *   showLabels
 *   minLabel="0.5x (Slower)"
 *   maxLabel="3x (Faster)"
 * />
 * ```
 */
function Slider({
  label,
  min = 0,
  max = 100,
  step = 1,
  value,
  formatValue = (v) => v.toString(),
  showLabels = false,
  minLabel,
  maxLabel,
  className = '',
  id,
  ...props
}: SliderProps) {
  const sliderId = id || `slider-${label?.replace(/\s+/g, '-').toLowerCase()}`

  return (
    <div className={`ui-slider-container ${className}`}>
      {label && (
        <label htmlFor={sliderId} className="ui-slider-label">
          {label}: <span className="ui-slider-value">{formatValue(value)}</span>
        </label>
      )}
      <input
        type="range"
        id={sliderId}
        min={min}
        max={max}
        step={step}
        value={value}
        className="ui-slider"
        {...props}
      />
      {showLabels && (minLabel || maxLabel) && (
        <div className="ui-slider-labels">
          <span className="ui-slider-label-min">{minLabel || min}</span>
          <span className="ui-slider-label-max">{maxLabel || max}</span>
        </div>
      )}
    </div>
  )
}

export default memo(Slider)
