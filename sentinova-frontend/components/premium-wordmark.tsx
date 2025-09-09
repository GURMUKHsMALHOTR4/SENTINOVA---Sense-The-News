"use client"

import { motion } from "framer-motion"
import { useState } from "react"

export function PremiumWordmark() {
  const [isHovered, setIsHovered] = useState(false)

  const letterVariants = {
    initial: { y: 0, rotateX: 0 },
    hover: (i: number) => ({
      y: [-2, -8, -2],
      rotateX: [0, 10, 0],
      transition: {
        duration: 0.6,
        delay: i * 0.1,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse" as const,
      },
    }),
  }

  const letters = "Sentinova".split("")

  return (
    <motion.div
      className="flex items-center cursor-pointer"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="flex">
        {letters.map((letter, i) => (
          <motion.span
            key={i}
            className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent inline-block"
            variants={letterVariants}
            initial="initial"
            animate={isHovered ? "hover" : "initial"}
            custom={i}
            style={{
              background: isHovered
                ? "linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6, #06b6d4)"
                : "linear-gradient(135deg, #0f172a, #06b6d4, #0f172a)",
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
            whileHover={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              transition: { duration: 2, repeat: Number.POSITIVE_INFINITY },
            }}
          >
            {letter}
          </motion.span>
        ))}
      </div>

      {/* Underline Effect */}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary via-accent to-primary"
        initial={{ width: 0, opacity: 0 }}
        animate={{
          width: isHovered ? "100%" : 0,
          opacity: isHovered ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  )
}
