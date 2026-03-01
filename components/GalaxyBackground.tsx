'use client';

import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: string;
  y: string;
  opacity: number;
  duration: number;
}

export default function GalaxyBackground() {
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Use a timeout to avoid "synchronous setState in effect" warning
    const timer = setTimeout(() => {
      setMounted(true);
      const newParticles = [...Array(20)].map((_, i) => ({
        id: i,
        x: (Math.floor(Math.random() * 100)) + "%",
        y: (Math.floor(Math.random() * 100)) + "%",
        opacity: Math.random() * 0.5 + 0.2,
        duration: Math.random() * 10 + 10
      }));
      setParticles(newParticles);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#050505]">
      {/* Deep Space Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1e1b4b_0%,#050505_100%)]" />
      
      {/* Nebulae */}
      <motion.div 
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -top-1/4 -left-1/4 w-full h-full bg-[radial-gradient(circle_at_center,#4c1d95_0%,transparent_70%)] blur-[100px]"
      />
      <motion.div 
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5
        }}
        className="absolute -bottom-1/4 -right-1/4 w-full h-full bg-[radial-gradient(circle_at_center,#1e3a8a_0%,transparent_70%)] blur-[100px]"
      />

      {/* Star Field */}
      <div className="star-field" />

      {/* Floating Particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ 
            x: p.x, 
            y: p.y,
            opacity: p.opacity
          }}
          animate={{
            y: [null, "-20px", "20px", "0px"],
            x: [null, "10px", "-10px", "0px"],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute w-1 h-1 bg-white rounded-full blur-[1px]"
        />
      ))}
    </div>
  );
}
