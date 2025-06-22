export interface Planet {
  id: string
  name: string
  description: string
  distance: string
  type: "tutorial" | "challenge" | "mission" | "advanced" | "expert"
  unlocked: boolean
  position: { x: number; y: number }
  color: string
  requiredFuel?: number
  reward?: {
    fuel: number
    artifacts: number
    rank: number
  }
}

export interface PlayerStats {
  fuel: number
  fuelLevel: number
  artifacts: number
  captainRank: number
  completedMissions: string[]
}

export interface TestCase {
  name: string
  expectedOutput: any[]
  testCode: string // Now stored as string instead of function
}

export interface TestResult {
  name: string
  passed: boolean
  actualOutput: any[]
  expectedOutput: any[]
  error?: string
  executionTime?: number
}

export interface Mission {
  id: string
  title: string
  description: string
  difficulty: "easy" | "medium" | "hard"
  initialCode: string
  tests: TestCase[]
  inputMarbles: any[]
  outputMarbles: any[]
  reward: {
    fuel: number
    artifacts: number
    rank: number
  }
}
