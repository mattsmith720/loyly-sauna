"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { fadeUp, fadeUpReduced, staggerContainer, viewportOnce } from "@/lib/motion-presets";
import { cn } from "@/lib/utils";

type StaggerChildrenProps = {
  children: ReactNode;
  className?: string;
  onLoad?: boolean;
};

export function StaggerChildren({ children, className, onLoad = false }: StaggerChildrenProps) {
  const reduceMotion = useReducedMotion();
  const containerVariants = reduceMotion ? { hidden: {}, visible: {} } : staggerContainer;

  return (
    <motion.div
      className={cn(className)}
      variants={containerVariants}
      initial="hidden"
      animate={onLoad ? "visible" : undefined}
      whileInView={onLoad ? undefined : "visible"}
      viewport={onLoad ? undefined : viewportOnce}
    >
      {children}
    </motion.div>
  );
}

type StaggerItemProps = {
  children: ReactNode;
  className?: string;
};

export function StaggerItem({ children, className }: StaggerItemProps) {
  const reduceMotion = useReducedMotion();
  const itemVariants = reduceMotion ? fadeUpReduced : fadeUp;

  return (
    <motion.div className={cn(className)} variants={itemVariants}>
      {children}
    </motion.div>
  );
}
