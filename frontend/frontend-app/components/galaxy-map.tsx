"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import type { Planet, PlayerStats } from "@/types/game"

interface GalaxyMapProps {
  planets: Planet[]
  onPlanetSelect: (planet: Planet) => void
  playerStats: PlayerStats
}

export default function GalaxyMap({ planets, onPlanetSelect, playerStats }: GalaxyMapProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const parallaxOffset = {
    x: (mousePosition.x - window.innerWidth / 2) * 0.01,
    y: (mousePosition.y - window.innerHeight / 2) * 0.01,
  }

  return (
    <div ref={mapRef} className="relative w-full h-full overflow-hidden">
      {/* Parallax background layers */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          transform: `translate(${parallaxOffset.x}px, ${parallaxOffset.y}px)`,
        }}
      >
        {/* Nebula effects */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl" />
      </motion.div>

      {/* Orbital paths */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Draw orbital connections */}
        {planets.map((planet, index) => {
          const nextPlanet = planets[index + 1]
          if (!nextPlanet) return null

          return (
            <motion.path
              key={`path-${planet.id}`}
              d={`M ${planet.position.x} ${planet.position.y} Q ${(planet.position.x + nextPlanet.position.x) / 2} ${(planet.position.y + nextPlanet.position.y) / 2 - 50} ${nextPlanet.position.x} ${nextPlanet.position.y}`}
              stroke="rgba(79, 209, 197, 0.3)"
              strokeWidth="2"
              fill="none"
              filter="url(#glow)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: index * 0.5 }}
            />
          )
        })}
      </svg>

      {/* Planets */}
      {planets.map((planet, index) => (
        <motion.div
          key={planet.id}
          className="absolute cursor-pointer group"
          style={{
            left: planet.position.x,
            top: planet.position.y,
            transform: "translate(-50%, -50%)",
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: index * 0.2 }}
          whileHover={{ scale: 1.1 }}
          onClick={() => onPlanetSelect(planet)}
        >
          {/* Planet glow effect */}
          <div
            className="absolute inset-0 rounded-full blur-xl opacity-50"
            style={{
              backgroundColor: planet.color,
              width: "120px",
              height: "120px",
              transform: "translate(-50%, -50%)",
              left: "50%",
              top: "50%",
            }}
          />

          {/* Planet body */}
          <div
            className={`relative w-16 h-16 rounded-full border-2 ${
              planet.unlocked ? "border-cyan-400 shadow-lg shadow-cyan-400/50" : "border-gray-600 opacity-50"
            }`}
            style={{ backgroundColor: planet.color }}
          >
            {!planet.unlocked && (
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

          {/* Planet info tooltip */}
          <div className="absolute left-full ml-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="bg-black/80 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-3 min-w-48">
              <h3 className="text-cyan-400 font-bold text-sm">{planet.name}</h3>
              <p className="text-gray-300 text-xs mt-1">{planet.description}</p>
              <p className="text-cyan-300 text-xs mt-2">{planet.distance}</p>
              <div className="text-xs mt-2">
                <span
                  className={`px-2 py-1 rounded ${
                    planet.type === "tutorial"
                      ? "bg-green-500/20 text-green-400"
                      : planet.type === "challenge"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : planet.type === "mission"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {planet.type.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}

      {/* Central LAND button */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1, delay: 1 }}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-cyan-400/20 rounded-lg blur-xl w-32 h-16" />
          <button className="relative bg-slate-800/80 backdrop-blur-sm border-2 border-cyan-400 rounded-lg px-8 py-4 text-cyan-400 font-bold text-lg hover:bg-cyan-400/10 transition-colors">
            LAND
          </button>
        </div>
      </motion.div>
    </div>
  )
}
