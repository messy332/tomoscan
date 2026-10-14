"use client";
import { motion } from "framer-motion";

const CLASSES = ["unripe", "ripe", "overripe"];

export default function ConfusionMatrix({ matrix, title }: { matrix: number[][], title: string }) {
  const max = Math.max(...matrix.flat());

  return (
    <div className="card">
      <h3 className="font-semibold text-sm text-gray-700 mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="text-xs w-full">
          <thead>
            <tr>
              <th className="pb-2 text-gray-400 font-normal text-left">Actual ↓ / Pred →</th>
              {CLASSES.map((c) => (
                <th key={c} className="pb-2 text-gray-500 font-semibold capitalize px-1">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => (
              <tr key={i}>
                <td className="py-1 pr-2 text-gray-500 font-semibold capitalize">{CLASSES[i]}</td>
                {row.map((val, j) => (
                  <motion.td
                    key={j}
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: (i * 3 + j) * 0.04 }}
                    className="py-1 px-1 text-center rounded-md font-bold"
                    style={{
                      backgroundColor: i === j
                        ? `rgba(232,68,26,${0.15 + (val / max) * 0.6})`
                        : `rgba(229,231,235,${0.3 + (val / max) * 0.5})`,
                      color: i === j ? "#c93410" : "#6b7280",
                    }}
                  >
                    {val}
                  </motion.td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
