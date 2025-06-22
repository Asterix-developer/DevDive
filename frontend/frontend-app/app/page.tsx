"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import DraggableGalaxyMap from "@/components/draggable-galaxy-map"
import PlayerDashboard from "@/components/player-dashboard"
import EnhancedMissionInterface from "@/components/enhanced-mission-interface"
import type { Planet, PlayerStats } from "@/types/game"
import { backendService } from "@/lib/firebase-service"

const initialPlayerStats: PlayerStats = {
  fuel: 4400,
  fuelLevel: 3.3,
  artifacts: 2.25,
  captainRank: 2530,
  completedMissions: [],
}

export default function RxJSUniverse() {
  const [currentView, setCurrentView] = useState<"galaxy" | "mission">("galaxy")
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null)
  const [playerStats, setPlayerStats] = useState<PlayerStats>(initialPlayerStats)
  const [showDashboard, setShowDashboard] = useState(false)
  const [planets, setPlanets] = useState<Planet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadGameData = async () => {
      try {
        setError(null)
        console.log("Loading game data...")

        // Load planets
        const planetsData = await backendService.getPlanets()
        console.log("Loaded planets:", planetsData.length)
        setPlanets(planetsData)

        // Load player stats (using mock user ID for now)
        const stats = await backendService.getPlayerStats("demo-user")
        console.log("Loaded player stats:", stats)
        setPlayerStats(stats)

        console.log("Game data loaded successfully")
      } catch (error) {
        console.error("Failed to load game data:", error)
        setError("Failed to load game data. Using offline mode.")

        // Fallback to ensure we have some data
        setPlanets([
          {
            id: "observable-base",
            name: "Observable Base",
            description: "Learn the fundamentals of RxJS Observables",
            distance: "2.48.4rom",
            type: "tutorial",
            unlocked: true,
            position: { x: 400, y: 300 },
            color: "#4ECDC4",
            requiredFuel: 0,
            reward: { fuel: 100, artifacts: 0.25, rank: 50 },
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    loadGameData()
  }, [])

  const handlePlanetSelect = (planet: Planet) => {
    if (planet.unlocked) {
      console.log("Selected planet:", planet.name)
      setSelectedPlanet(planet)
      setCurrentView("mission")
    }
  }

  const handleMissionComplete = (missionId: string, reward: { fuel: number; artifacts: number; rank: number }) => {
    console.log("Mission completed:", missionId, reward)

    const newStats = {
      ...playerStats,
      fuel: playerStats.fuel + reward.fuel,
      fuelLevel: Math.min(5, playerStats.fuelLevel + reward.fuel / 1000),
      artifacts: playerStats.artifacts + reward.artifacts,
      captainRank: playerStats.captainRank + reward.rank,
      completedMissions: [...playerStats.completedMissions, missionId],
    }

    setPlayerStats(newStats)

    // Update backend (will use mock if Firebase unavailable)
    backendService.updatePlayerStats("demo-user", newStats)

    // Unlock next planets based on progress
    const updatedPlanets = planets.map((planet) => {
      if (planet.requiredFuel && newStats.fuel >= planet.requiredFuel) {
        return { ...planet, unlocked: true }
      }
      return planet
    })
    setPlanets(updatedPlanets)
  }

  const handleBackToGalaxy = () => {
    setCurrentView("galaxy")
    setSelectedPlanet(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          />
          <p className="text-cyan-400 text-lg">Initializing DevDive...</p>
          <p className="text-gray-400 text-sm mt-2">
            {backendService.isUsingBackend() ? "Connecting to your data..." : "Loading offline data..."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated stars background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(150)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-70"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-4 bg-black/20 backdrop-blur-sm border-b border-cyan-500/30">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowDashboard(!showDashboard)}
            className="p-2 text-white hover:text-cyan-400 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="text-cyan-400 font-mono text-sm">
            FUEL: {playerStats.fuel} | ARTIFACTS: {playerStats.artifacts.toFixed(2)} | RANK: {playerStats.captainRank}
          </div>
          {!backendService.isUsingBackend() && (
            <div className="text-yellow-400 font-mono text-xs bg-yellow-400/10 px-2 py-1 rounded">OFFLINE MODE</div>
          )}
        </div>

        <motion.h1
          className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          DevDive
        </motion.h1>

        <div className="text-cyan-400 font-mono text-sm">Space Cadet | Alpha-7</div>
      </header>

      {/* Error notification */}
      {error && (
        <div className="relative z-10 bg-yellow-500/10 border-b border-yellow-500/30 p-2">
          <p className="text-yellow-400 text-sm text-center">{error}</p>
        </div>
      )}

      {/* Player Dashboard Overlay */}
      <AnimatePresence>
        {showDashboard && <PlayerDashboard stats={playerStats} onClose={() => setShowDashboard(false)} />}
      </AnimatePresence>

      {/* Main Content */}
      <main className="relative z-10 h-[calc(100vh-80px)]">
        <AnimatePresence mode="wait">
          {currentView === "galaxy" ? (
            <DraggableGalaxyMap
              key="galaxy"
              planets={planets}
              onPlanetSelect={handlePlanetSelect}
              playerStats={playerStats}
            />
          ) : (
            selectedPlanet && (
              <EnhancedMissionInterface
                key="mission"
                planet={selectedPlanet}
                onComplete={handleMissionComplete}
                onBack={handleBackToGalaxy}
              />
            )
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
