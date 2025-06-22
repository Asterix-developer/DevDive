"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface SpaceshipProps {
  targetPosition: { x: number; y: number }
  isMoving: boolean
  onArrival?: () => void
}

export default function Spaceship({ targetPosition, isMoving, onArrival }: SpaceshipProps) {
  const [rotation, setRotation] = useState(0)
  const [previousPosition, setPreviousPosition] = useState(targetPosition)

  useEffect(() => {
    // Calculate rotation angle based on movement direction
    const deltaX = targetPosition.x - previousPosition.x
    const deltaY = targetPosition.y - previousPosition.y
    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI)

    setRotation(angle)
    setPreviousPosition(targetPosition)
  }, [targetPosition, previousPosition])

  return (
    <motion.div
      className="absolute pointer-events-none z-20"
      initial={{ x: targetPosition.x, y: targetPosition.y }}
      animate={{
        x: targetPosition.x,
        y: targetPosition.y,
        rotate: rotation,
      }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 20,
        mass: 1,
        duration: 2,
      }}
      style={{
        transform: "translate(-50%, -50%)",
      }}
      onAnimationComplete={onArrival}
    >
      {/* Spaceship body */}
      <div className="relative">
        {/* Engine trail effect */}
        {isMoving && (
          <motion.div
            className="absolute -left-8 top-1/2 transform -translate-y-1/2"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0 }}
          >
            <div className="w-12 h-1 bg-gradient-to-l from-transparent via-orange-400 to-red-500 rounded-full blur-sm" />
            <div className="w-8 h-0.5 bg-gradient-to-l from-transparent via-yellow-300 to-orange-400 rounded-full blur-xs absolute top-1/2 left-2 transform -translate-y-1/2" />
          </motion.div>
        )}

        {/* Main spaceship */}
        <motion.div
          className="relative w-8 h-6"
          animate={
            isMoving
              ? {
                  y: [0, -1, 0, 1, 0],
                }
              : {}
          }
          transition={{
            duration: 0.8,
            repeat: isMoving ? Number.POSITIVE_INFINITY : 0,
            ease: "easeInOut",
          }}
        >
          {/* Spaceship glow */}
          <div className="absolute inset-0 bg-cyan-400/30 rounded-full blur-md scale-150" />

          {/* Spaceship hull */}
          <svg viewBox="0 0 32 24" className="w-full h-full relative z-10" fill="none">
            {/* Main body */}
            <path
              d="M2 12 L28 8 L30 12 L28 16 L2 12 Z"
              fill="url(#spaceshipGradient)"
              stroke="#06B6D4"
              strokeWidth="0.5"
            />

            {/* Wing details */}
            <path d="M8 6 L20 4 L22 8 L10 10 Z" fill="url(#wingGradient)" stroke="#0891B2" strokeWidth="0.3" />
            <path d="M8 18 L20 20 L22 16 L10 14 Z" fill="url(#wingGradient)" stroke="#0891B2" strokeWidth="0.3" />

            {/* Cockpit */}
            <circle cx="24" cy="12" r="2" fill="#22D3EE" stroke="#06B6D4" strokeWidth="0.5" />

            {/* Engine exhausts */}
            <circle cx="4" cy="10" r="1" fill="#EF4444" opacity="0.8" />
            <circle cx="4" cy="14" r="1" fill="#EF4444" opacity="0.8" />

            <defs>
              <linearGradient id="spaceshipGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1E293B" />
                <stop offset="50%" stopColor="#475569" />
                <stop offset="100%" stopColor="#64748B" />
              </linearGradient>
              <linearGradient id="wingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0F172A" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>
            </defs>
          </svg>

          {/* Pulsing lights */}
          <motion.div
            className="absolute top-1 right-1 w-1 h-1 bg-green-400 rounded-full"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
          />
          <motion.div
            className="absolute bottom-1 right-1 w-1 h-1 bg-red-400 rounded-full"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, delay: 0.5 }}
          />
        </motion.div>

        {/* Particle effects when moving */}
        {isMoving && (
          <div className="absolute -left-6 top-1/2 transform -translate-y-1/2">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-orange-400 rounded-full"
                style={{
                  left: `${i * -4}px`,
                  top: `${(Math.random() - 0.5) * 8}px`,
                }}
                animate={{
                  opacity: [1, 0],
                  scale: [1, 0],
                  x: [-10, -20],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
