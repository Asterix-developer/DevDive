"use client"

import { useState, useEffect, useCallback, memo } from "react"
import { motion } from "framer-motion"
import type { Planet, Mission, TestResult } from "@/types/game"
import MonacoCodeEditor from "@/components/monaco-code-editor"
import TestRunner from "@/components/test-runner"
import MarbleDiagram from "@/components/marble-diagram"
import { ArrowLeft, Play, RotateCcw, Zap, Target, Award } from "lucide-react"
import { firebaseService } from "@/lib/firebase-service"

interface EnhancedMissionInterfaceProps {
  planet: Planet
  onComplete: (missionId: string, reward: { fuel: number; artifacts: number; rank: number }) => void
  onBack: () => void
}

// Memoized components for better performance
const MemoizedMarbleDiagram = memo(MarbleDiagram)
const MemoizedTestRunner = memo(TestRunner)

function EnhancedMissionInterface({ planet, onComplete, onBack }: EnhancedMissionInterfaceProps) {
  const [mission, setMission] = useState<Mission | null>(null)
  const [code, setCode] = useState("")
  const [output, setOutput] = useState<any[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [missionComplete, setMissionComplete] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadMission = async () => {
      setLoading(true)
      try {
        const missionData = await firebaseService.getMission(planet.id)
        if (missionData) {
          setMission(missionData)
          setCode(missionData.initialCode)
        }
      } catch (error) {
        console.error("Failed to load mission:", error)
      } finally {
        setLoading(false)
      }
    }

    loadMission()
  }, [planet.id])

  const executeCode = useCallback(async () => {
    if (!mission) return

    setIsRunning(true)
    setOutput([])

    try {
      // Simulate code execution with reduced delay
      const results: any[] = []

      // Mock execution based on mission type
      if (planet.id === "observable-base") {
        if (
          code.includes("subscriber.next(1)") &&
          code.includes("subscriber.next(2)") &&
          code.includes("subscriber.next(3)")
        ) {
          results.push(1, 2, 3)
        }
      } else if (planet.id === "filter-anomaly") {
        if (code.includes("filter") && code.includes("% 2 === 0")) {
          results.push(2, 4)
        } else {
          results.push(1, 2, 3, 4, 5)
        }
      } else if (planet.id === "map-station") {
        if (code.includes("map") && code.includes("* 2")) {
          results.push(2, 4, 6, 8)
        } else {
          results.push(1, 2, 3, 4)
        }
      } else if (planet.id === "take-station") {
        if (code.includes("take") && code.includes("3")) {
          results.push(1, 2, 3)
        } else {
          results.push(1, 2, 3, 4, 5, 6)
        }
      }

      setTimeout(() => {
        setOutput(results)
        setIsRunning(false)
      }, 500) // Reduced from 1000ms
    } catch (error) {
      console.error("Code execution error:", error)
      setIsRunning(false)
    }
  }, [mission, code, planet.id])

  const handleTestComplete = useCallback(
    (results: TestResult[]) => {
      setTestResults(results)
      const allPassed = results.every((r) => r.passed)

      if (allPassed && !missionComplete) {
        setMissionComplete(true)
        if (mission) {
          onComplete(planet.id, mission.reward)
        }
      }
    },
    [missionComplete, mission, onComplete, planet.id],
  )

  const resetCode = useCallback(() => {
    if (mission) {
      setCode(mission.initialCode)
      setOutput([])
      setTestResults([])
      setMissionComplete(false)
    }
  }, [mission])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          />
          <p className="text-cyan-400">Loading mission data...</p>
        </div>
      </div>
    )
  }

  if (!mission) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Mission data not found</p>
          <button onClick={onBack} className="text-cyan-400 hover:text-white transition-colors">
            Return to Galaxy
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/20 backdrop-blur-sm border-b border-cyan-500/30 flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-cyan-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Galaxy</span>
        </button>

        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-bold text-cyan-400">{mission.title}</h2>
          <div
            className={`px-3 py-1 rounded text-xs font-semibold ${
              mission.difficulty === "easy"
                ? "bg-green-500/20 text-green-400"
                : mission.difficulty === "medium"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-red-500/20 text-red-400"
            }`}
          >
            {mission.difficulty.toUpperCase()}
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={resetCode}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Reset Code"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            onClick={executeCode}
            disabled={isRunning}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
          >
            <Play className="w-4 h-4" />
            <span>{isRunning ? "Running..." : "Execute"}</span>
          </button>
        </div>
      </div>

      {/* Mission Description */}
      <div className="p-4 bg-slate-800/50 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-gray-300 mb-2">{mission.description}</p>
            {missionComplete && (
              <div className="flex items-center space-x-2 text-green-400">
                <Award className="w-5 h-5" />
                <span className="font-semibold">Mission Complete!</span>
              </div>
            )}
          </div>

          {mission.reward && (
            <div className="ml-4 bg-black/30 rounded-lg p-3 min-w-48">
              <h4 className="text-cyan-400 font-semibold text-sm mb-2 flex items-center">
                <Target className="w-4 h-4 mr-1" />
                Mission Rewards
              </h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Fuel:</span>
                  <span className="text-green-400">+{mission.reward.fuel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Artifacts:</span>
                  <span className="text-purple-400">+{mission.reward.artifacts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Rank:</span>
                  <span className="text-yellow-400">+{mission.reward.rank}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-4 gap-4 p-4 min-h-0 overflow-hidden">
        {/* Task Panel */}
        <div className="xl:col-span-1 space-y-4 overflow-y-auto">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-gray-700">
            <h3 className="text-cyan-400 font-bold mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              OBJECTIVE
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-white font-semibold mb-2">{planet.name}</h4>
                <p className="text-gray-300 text-sm">{planet.description}</p>
              </div>

              <div>
                <h5 className="text-gray-400 text-sm font-semibold mb-2">INPUT STREAM</h5>
                <MemoizedMarbleDiagram values={mission.inputMarbles} />
              </div>

              <div>
                <h5 className="text-gray-400 text-sm font-semibold mb-2">EXPECTED OUTPUT</h5>
                <MemoizedMarbleDiagram values={mission.outputMarbles} />
              </div>
            </div>
          </div>

          {/* Test Runner */}
          <MemoizedTestRunner
            code={code}
            tests={mission.tests}
            onTestComplete={handleTestComplete}
            isRunning={isRunning}
          />
        </div>

        {/* Code Editor */}
        <div className="xl:col-span-2 min-h-0">
          <div className="h-full">
            <MonacoCodeEditor value={code} onChange={setCode} language="javascript" height="100%" />
          </div>
        </div>

        {/* Output Panel */}
        <div className="xl:col-span-1 space-y-4 overflow-y-auto">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-gray-700">
            <h3 className="text-cyan-400 font-bold mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              OUTPUT
            </h3>
            <div className="space-y-4">
              <div>
                <h5 className="text-gray-400 text-sm font-semibold mb-2">ACTUAL OUTPUT</h5>
                <MemoizedMarbleDiagram values={output} />
              </div>

              {output.length > 0 && (
                <div className="bg-black/30 rounded p-3 font-mono text-sm">
                  <div className="text-gray-400 mb-2">Console Output:</div>
                  {output.map((value, index) => (
                    <div key={index} className="text-green-400">
                      {JSON.stringify(value)}
                    </div>
                  ))}
                </div>
              )}

              <div className="text-sm">
                {missionComplete ? (
                  <div className="text-green-400 font-semibold">✅ Mission Complete!</div>
                ) : output.length > 0 ? (
                  <div className="text-yellow-400">
                    Expected {mission.outputMarbles.length} items, got {output.length}
                  </div>
                ) : (
                  <div className="text-gray-400">Run your code to see output</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(EnhancedMissionInterface)
