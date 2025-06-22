"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion"
import type { Planet, PlayerStats } from "@/types/game"
import Spaceship from "./spaceship"

interface DraggableGalaxyMapProps {
  planets: Planet[]
  onPlanetSelect: (planet: Planet) => void
  playerStats: PlayerStats
}

export default function DraggableGalaxyMap({ planets, onPlanetSelect, playerStats }: DraggableGalaxyMapProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [currentPlanet, setCurrentPlanet] = useState<Planet | null>(null)
  const [spaceshipMoving, setSpaceshipMoving] = useState(false)
  const constraintsRef = useRef<HTMLDivElement>(null)

  // Motion values for dragging with spring physics for smoother movement
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 300, damping: 30 })
  const springY = useSpring(y, { stiffness: 300, damping: 30 })

  // Reduced parallax transforms for better performance
  const backgroundX = useTransform(springX, [-1000, 1000], [50, -50])
  const backgroundY = useTransform(springY, [-1000, 1000], [50, -50])
  const nebula1X = useTransform(springX, [-1000, 1000], [30, -30])
  const nebula1Y = useTransform(springY, [-1000, 1000], [30, -30])

  // Initialize with first unlocked planet
  useEffect(() => {
    const firstUnlockedPlanet = planets.find((planet) => planet.unlocked)
    if (firstUnlockedPlanet && !currentPlanet) {
      setCurrentPlanet(firstUnlockedPlanet)
    }
  }, [planets, currentPlanet])

  // Throttled mouse movement for better performance
  const throttledMouseMove = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout
      return (e: MouseEvent) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          setMousePosition({ x: e.clientX, y: e.clientY })
        }, 16) // ~60fps
      }
    })(),
    [],
  )

  useEffect(() => {
    window.addEventListener("mousemove", throttledMouseMove)
    return () => {
      window.removeEventListener("mousemove", throttledMouseMove)
    }
  }, [throttledMouseMove])

  const handleDragStart = useCallback(() => {
    setIsDragging(true)
  }, [])

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handlePlanetClick = useCallback(
    (planet: Planet, e: React.MouseEvent) => {
      e.stopPropagation()
      if (!isDragging && planet.unlocked) {
        // Start spaceship movement
        setSpaceshipMoving(true)
        setCurrentPlanet(planet)

        // Delay planet selection to allow spaceship animation
        setTimeout(() => {
          onPlanetSelect(planet)
        }, 1500)
      }
    },
    [isDragging, onPlanetSelect],
  )

  const handleSpaceshipArrival = useCallback(() => {
    setSpaceshipMoving(false)
  }, [])

  // Reduced mouse parallax effect
  const mouseParallaxX = useMemo(() => {
    return (mousePosition.x - (typeof window !== "undefined" ? window.innerWidth : 1920) / 2) * 0.005
  }, [mousePosition.x])

  const mouseParallaxY = useMemo(() => {
    return (mousePosition.y - (typeof window !== "undefined" ? window.innerHeight : 1080) / 2) * 0.005
  }, [mousePosition.y])

  // Memoized star field with reduced count
  const starField = useMemo(
    () =>
      [...Array(50)].map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: `${Math.random() * 200}%`,
            top: `${Math.random() * 200}%`,
            opacity: Math.random() * 0.8 + 0.2,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: Math.random() * 4 + 2,
            repeat: Number.POSITIVE_INFINITY,
            delay: Math.random() * 2,
          }}
        />
      )),
    [],
  )

  // Memoized orbital paths
  const orbitalPaths = useMemo(() => {
    return planets.map((planet, index) => {
      const connectedPlanets = planets.filter((_, i) => Math.abs(i - index) <= 1 && i !== index) // Reduced connections

      return connectedPlanets.map((connectedPlanet, connIndex) => (
        <motion.path
          key={`path-${planet.id}-${connectedPlanet.id}`}
          d={`M ${planet.position.x} ${planet.position.y} Q ${
            (planet.position.x + connectedPlanet.position.x) / 2 + Math.sin(index) * 50
          } ${
            (planet.position.y + connectedPlanet.position.y) / 2 + Math.cos(index) * 50
          } ${connectedPlanet.position.x} ${connectedPlanet.position.y}`}
          stroke="rgba(79, 209, 197, 0.3)"
          strokeWidth="1"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, delay: (index + connIndex) * 0.1 }}
        />
      ))
    })
  }, [planets])

  // Get spaceship position (offset from current planet)
  const spaceshipPosition = useMemo(() => {
    if (!currentPlanet) return { x: 400, y: 300 }
    return {
      x: currentPlanet.position.x - 60, // Offset to the left of planet
      y: currentPlanet.position.y - 20, // Slightly above planet
    }
  }, [currentPlanet])

  return (
    <div ref={constraintsRef} className="relative w-full h-full overflow-hidden cursor-grab active:cursor-grabbing">
      {/* Simplified parallax background */}
      <motion.div
        className="absolute inset-0 opacity-20 will-change-transform"
        style={{
          x: backgroundX,
          y: backgroundY,
          transform: `translate3d(${mouseParallaxX}px, ${mouseParallaxY}px, 0)`,
        }}
      >
        {starField}
      </motion.div>

      {/* Simplified nebula layer */}
      <motion.div
        className="absolute inset-0 opacity-20 will-change-transform"
        style={{
          x: nebula1X,
          y: nebula1Y,
          transform: `translate3d(${mouseParallaxX * 0.3}px, ${mouseParallaxY * 0.3}px, 0)`,
        }}
      >
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl" />
      </motion.div>

      {/* Draggable galaxy container */}
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={{ x: springX, y: springY }}
        drag
        dragConstraints={{
          left: -1500,
          right: 1500,
          top: -1200,
          bottom: 1200,
        }}
        dragElastic={0.1}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        whileDrag={{ cursor: "grabbing" }}
      >
        {/* Galaxy map content */}
        <div className="relative w-[400%] h-[400%] -translate-x-1/4 -translate-y-1/4">
          {/* Simplified orbital paths */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(79, 209, 197, 0.1)" />
                <stop offset="50%" stopColor="rgba(79, 209, 197, 0.3)" />
                <stop offset="100%" stopColor="rgba(79, 209, 197, 0.1)" />
              </linearGradient>
            </defs>
            {orbitalPaths}
          </svg>

          {/* Optimized planets */}
          {planets.map((planet, index) => {
            const canAfford = playerStats.fuel >= (planet.requiredFuel || 0)
            const isUnlocked = planet.unlocked && canAfford
            const isCurrentPlanet = currentPlanet?.id === planet.id

            return (
              <motion.div
                key={planet.id}
                className={`absolute cursor-pointer group ${!isUnlocked ? "pointer-events-none" : ""}`}
                style={{
                  left: planet.position.x,
                  top: planet.position.y,
                  transform: "translate(-50%, -50%)",
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                whileHover={isUnlocked ? { scale: 1.1 } : {}}
                onClick={(e) => handlePlanetClick(planet, e)}
              >
                {/* Current planet indicator */}
                {isCurrentPlanet && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-yellow-400"
                    style={{
                      width: "100px",
                      height: "100px",
                      transform: "translate(-50%, -50%)",
                      left: "50%",
                      top: "50%",
                    }}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                  />
                )}

                {/* Simplified planet glow */}
                <div
                  className="absolute inset-0 rounded-full blur-lg opacity-40"
                  style={{
                    backgroundColor: isUnlocked ? planet.color : "#666",
                    width: "100px",
                    height: "100px",
                    transform: "translate(-50%, -50%)",
                    left: "50%",
                    top: "50%",
                  }}
                />

                {/* Planet body */}
                <div
                  className={`relative w-16 h-16 rounded-full border-2 transition-all duration-300 ${
                    isUnlocked ? "border-cyan-400" : "border-gray-600 opacity-50"
                  }`}
                  style={{
                    backgroundColor: isUnlocked ? planet.color : "#444",
                  }}
                >
                  {/* Planet surface highlight */}
                  <div
                    className="absolute inset-2 rounded-full opacity-30"
                    style={{
                      background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), transparent 50%)`,
                    }}
                  />

                  {!isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Simplified tooltip */}
                <div className="absolute left-full ml-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                  <div className="bg-black/90 border border-cyan-500/30 rounded-lg p-3 min-w-48">
                    <h3 className="text-cyan-400 font-bold text-sm">{planet.name}</h3>
                    <p className="text-gray-300 text-xs mt-1">{planet.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          planet.type === "tutorial"
                            ? "bg-green-500/20 text-green-400"
                            : planet.type === "challenge"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : planet.type === "mission"
                                ? "bg-blue-500/20 text-blue-400"
                                : planet.type === "advanced"
                                  ? "bg-purple-500/20 text-purple-400"
                                  : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {planet.type.toUpperCase()}
                      </span>
                      {planet.requiredFuel && <span className="text-yellow-400 text-xs">⛽ {planet.requiredFuel}</span>}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}

          {/* Spaceship */}
          {currentPlanet && (
            <Spaceship
              targetPosition={spaceshipPosition}
              isMoving={spaceshipMoving}
              onArrival={handleSpaceshipArrival}
            />
          )}

          {/* Simplified central hub */}
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
          >
            <div className="relative bg-slate-900/60 border border-cyan-400/30 rounded-full w-24 h-24 flex items-center justify-center">
              <div className="text-cyan-400 text-center">
                <div className="text-xs font-mono">HUB</div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 text-cyan-400/60 text-sm font-mono pointer-events-none">
        Drag to explore • Click planets to travel • 🚀 Spaceship shows current location
      </div>
    </div>
  )
}
