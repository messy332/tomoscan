"use client";
import { motion } from "framer-motion";

export default function Skeleton({ className = "" }: { className?: string }) {
  return (
    <motion.div
      animate={{ opacity: [0.4, 0.8, 0.4] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className={`bg-gray-200 rounded-lg ${className}`}
    />
  );
}
