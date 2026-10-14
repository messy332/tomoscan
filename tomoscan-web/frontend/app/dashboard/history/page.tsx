"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import Navbar from "@/components/Navbar";
import MaturityBadge from "@/components/ui/MaturityBadge";
import Skeleton from "@/components/ui/Skeleton";
import api from "@/lib/api";
import { ScanListItem } from "@/types";

export default function HistoryPage() {
  const [scans, setScans] = useState<ScanListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  const fetch = async (p: number) => {
    setLoading(true);
    const res = await api.get<ScanListItem[]>(`/scans/history?skip=${p * PAGE_SIZE}&limit=${PAGE_SIZE}`);
    setScans(res.data);
    setLoading(false);
  };

  useEffect(() => { fetch(page); }, [page]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role="member" />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold mb-1">History</h1>
          <p className="text-gray-500 text-sm mb-6">Your scans, from field to harvest.</p>

          <div className="space-y-3">
            {loading
              ? Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
              : scans.length === 0
                ? <p className="text-center text-gray-400 text-sm py-12">No classification history yet.</p>
                : scans.map((scan, i) => (
                  <motion.div
                    key={scan.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="card"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
                          {scan.image_filename}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {format(new Date(scan.created_at), "MMM d, yyyy · h:mm aa")}
                        </p>
                      </div>
                      <MaturityBadge label={scan.rf_prediction} />
                    </div>
                    <div className="flex gap-4 mt-3 text-xs text-gray-500">
                      <span>🌲 DT: <strong>{scan.dt_prediction}</strong> ({(scan.dt_confidence*100).toFixed(0)}%)</span>
                      <span>🌳 RF: <strong>{scan.rf_prediction}</strong> ({(scan.rf_confidence*100).toFixed(0)}%)</span>
                    </div>
                  </motion.div>
                ))
            }
          </div>

          {/* Pagination */}
          <div className="flex justify-between mt-6">
            <button
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="text-sm px-4 py-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
            >
              ← Previous
            </button>
            <button
              disabled={scans.length < PAGE_SIZE}
              onClick={() => setPage(p => p + 1)}
              className="text-sm px-4 py-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
            >
              Next →
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
