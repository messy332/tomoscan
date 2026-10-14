"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { motion } from "framer-motion";

interface Props {
  dtScores: number[];
  rfScores: number[];
}

export default function CVScoresChart({ dtScores, rfScores }: Props) {
  const data = dtScores.map((dt, i) => ({
    fold: `Fold ${i + 1}`,
    "Decision Tree": +(dt * 100).toFixed(2),
    "Random Forest": +(rfScores[i] * 100).toFixed(2),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card"
    >
      <h3 className="font-semibold text-sm text-gray-700 mb-4">5-Fold Cross-Validation Accuracy (%)</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barCategoryGap="30%">
          <XAxis dataKey="fold" tick={{ fontSize: 11 }} />
          <YAxis domain={[85, 100]} tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v: number) => `${v}%`} />
          <Bar dataKey="Decision Tree" fill="#94a3b8" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Random Forest" fill="#E8441A" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
