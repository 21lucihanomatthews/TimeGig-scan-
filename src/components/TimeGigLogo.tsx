import React, { useState, useEffect } from "react";
import { motion } from "motion/react";

interface TimeGigLogoProps {
  size?: "large" | "small";
  darkTheme?: boolean;
  className?: string;
}

export default function TimeGigLogo({ size = "large", darkTheme = true, className = "" }: TimeGigLogoProps) {
  const [isHit, setIsHit] = useState(false);
  const [triggerKey, setTriggerKey] = useState(0);

  useEffect(() => {
    // Auto trigger the animation 800ms after load
    const timer = setTimeout(() => {
      setIsHit(true);
    }, 800);
    return () => clearTimeout(timer);
  }, [triggerKey]);

  const handleLogoClick = () => {
    setIsHit(false);
    // Restart animation
    setTimeout(() => {
      setTriggerKey((prev) => prev + 1);
    }, 100);
  };

  const timeColor = darkTheme ? "text-white" : "text-slate-900";
  const gigColor = darkTheme ? "text-yellow-400" : "text-blue-600";
  const containerSizeClass = size === "large" ? "text-5xl" : "text-2xl";
  const ballSizeClass = size === "large" ? "text-3xl" : "text-xl";

  // Offset of the ball relative to the scale
  const initialX = size === "large" ? 180 : 100;
  const targetX = size === "large" ? 105 : 55;
  const bounceX = size === "large" ? 120 : 65;
  const finalX = size === "large" ? 140 : 75;

  const initialY = size === "large" ? -60 : -30;
  const targetY = size === "large" ? 2 : 1;
  const bounceY = size === "large" ? 30 : 15;
  const finalY = size === "large" ? 70 : 35;

  return (
    <div 
      onClick={handleLogoClick}
      className={`inline-flex items-center relative select-none cursor-pointer group ${className}`}
      title="Click to kick the soccer ball again! ⚽"
    >
      {/* "Time" display */}
      <span className={`${containerSizeClass} font-black uppercase tracking-tight ${timeColor}`}>
        Time
      </span>

      {/* "GiG" hangs skew after soccer ball collision */}
      <motion.span
        key={`gig-${triggerKey}`}
        className={`inline-block ${containerSizeClass} font-black uppercase tracking-tight origin-top-left ${gigColor}`}
        style={{ marginLeft: size === "large" ? "4px" : "2px" }}
        initial={{ rotate: 0, y: 0 }}
        animate={isHit ? {
          rotate: [0, -12, 28, 15, 20, 18],
          y: [0, -4, 4, 1, 3, 2],
        } : { rotate: 0, y: 0 }}
        transition={isHit ? {
          type: "keyframes",
          duration: 3.25,
          ease: "easeOut",
          delay: 1.75, // Hits when ball collides around 1.75s
        } : { duration: 0.1 }}
      >
        GiG
      </motion.span>

      {/* Interactive flying soccer ball */}
      <motion.span
        key={`ball-${triggerKey}`}
        className={`absolute ${ballSizeClass} pointer-events-none`}
        initial={{ x: initialX, y: initialY, rotate: 0, opacity: 0 }}
        animate={isHit ? {
          x: [initialX, targetX, bounceX, finalX],
          y: [initialY, targetY, bounceY, finalY],
          rotate: [0, -420, -720, -1080],
          opacity: [0, 1, 1, 0]
        } : {
          x: initialX,
          y: initialY,
          rotate: 0,
          opacity: 0
        }}
        transition={{
          duration: 5,
          times: [0, 0.35, 0.65, 1], // Hits exactly at 0.35 * 5s (~1.75s)
          ease: "easeIn"
        }}
      >
        ⚽
      </motion.span>
    </div>
  );
}
