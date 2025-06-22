"use client"

import { motion } from "framer-motion"
import type { PlayerStats } from "@/types/game"
import { X, User, Zap, Package, Award } from "lucide-react"

interface PlayerDashboardProps {
  stats: PlayerStats
  onClose: () => void
}

export default function PlayerDashboard({ stats, onClose }: PlayerDashboardProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative bg-slate-900/90 backdrop-blur-lg border border-cyan-500/30 rounded-2xl p-8 max-w-md w-full mx-4"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", damping: 20 }}
      >
        {/* Close button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>

        {/* Player Avatar */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
              <span className="text-xs font-bold text-black">7</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-6">
          {/* Fuel Level */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                <span className="text-white font-semibold">FUEL LEVEL</span>
              </div>
              <span className="text-cyan-400 font-mono">{stats.fuelLevel.toFixed(2)}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-cyan-400 to-green-400 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(stats.fuelLevel / 5) * 100}%` }}
              />
            </div>
            <div className="flex items-center mt-1">
              <span className="text-gray-400 text-sm">⛽ {stats.fuel}</span>
            </div>
          </div>

          {/* Artifact Counter */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-purple-400" />
              <span className="text-white font-semibold">ARTIFACT COUNTER</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-purple-400 font-mono text-xl">{stats.artifacts.toFixed(2)}</span>
              <div className="flex space-x-1">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 h-4 rounded ${i < Math.floor(stats.artifacts) ? "bg-cyan-400" : "bg-gray-600"}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Captain Rank */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-semibold">CAPTAIN RANK</span>
            </div>
            <span className="text-yellow-400 font-mono text-xl">{stats.captainRank}</span>
          </div>
        </div>

        {/* Progress Summary */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <h3 className="text-cyan-400 font-semibold mb-3">Mission Progress</h3>
          <div className="text-gray-300 text-sm">
            <p>Completed Missions: {stats.completedMissions.length}</p>
            <p>Current Sector: Alpha-7</p>
            <p>Rank: Space Cadet</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
