import './StepByStepControls.css'

export default function StepByStepControls({
  currentStep,
  totalSteps,
  stepExplanation,
  onNext,
  onPrevious,
  onToggleAutoPlay,
  isAutoPlaying,
  isRunning
}) {
  if (!isRunning) return null

  return (
    <div className="step-controls panel">
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
        <button
          className="control-btn"
          onClick={onPrevious}
          disabled={currentStep === 1}
          title="Previous step (←)"
        >
          ← Prev
        </button>

        <button
          className={`control-btn play-btn ${isAutoPlaying ? 'playing' : ''}`}
          onClick={onToggleAutoPlay}
          title={isAutoPlaying ? 'Pause auto-play (Space)' : 'Start auto-play (Space)'}
        >
          {isAutoPlaying ? '⏸ Pause' : '▶ Play'}
        </button>

        <button
          className="control-btn"
          onClick={onNext}
          disabled={currentStep === totalSteps}
          title="Next step (→)"
        >
          Next →
        </button>
      </div>
    </div>
  )
}
