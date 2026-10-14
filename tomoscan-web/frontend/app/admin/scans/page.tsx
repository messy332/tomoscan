"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import Navbar from "@/components/Navbar";
import MaturityBadge from "@/components/ui/MaturityBadge";
import Skeleton from "@/components/ui/Skeleton";
import api from "@/lib/api";
import { ScanListItem } from "@/types";

export default function AdminScansPage() {
  const [scans, setScans] = useState<ScanListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const PAGE = 50;

  useEffect(() => {
    setLoading(true);
    api.get<ScanListItem[]>(`/admin/scans?skip=${page * PAGE}&limit=${PAGE}`)
      .then((r) => setScans(r.data))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role="admin" />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold mb-1">All Classification Runs</h1>
          <p className="text-gray-500 text-sm mb-6">Global audit trail across all users.</p>

          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-xs border-b border-gray-100">
                  <th className="text-left py-2 pr-3">File</th>
                  <th className="text-left py-2 pr-3">DT Result</th>
                  <th className="text-left py-2 pr-3">RF Result</th>
                  <th className="text-left py-2 pr-3">Agreement</th>
                  <th className="text-left py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array(8).fill(0).map((_, i) => (
                    <tr key={i}><td colSpan={5}><Skeleton className="h-10 my-1" /></td></tr>
                  ))
                  : scans.map((s, i) => (
                    <motion.tr
                      key={s.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b border-gray-50 hover:bg-gray-50"
                    >
                      <td className="py-2.5 pr-3 text-xs text-gray-500 font-mono truncate max-w-[140px]">
                        {s.image_filename}
                      </td>
                      <td className="py-2.5 pr-3"><MaturityBadge label={s.dt_prediction} /></td>
                      <td className="py-2.5 pr-3"><MaturityBadge label={s.rf_prediction} /></td>
                      <td className="py-2.5 pr-3">
                        <span className={`text-xs font-medium ${s.dt_prediction === s.rf_prediction ? "text-green-600" : "text-orange-500"}`}>
                          {s.dt_prediction === s.rf_prediction ? "✅ Agree" : "⚠️ Differ"}
                        </span>
                      </td>
                      <td className="py-2.5 text-xs text-gray-400">
                        {format(new Date(s.created_at), "MMM d, h:mm aa")}
                      </td>
                    </motion.tr>
                  ))
                }
              </tbody>
            </table>
          </div>

          <div className="flex justify-between mt-4">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
              className="text-sm px-4 py-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
              ← Previous
            </button>
            <button disabled={scans.length < PAGE} onClick={() => setPage(p => p + 1)}
              className="text-sm px-4 py-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
              Next →
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
