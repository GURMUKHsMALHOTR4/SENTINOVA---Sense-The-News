"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function PremiumLogo() {
  const [isHovered, setIsHovered] = useState(false)
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([])

  useEffect(() => {
    // Generate floating particles for premium effect
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
    }))
    setParticles(newParticles)
  }, [])

  return (
    <motion.div
      className="relative group cursor-pointer"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Particle Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              delay: particle.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Main Logo Container */}
      <motion.div
        className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden"
        animate={{
          background: isHovered
            ? "linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)"
            : "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Animated Background Glow */}
        <motion.div
          className="absolute inset-0 opacity-50"
          animate={{
            background: isHovered
              ? "radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.8) 0%, transparent 70%)"
              : "radial-gradient(circle at 30% 30%, rgba(6, 182, 212, 0.6) 0%, transparent 70%)",
          }}
          transition={{ duration: 0.5 }}
        />

        {/* Rotating Ring Effect */}
        <motion.div
          className="absolute inset-1 border-2 border-white/30 rounded-lg"
          animate={{ rotate: isHovered ? 360 : 0 }}
          transition={{ duration: 2, ease: "linear", repeat: isHovered ? Number.POSITIVE_INFINITY : 0 }}
        />

        {/* Premium S Logo */}
        <div className="relative w-full h-full flex items-center justify-center">
          <motion.svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            className="text-white drop-shadow-lg"
            animate={{
              scale: isHovered ? 1.1 : 1,
              rotateY: isHovered ? 360 : 0,
            }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="50%" stopColor="#f0f9ff" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0.8" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <motion.path
              d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6H8C6.9 6 6 6.9 6 8C6 9.1 6.9 10 8 10H16C18.2 10 20 11.8 20 14C20 16.2 18.2 18 16 18H12C10.9 18 10 18.9 10 20C10 21.1 10.9 22 12 22H16C17.1 22 18 21.1 18 20V19C18 18.4 18.4 18 19 18C19.6 18 20 18.4 20 19V20C20 22.2 18.2 24 16 24H12C9.8 24 8 22.2 8 20C8 17.8 9.8 16 12 16H16C17.1 16 18 15.1 18 14C18 12.9 17.1 12 16 12H8C5.8 12 4 10.2 4 8C4 5.8 5.8 4 8 4H12Z"
              fill="url(#logoGradient)"
              filter="url(#glow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          </motion.svg>
        </div>

        {/* Pulse Effect on Hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="absolute inset-0 border-2 border-white/50 rounded-xl"
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 1.5, opacity: 0 }}
              exit={{ scale: 1, opacity: 0 }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Floating Glow Effect */}
      <motion.div
        className="absolute inset-0 rounded-xl blur-xl opacity-30"
        animate={{
          background: isHovered
            ? "linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6)"
            : "linear-gradient(135deg, #06b6d4, #0891b2)",
          scale: isHovered ? 1.2 : 0.8,
        }}
        transition={{ duration: 0.5 }}
      />
    </motion.div>
  )
}
