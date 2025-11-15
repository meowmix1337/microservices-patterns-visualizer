import { memo, type ChangeEvent } from 'react'
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

  const handleRedisStatusChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    setRedisStatus(e.target.value as RedisStatus)
  }

  const handleAnimationSpeedChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (setAnimationSpeed) {
      setAnimationSpeed(parseFloat(e.target.value))
    }
  }

  return (
    <div className="control-panel panel">
      <h3>🎮 Control Panel</h3>

      <div className="scenarios">
        <h4>Scenarios</h4>
        <div className="button-grid">
          <button
            onClick={onCacheHit}
            className="scenario-btn success"
            aria-label="Simulate cache hit scenario with fast response time"
          >
            ✅ Cache Hit
            <span className="scenario-desc">Fast path (~1ms)</span>
          </button>

          <button
            onClick={onCacheMiss}
            className="scenario-btn warning"
            aria-label="Simulate cache miss scenario with synchronous fallback"
          >
            ❌ Cache Miss
            <span className="scenario-desc">Sync fallback (~150ms)</span>
          </button>

          <button
            onClick={onAsyncUpdate}
            className="scenario-btn info"
            aria-label="Simulate asynchronous event-driven update"
          >
            📨 Async Event
            <span className="scenario-desc">Event-driven update</span>
          </button>

          <button
            onClick={onServiceFailure}
            className="scenario-btn error"
            aria-label="Simulate service failure with graceful degradation"
          >
            🔥 Service Failure
            <span className="scenario-desc">Graceful degradation</span>
          </button>
        </div>
      </div>

      <div className="settings">
        <h4>Settings</h4>

        <div className="setting-item">
          <label>
            Kafka Consumer Lag: {kafkaLag}s
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={kafkaLag}
              onChange={handleKafkaLagChange}
              className="slider"
              aria-label="Adjust Kafka consumer lag in seconds"
            />
          </label>
        </div>

        <div className="setting-item">
          <label htmlFor="redis-status-select">
            Redis Status:
            <select
              id="redis-status-select"
              value={redisStatus}
              onChange={handleRedisStatusChange}
              className="select"
              aria-label="Set Redis cache status"
            >
              <option value="healthy">✅ Healthy</option>
              <option value="down">🔴 Down</option>
            </select>
          </label>
        </div>

        {animationSpeed !== undefined && setAnimationSpeed && (
          <div className="setting-item">
            <label>
              Animation Speed: {animationSpeed}x
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.25"
                value={animationSpeed}
                onChange={handleAnimationSpeedChange}
                className="slider"
                aria-label="Adjust animation speed multiplier"
              />
              <div className="speed-labels">
                <span>0.5x (Slower)</span>
                <span>3x (Faster)</span>
              </div>
            </label>
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(ControlPanel)
