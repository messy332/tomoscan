"use client";
import { motion } from "framer-motion";
import { ScanResponse, MaturityLabel, MATURITY_COLOR } from "@/types";
import MaturityBadge from "./ui/MaturityBadge";
import ConfidenceBar from "./ui/ConfidenceBar";

const CLASSES: MaturityLabel[] = ["unripe", "ripe", "overripe"];

function ModelCard({ title, result }: { title: string; result: ScanResponse["dt"] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card flex-1"
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</p>
        <MaturityBadge label={result.prediction} />
      </div>

      <div className="space-y-2.5 mb-4">
        {CLASSES.map((c) => (
          <ConfidenceBar key={c} label={c} value={result.probabilities[c]} />
        ))}
      </div>

      <div className="flex justify-between text-xs text-gray-400 border-t border-gray-100 pt-3">
        <span>Confidence</span>
        <span
          className="font-bold text-sm"
          style={{ color: MATURITY_COLOR[result.prediction as MaturityLabel] }}
        >
          {(result.confidence * 100).toFixed(1)}%
        </span>
      </div>
      <div className="flex justify-between text-xs text-gray-400 pt-1">
        <span>Latency</span>
        <span className="font-medium">{result.latency_ms.toFixed(2)} ms</span>
      </div>
    </motion.div>
  );
}

export default function ScanResult({ result, onReset }: { result: ScanResponse; onReset: () => void }) {
  const agree = result.dt.prediction === result.rf.prediction;

  return (
    <div className="space-y-4">
      {/* Agreement Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2
          ${agree ? "bg-harvest-100 text-harvest-700" : "bg-orange-50 text-orange-600"}`}
      >
        {agree ? "✅ Both models agree on the classification." : "⚠️ Models disagree — review both results below."}
      </motion.div>

      {/* Side by side */}
      <div className="flex gap-4 flex-col sm:flex-row">
        <ModelCard title="Decision Tree" result={result.dt} />
        <ModelCard title="Random Forest" result={result.rf} />
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onReset}
        className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-all"
      >
        📷 Scan Another Tomato
      </motion.button>
    </div>
  );
}
