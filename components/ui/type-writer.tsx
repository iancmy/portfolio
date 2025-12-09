"use client";

import { cn } from "@/lib/utils";
/**
 * @author: @dorian_baffier
 * @description: Typewriter
 * @version: 1.0.0
 * @date: 2025-06-26
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import { motion, useAnimate } from "motion/react";
import { useEffect } from "react";

export interface TypewriterSequence {
  text: string;
  deleteAfter?: boolean;
  pauseAfter?: number;
}

interface TypewriterTitleProps {
  sequences?: TypewriterSequence[];
  typingSpeed?: number;
  startDelay?: number;
  autoLoop?: boolean;
  loopDelay?: number;
  className?: string;
  prepend?: string;
}

export default function TypewriterTitle({
  sequences = [
    { text: "Typewriter", deleteAfter: true },
    { text: "Multiple Words", deleteAfter: true },
    { text: "Auto Loop", deleteAfter: false },
  ],
  typingSpeed = 75,
  startDelay = 0,
  autoLoop = true,
  loopDelay = 5000,
  className,
  prepend,
}: TypewriterTitleProps) {
  const [scope, animate] = useAnimate();

  useEffect(() => {
    let isActive = true;

    const typeText = async () => {
      const titleElement = scope.current.querySelector("[data-typewriter]");
      if (!titleElement) return;

      while (isActive) {
        await animate(scope.current, { opacity: 1 });

        await new Promise((resolve) => setTimeout(resolve, startDelay));

        for (const sequence of sequences) {
          if (!isActive) break;

          for (let i = 0; i < sequence.text.length; i++) {
            if (!isActive) break;
            titleElement.textContent = sequence.text.slice(0, i + 1);
            await new Promise((resolve) => setTimeout(resolve, typingSpeed));
          }

          if (sequence.pauseAfter) {
            await new Promise((resolve) =>
              setTimeout(resolve, sequence.pauseAfter),
            );
          }

          if (sequence.deleteAfter) {
            await new Promise((resolve) => setTimeout(resolve, 500));

            for (let i = sequence.text.length; i > 0; i--) {
              if (!isActive) break;
              titleElement.textContent = sequence.text.slice(0, i);
              await new Promise((resolve) =>
                setTimeout(resolve, typingSpeed / 2),
              );
            }
          }
        }

        if (!autoLoop || !isActive) break;

        await new Promise((resolve) => setTimeout(resolve, loopDelay));
      }
    };

    typeText();

    return () => {
      isActive = false;
    };
  }, [sequences, typingSpeed, startDelay, autoLoop, loopDelay, animate, scope]);

  return (
    <motion.div
      className={cn(
        "font-title tracking-tight flex items-center gap-2",
        className,
      )}
      ref={scope}
    >
      <span className="whitespace-nowrap">{prepend}</span>
      <span
        data-typewriter
        className="inline-block border-r-2 animate-cursor pr-1"
      >
        {sequences[0].text}
      </span>
    </motion.div>
  );
}
