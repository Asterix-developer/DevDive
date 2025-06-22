"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import type { Planet } from "@/types/game"
import CodeEditor from "@/components/code-editor"
import MarbleDiagram from "@/components/marble-diagram"
import { ArrowLeft, Play, RotateCcw } from "lucide-react"

interface MissionInterfaceProps {
  planet: Planet
  onComplete: (missionId: string, reward: { fuel: number; artifacts: number; rank: number }) => void
  onBack: () => void
}

const missionData = {
  "observable-base": {
    title: "Observable Base Station",
    description: "Welcome to your first RxJS mission! Create an Observable that emits a sequence of numbers.",
    initialCode: `// Create an Observable that emits 1, 2, 3
import { Observable } from 'rxjs';

const numbers$ = new Observable(subscriber => {
  // Your code here
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  subscriber.complete();
});

numbers$.subscribe(value => console.log(value));`,
    expectedOutput: [1, 2, 3],
    inputMarbles: [1, 2, 3],
    outputMarbles: [1, 2, 3],
  },
  "filter-anomaly": {
    title: "Filter Anomaly",
    description: "Filter valuable meteors (even numbers) from a storm.",
    initialCode: `// Filter even numbers from the stream
import { of } from 'rxjs';
import { filter } from 'rxjs/operators';

const numbers$ = of(1, 2, 3, 4, 5);
const filtered$ = numbers$.pipe(
  filter(n => n % 2 === 0)
);

filtered$.subscribe(value => console.log(value));`,
    expectedOutput: [2, 4],
    inputMarbles: [1, 2, 3, 4, 5],
    outputMarbles: [2, 4],
  },
}

export default function MissionInterface({ planet, onComplete, onBack }: MissionInterfaceProps) {
  const [code, setCode] = useState("")
  const [output, setOutput] = useState<any[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [missionComplete, setMissionComplete] = useState(false)

  const mission = missionData[planet.id as keyof typeof missionData]

  useEffect(() => {
    if (mission) {
      setCode(mission.initialCode)
    }
  }, [mission])

  const executeCode = async () => {
    setIsRunning(true)
    setOutput([])

    try {
      // Simulate code execution
      // In a real implementation, this would use a sandboxed environment
      const results: any[] = []

      // Mock execution based on mission type
      if (planet.id === "observable-base") {
        results.push(1, 2, 3)
      } else if (planet.id === "filter-anomaly") {
        // Check if code contains proper filter logic
        if (code.includes("filter") && code.includes("% 2 === 0")) {
          results.push(2, 4)
        } else {
          results.push(1, 2, 3, 4, 5) // Wrong output
        }
      }

      setTimeout(() => {
        setOutput(results)
        setIsRunning(false)

        // Check if mission is complete
        const isCorrect = JSON.stringify(results) === JSON.stringify(mission.expectedOutput)
        if (isCorrect && !missionComplete) {
          setMissionComplete(true)
          onComplete(planet.id, { fuel: 100, artifacts: 0.25, rank: 50 })
        }
      }, 1000)
    } catch (error) {
      console.error("Code execution error:", error)
      setIsRunning(false)
    }
  }

  const resetCode = () => {
    setCode(mission.initialCode)
    setOutput([])
    setMissionComplete(false)
  }

  if (!mission) {
    return <div className="flex items-center justify-center h-full text-white">Mission data not found</div>
  }

  return (
    <motion.div
      className="h-full flex flex-col"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/20 backdrop-blur-sm border-b border-cyan-500/30">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-cyan-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Galaxy</span>
        </button>

        <h2 className="text-xl font-bold text-cyan-400">{mission.title}</h2>

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
      <div className="p-4 bg-slate-800/50 border-b border-gray-700">
        <p className="text-gray-300">{mission.description}</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
        {/* Task Panel */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-gray-700">
          <h3 className="text-cyan-400 font-bold mb-4">TASK</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-white font-semibold mb-2">{planet.name}</h4>
              <p className="text-gray-300 text-sm">{planet.description}</p>
            </div>

            <div>
              <h5 className="text-gray-400 text-sm font-semibold mb-2">INPUT</h5>
              <MarbleDiagram values={mission.inputMarbles} />
            </div>

            <div>
              <h5 className="text-gray-400 text-sm font-semibold mb-2">EXPECTED OUTPUT</h5>
              <MarbleDiagram values={mission.expectedOutput} />
            </div>
          </div>
        </div>

        {/* Code Editor */}
        <div className="bg-slate-800/50 rounded-lg border border-gray-700 overflow-hidden">
          <CodeEditor value={code} onChange={setCode} language="javascript" />
        </div>

        {/* Output Panel */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-gray-700">
          <h3 className="text-cyan-400 font-bold mb-4">OUTPUT</h3>
          <div className="space-y-4">
            <div>
              <MarbleDiagram values={output} />
            </div>

            <div className="text-sm">
              {missionComplete ? (
                <div className="text-green-400 font-semibold">✅ Mission Complete!</div>
              ) : output.length > 0 ? (
                <div className="text-yellow-400">
                  Expected {mission.expectedOutput.length} items, got {output.length}
                </div>
              ) : (
                <div className="text-gray-400">Run your code to see output</div>
              )}
            </div>

            {output.length > 0 && (
              <div className="bg-black/30 rounded p-2 font-mono text-sm">
                <div className="text-gray-400 mb-1">Console Output:</div>
                {output.map((value, index) => (
                  <div key={index} className="text-green-400">
                    {value}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
