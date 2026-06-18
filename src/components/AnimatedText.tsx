'use client';

import * as React from "react";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedTextProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string;
  gradientColors?: string;
  gradientAnimationDuration?: number;
  hoverEffect?: boolean;
  className?: string;
  textClassName?: string;
}

const AnimatedText = React.forwardRef<HTMLDivElement, AnimatedTextProps>(
  (
    {
      text,
      gradientColors = "linear-gradient(90deg, #d4af37, #f7e7b4, #b8860b, #f7e7b4, #d4af37)",
      gradientAnimationDuration = 4,
      hoverEffect = true,
      className,
      textClassName,
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = React.useState(false);

    const textVariants: Variants = {
      initial: {
        backgroundPosition: "0% 50%",
      },
      animate: {
        backgroundPosition: "200% 50%",
        transition: {
          duration: gradientAnimationDuration,
          repeat: Infinity,
          ease: "linear",
        },
      },
    };

    return (
      <div
        ref={ref}
        className={cn("flex justify-center items-center py-2", className)}
        {...props}
      >
        <motion.h1
          className={cn("text-[3.2rem] sm:text-[4.2rem] md:text-[5rem] lg:text-[5.8rem] leading-normal font-display tracking-widest uppercase text-glow", textClassName)}
          style={{
            background: gradientColors,
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: isHovered ? "0 0 16px rgba(232,201,122,0.4)" : "none",
          }}
          variants={textVariants}
          initial="initial"
          animate="animate"
          onHoverStart={() => hoverEffect && setIsHovered(true)}
          onHoverEnd={() => hoverEffect && setIsHovered(false)}
        >
          {text}
        </motion.h1>
      </div>
    );
  }
);

AnimatedText.displayName = "AnimatedText";

export { AnimatedText };
