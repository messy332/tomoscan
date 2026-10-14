"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Skeleton from "@/components/ui/Skeleton";
import CVScoresChart from "@/components/charts/CVScoresChart";
import ConfusionMatrix from "@/components/charts/ConfusionMatrix";
import api from "@/lib/api";

interface EvalReport {
  dt: {
    name: string; accuracy: number; cv_mean: number; cv_std: number;
    cv_scores: number[]; confusion_matrix: number[][];
    classification_report: Record<string, any>;
  };
  rf: {
    name: string; accuracy: number; cv_mean: number; cv_std: number;
    cv_scores: number[]; confusion_matrix: number[][];
    classification_report: Record<string, any>;
  };
}

export default function AdminDashboard() {
  const [report, setReport] = useState<EvalReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<EvalReport>("/admin/evaluation")
      .then((r) => setReport(r.data))
      .finally(() => setLoading(false));
  }, []);

  const StatCard = ({ title, value, sub }: { title: string; value: string; sub?: string }) => (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card text-center"
    >
      <p className="text-xs text-gray-400 mb-1">{title}</p>
      <p className="text-2xl font-bold text-tomato-500">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role="admin" />
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-2xl font-bold">Model Evaluation</h1>
          <p className="text-gray-500 text-sm">Side-by-side comparison of both classifiers.</p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24" />)}
          </div>
        ) : report ? (
          <>
            {/* Accuracy Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard title="DT Test Accuracy"  value={`${(report.dt.accuracy * 100).toFixed(1)}%`} />
              <StatCard title="RF Test Accuracy"  value={`${(report.rf.accuracy * 100).toFixed(1)}%`} />
              <StatCard title="DT CV Mean ± Std"  value={`${(report.dt.cv_mean * 100).toFixed(1)}%`} sub={`±${(report.dt.cv_std * 100).toFixed(2)}%`} />
              <StatCard title="RF CV Mean ± Std"  value={`${(report.rf.cv_mean * 100).toFixed(1)}%`} sub={`±${(report.rf.cv_std * 100).toFixed(2)}%`} />
            </div>

            {/* CV Chart */}
            <CVScoresChart dtScores={report.dt.cv_scores} rfScores={report.rf.cv_scores} />

            {/* Confusion Matrices */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ConfusionMatrix matrix={report.dt.confusion_matrix} title="Decision Tree — Confusion Matrix" />
              <ConfusionMatrix matrix={report.rf.confusion_matrix} title="Random Forest — Confusion Matrix" />
            </div>

            {/* Per-class metrics */}
            {[{ key: "dt", m: report.dt }, { key: "rf", m: report.rf }].map(({ key, m }) => (
              <motion.div key={key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card overflow-x-auto">
                <h3 className="font-semibold text-sm mb-3">{m.name} — Per-Class Metrics</h3>
                <table className="text-xs w-full">
                  <thead>
                    <tr className="text-gray-400">
                      <th className="text-left py-1 pr-4">Class</th>
                      <th>Precision</th><th>Recall</th><th>F1-Score</th><th>Support</th>
                    </tr>
                  </thead>
                  <tbody>
                    {["unripe", "ripe", "overripe"].map((c) => {
                      const row = m.classification_report[c];
                      return row ? (
                        <tr key={c} className="border-t border-gray-50">
                          <td className="py-1.5 pr-4 font-medium capitalize">{c}</td>
                          <td className="text-center">{(row.precision * 100).toFixed(1)}%</td>
                          <td className="text-center">{(row.recall * 100).toFixed(1)}%</td>
                          <td className="text-center font-semibold text-tomato-500">{(row["f1-score"] * 100).toFixed(1)}%</td>
                          <td className="text-center text-gray-400">{row.support}</td>
                        </tr>
                      ) : null;
                    })}
                  </tbody>
                </table>
              </motion.div>
            ))}
          </>
        ) : (
          <p className="text-red-500 text-sm">Could not load evaluation report.</p>
        )}
      </main>
    </div>
  );
}
