# Project Structure

## Root Directory
```
microservices-patterns-visualizer/
├── dist/                      # Production build output (generated)
├── node_modules/              # Dependencies (generated)
├── src/                       # Source code
├── .git/                      # Git repository
├── .claude/                   # Claude Code configuration
├── .serena/                   # Serena MCP configuration
├── index.html                 # Entry HTML file
├── package.json               # Project metadata and dependencies
├── package-lock.json          # Locked dependency versions
├── vite.config.js            # Vite build configuration
└── README.md                  # Project documentation
```

## Source Directory (`src/`)

### Directory Structure
```
src/
├── components/                # Reusable UI components
│   ├── CacheViewer.jsx/css   # Redis cache display
│   ├── CommandPalette.jsx/css # Command palette UI
│   ├── ComingSoonPattern.jsx/css # Placeholder for future patterns
│   ├── ControlPanel.jsx/css  # Scenario control buttons
│   ├── InfoTabs.jsx/css      # Tabbed information panel
│   ├── Logs.jsx/css          # Event log display
│   ├── MessageFlow.jsx/css   # Animated message visualization
│   ├── PatternInfoModal.jsx/css # Pattern information modal
│   ├── PatternSelector.jsx/css # Pattern browser UI
│   ├── QueueViewer.jsx/css   # Kafka queue display
│   ├── ScenarioInfoPanel.jsx/css # Scenario information panel
│   ├── ServiceBox.jsx/css    # Service node visualization
│   ├── Sidebar.jsx/css       # Sidebar navigation
│   └── StepByStepControls.jsx/css # Step-by-step playback controls
│
├── patterns/                  # Pattern implementations
│   ├── patternRegistry.js    # Central pattern definitions & metadata
│   ├── AsyncMicroservicesPattern.jsx # Event-driven microservices
│   └── RequestResponsePattern.jsx # Simple request-response
│
├── hooks/                     # Custom React hooks
│   ├── useLogs.js            # Log state management
│   ├── useStepByStep.js      # Step-by-step scenario control
│   ├── useStepByStep.d.ts    # TypeScript definitions for hook
│   ├── README_STEP_BY_STEP.md # Hook documentation
│   └── ARCHITECTURE.md       # Hook architecture documentation
│
├── utils/                     # Utility functions
│   ├── delay.js              # Promise-based delay utility
│   └── scenarioHelpers.js    # Helper functions for scenarios
│
├── constants/                 # Application constants
│   └── colors.js             # Theme colors, service positions
│
├── contexts/                  # React contexts
│   └── ThemeContext.jsx      # Theme management context
│
├── examples/                  # Example implementations
│   ├── AsyncMicroservicesRefactored.example.jsx
│   ├── ScenarioWithBuilders.example.jsx
│   └── StepByStepDemo.jsx
│
├── App.jsx                    # Main application component
├── App.css                    # Main application styles
├── main.jsx                   # React entry point
└── index.css                  # Global styles
```

## Key File Descriptions

### Entry Points
- **index.html**: Root HTML file, includes `<div id="root">` mount point
- **src/main.jsx**: React application entry, renders `<App />` into root
- **src/App.jsx**: Main application component, handles pattern switching

### Pattern System
- **src/patterns/patternRegistry.js**: Central registry of all patterns with metadata (name, category, difficulty, description, etc.)
- **src/patterns/*Pattern.jsx**: Individual pattern implementations

### Component Categories

#### Visualization Components
- **ServiceBox**: Renders service nodes with icons, status, position
- **MessageFlow**: Animated arrows showing message paths
- **CacheViewer**: Displays Redis cache key-value pairs
- **QueueViewer**: Shows Kafka queue messages

#### Control Components
- **ControlPanel**: Scenario trigger buttons and configuration
- **StepByStepControls**: Playback controls for step-by-step mode
- **PatternSelector**: Pattern browser with categories

#### Information Components
- **Logs**: Chronological event log with timestamps
- **InfoTabs**: Tabbed panel for cache/queue/logs
- **ScenarioInfoPanel**: Current scenario information
- **PatternInfoModal**: Detailed pattern information

#### UI Components
- **Sidebar**: Navigation sidebar
- **CommandPalette**: Quick command access
- **ComingSoonPattern**: Placeholder for unimplemented patterns

### Hooks
- **useLogs**: Manages log entries (add, clear)
- **useStepByStep**: Controls step-by-step scenario playback

### Utils
- **delay**: Promise-based delay for animations
- **scenarioHelpers**: Helper functions for scenario building

### Constants
- **colors.js**: Contains:
  - Color scheme for different message types
  - Service position coordinates
  - Theme colors

## Configuration Files

### package.json
- Project metadata (name, version)
- Dependencies (React, Framer Motion)
- Scripts (dev, build, preview)
- Module type: "module" (ES6)

### vite.config.js
- Simple configuration
- React plugin enabled
- No custom configuration

## Generated Directories
- **dist/**: Production build output (created by `npm run build`)
- **node_modules/**: Installed dependencies (created by `npm install`)

## Git Configuration
- **Current branch**: typescript
- **Main branch**: main
- **Status**: Clean working directory

## Documentation Files
- **README.md**: Main project documentation
- **README_IMPLEMENTATION.md**: Implementation details
- **MIGRATION_GUIDE.md**: Migration information
- **IMPROVEMENTS.md**: Improvement ideas
- **STEP_BY_STEP_INDEX.md**: Step-by-step feature index
- **STEP_BY_STEP_SUMMARY.md**: Summary of step-by-step feature
- **SUMMARY.md**: Project summary
- **CHANGELOG.md**: Version history
