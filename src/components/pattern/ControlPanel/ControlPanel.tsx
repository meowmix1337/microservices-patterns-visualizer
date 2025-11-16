import { memo, type ChangeEvent } from 'react'
import Button from '../../ui/Button'
import { Slider, Select, type SelectOption } from '../../ui/Input'
import './ControlPanel.css'

export type RedisStatus = 'healthy' | 'down'

export interface ControlPanelProps {
  onCacheHit: () => void
  onCacheMiss: () => void
  onAsyncUpdate: () => void
  onServiceFailure: () => void
  kafkaLag: number
  setKafkaLag: (lag: number) => void
  redisStatus: RedisStatus
  setRedisStatus: (status: RedisStatus) => void
  animationSpeed?: number
  setAnimationSpeed?: (speed: number) => void
}

function ControlPanel({
  onCacheHit,
  onCacheMiss,
  onAsyncUpdate,
  onServiceFailure,
  kafkaLag,
  setKafkaLag,
  redisStatus,
  setRedisStatus,
  animationSpeed,
  setAnimationSpeed,
}: ControlPanelProps) {
  const handleKafkaLagChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setKafkaLag(parseFloat(e.target.value))
  }

  const handleRedisStatusChange = (value: RedisStatus): void => {
    setRedisStatus(value)
  }

  const handleAnimationSpeedChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (setAnimationSpeed) {
      setAnimationSpeed(parseFloat(e.target.value))
    }
  }

  const redisStatusOptions: SelectOption<RedisStatus>[] = [
    { value: 'healthy', label: 'Healthy', icon: '✅' },
    { value: 'down', label: 'Down', icon: '🔴' },
  ]

  return (
    <div className="control-panel panel">
      <h3>🎮 Control Panel</h3>

      <div className="scenarios">
        <h4>Scenarios</h4>
        <div className="button-grid">
          <div className="scenario-btn-wrapper">
            <Button
              onClick={onCacheHit}
              variant="success"
              className="scenario-btn"
              aria-label="Simulate cache hit scenario with fast response time"
            >
              <span className="scenario-btn-content">
                <span className="scenario-btn-label">✅ Cache Hit</span>
                <span className="scenario-desc">Fast path (~1ms)</span>
              </span>
            </Button>
          </div>

          <div className="scenario-btn-wrapper">
            <Button
              onClick={onCacheMiss}
              variant="warning"
              className="scenario-btn"
              aria-label="Simulate cache miss scenario with synchronous fallback"
            >
              <span className="scenario-btn-content">
                <span className="scenario-btn-label">❌ Cache Miss</span>
                <span className="scenario-desc">Sync fallback (~150ms)</span>
              </span>
            </Button>
          </div>

          <div className="scenario-btn-wrapper">
            <Button
              onClick={onAsyncUpdate}
              variant="info"
              className="scenario-btn"
              aria-label="Simulate asynchronous event-driven update"
            >
              <span className="scenario-btn-content">
                <span className="scenario-btn-label">📨 Async Event</span>
                <span className="scenario-desc">Event-driven update</span>
              </span>
            </Button>
          </div>

          <div className="scenario-btn-wrapper">
            <Button
              onClick={onServiceFailure}
              variant="error"
              className="scenario-btn"
              aria-label="Simulate service failure with graceful degradation"
            >
              <span className="scenario-btn-content">
                <span className="scenario-btn-label">🔥 Service Failure</span>
                <span className="scenario-desc">Graceful degradation</span>
              </span>
            </Button>
          </div>
        </div>
      </div>

      <div className="settings">
        <h4>Settings</h4>

        <div className="setting-item">
          <Slider
            label="Kafka Consumer Lag"
            min={0}
            max={5}
            step={0.5}
            value={kafkaLag}
            onChange={handleKafkaLagChange}
            formatValue={(v) => `${v}s`}
            aria-label="Adjust Kafka consumer lag in seconds"
          />
        </div>

        <div className="setting-item">
          <Select
            label="Redis Status"
            value={redisStatus}
            onChange={handleRedisStatusChange}
            options={redisStatusOptions}
            aria-label="Set Redis cache status"
          />
        </div>

        {animationSpeed !== undefined && setAnimationSpeed && (
          <div className="setting-item">
            <Slider
              label="Animation Speed"
              min={0.5}
              max={3}
              step={0.25}
              value={animationSpeed}
              onChange={handleAnimationSpeedChange}
              formatValue={(v) => `${v}x`}
              showLabels
              minLabel="0.5x (Slower)"
              maxLabel="3x (Faster)"
              aria-label="Adjust animation speed multiplier"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(ControlPanel)
