import { Button, Card } from '../../ui'
import './StepByStepControls.css'

export interface StepByStepControlsProps {
  currentStep: number
  totalSteps: number
  stepExplanation: string
  onNext: () => void
  onPrevious: () => void
  onToggleAutoPlay: () => void
  isAutoPlaying: boolean
  isRunning: boolean
}

export default function StepByStepControls({
  currentStep,
  totalSteps,
  stepExplanation,
  onNext,
  onPrevious,
  onToggleAutoPlay,
  isAutoPlaying,
  isRunning
}: StepByStepControlsProps) {
  if (!isRunning) return null

  return (
    <Card variant="glass" padding="medium" className="step-controls">
      <div className="step-info">
        <div className="step-counter">
          Step {currentStep} of {totalSteps}
        </div>
        {stepExplanation && (
          <div className="step-explanation">
            {stepExplanation}
          </div>
        )}
      </div>

      <div className="control-buttons">
        <Button
          variant="secondary"
          size="medium"
          onClick={onPrevious}
          disabled={currentStep === 1}
          title="Previous step (←)"
          iconLeft="←"
        >
          Prev
        </Button>

        <Button
          variant={isAutoPlaying ? 'warning' : 'success'}
          size="medium"
          onClick={onToggleAutoPlay}
          title={isAutoPlaying ? 'Pause auto-play (Space)' : 'Start auto-play (Space)'}
          iconLeft={isAutoPlaying ? '⏸' : '▶'}
        >
          {isAutoPlaying ? 'Pause' : 'Play'}
        </Button>

        <Button
          variant="primary"
          size="medium"
          onClick={onNext}
          disabled={currentStep === totalSteps}
          title="Next step (→)"
          iconRight="→"
        >
          Next
        </Button>
      </div>
    </Card>
  )
}
