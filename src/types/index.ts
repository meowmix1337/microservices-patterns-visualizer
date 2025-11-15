/**
 * Centralized Type Definitions
 *
 * This file contains common types used across the application.
 * Component-specific types remain in their respective component files.
 */

// Re-export pattern types
export type {
  Pattern,
  PatternCategory,
  PatternDifficulty
} from '../patterns/patternRegistry';

// Re-export component types
export type { ServiceStatus } from '../components/pattern/ServiceBox';
export type { MessageFlowData } from '../components/pattern/MessageFlow';
export type { RedisStatus } from '../components/pattern/ControlPanel';
export type { CacheData } from '../components/viewers/CacheViewer';
export type { QueueMessage } from '../components/viewers/QueueViewer';

// Re-export hook types
export type { Step } from '../hooks/useStepByStep.d';

// Re-export constant types
export type { Position } from '../constants/colors';
