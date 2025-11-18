import { createContext, useContext, useState, ReactNode, useMemo } from 'react'

export interface ArchitectureContextValue {
  hoveredService: string | null
  setHoveredService: (service: string | null) => void
  dependencies: Map<string, string[]>
  setDependencies: (deps: Map<string, string[]>) => void
}

const ArchitectureContext = createContext<ArchitectureContextValue | undefined>(undefined)

export interface ArchitectureProviderProps {
  children: ReactNode
  dependencyMap?: Map<string, string[]>
}

export function ArchitectureProvider({ children, dependencyMap }: ArchitectureProviderProps) {
  const [hoveredService, setHoveredService] = useState<string | null>(null)
  const [dependencies, setDependencies] = useState<Map<string, string[]>>(
    dependencyMap || new Map()
  )

  const value = useMemo<ArchitectureContextValue>(
    () => ({
      hoveredService,
      setHoveredService,
      dependencies,
      setDependencies
    }),
    [hoveredService, dependencies]
  )

  return (
    <ArchitectureContext.Provider value={value}>
      {children}
    </ArchitectureContext.Provider>
  )
}

export function useArchitecture(): ArchitectureContextValue {
  const context = useContext(ArchitectureContext)
  if (context === undefined) {
    throw new Error('useArchitecture must be used within an ArchitectureProvider')
  }
  return context
}

// Helper function to build dependency map from dependency definitions
export interface DependencyDefinition {
  from: string
  to: string
}

export function buildDependencyMap(dependencies: DependencyDefinition[]): Map<string, string[]> {
  const map = new Map<string, string[]>()

  dependencies.forEach(dep => {
    // Add forward dependency (from -> to)
    if (!map.has(dep.from)) {
      map.set(dep.from, [])
    }
    map.get(dep.from)!.push(dep.to)

    // Add reverse dependency (to -> from) for bidirectional highlighting
    if (!map.has(dep.to)) {
      map.set(dep.to, [])
    }
    map.get(dep.to)!.push(dep.from)
  })

  return map
}
