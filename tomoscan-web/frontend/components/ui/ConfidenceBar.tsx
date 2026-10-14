"use client";
import { motion } from "framer-motion";
import { MATURITY_COLOR, MaturityLabel } from "@/types";

interface Props {
  label: MaturityLabel;
  value: number;  // 0-1
}

export default function ConfidenceBar({ label, value }: Props) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="capitalize text-gray-600">{label}</span>
        <span className="font-semibold" style={{ color: MATURITY_COLOR[label] }}>
          {(value * 100).toFixed(1)}%
        </span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: MATURITY_COLOR[label] }}
        />
      </div>
    </div>
  );
}
