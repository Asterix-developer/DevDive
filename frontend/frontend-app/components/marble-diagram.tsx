"use client"

import { motion } from "framer-motion"

interface MarbleDiagramProps {
  values: any[]
  isAnimated?: boolean
}

export default function MarbleDiagram({ values, isAnimated = true }: MarbleDiagramProps) {
  return (
    <div className="flex items-center space-x-2 py-2">
      {values.map((value, index) => (
        <motion.div
          key={index}
          className="flex items-center"
          initial={isAnimated ? { scale: 0, opacity: 0 } : {}}
          animate={isAnimated ? { scale: 1, opacity: 1 } : {}}
          transition={isAnimated ? { delay: index * 0.2, duration: 0.3 } : {}}
        >
          <div className="w-8 h-8 bg-cyan-400 rounded-full flex items-center justify-center text-black font-bold text-sm">
            {value}
          </div>
          {index < values.length - 1 && <div className="w-6 h-0.5 bg-gray-600 mx-1" />}
        </motion.div>
      ))}

      {values.length > 0 && <div className="w-2 h-6 bg-gray-600 ml-2" />}
    </div>
  )
}
