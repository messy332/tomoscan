"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { format } from "date-fns";
import Navbar from "@/components/Navbar";
import MaturityBadge from "@/components/ui/MaturityBadge";
import Skeleton from "@/components/ui/Skeleton";
import api from "@/lib/api";
import { getTokenPayload } from "@/lib/auth";
import { ScanListItem } from "@/types";

export default function DashboardHome() {
  const payload = getTokenPayload();
  const [scans, setScans] = useState<ScanListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<ScanListItem[]>("/scans/history?limit=5")
      .then((r) => setScans(r.data))
      .finally(() => setLoading(false));
  }, []);

  const firstName = payload ? "User" : "Farmer";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role="member" />

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold">Hello, {firstName} 👋</h1>
          <p className="text-gray-500 text-sm mt-0.5">Your harvest dashboard</p>
        </motion.div>

        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-tomato-500 rounded-2xl p-5 text-white"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-tomato-200 mb-1">Your harvest, simplified</p>
          <h2 className="text-xl font-bold mb-1">Scan Tomato Maturity</h2>
          <p className="text-tomato-100 text-sm mb-4">Detect unripe, ripe, or overripe instantly using AI.</p>
          <Link href="/dashboard/scan">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="bg-white text-tomato-600 font-semibold px-5 py-2 rounded-xl text-sm"
            >
              📷 Let&apos;s check your harvest
            </motion.button>
          </Link>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { href: "/dashboard/scan",    icon: "🔬", title: "Scan",    sub: "Classify a tomato image" },
            { href: "/dashboard/history", icon: "📋", title: "History", sub: "View past classifications" },
          ].map((item, i) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
            >
              <Link href={item.href}>
                <div className="card hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <p className="font-semibold text-sm">{item.title}</p>
                  <p className="text-xs text-gray-400">{item.sub}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Recent Scans */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-800">Recent scans</h3>
            <Link href="/dashboard/history" className="text-sm text-tomato-500 hover:underline">View all</Link>
          </div>

          <div className="space-y-2">
            {loading
              ? Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
              : scans.length === 0
                ? <p className="text-sm text-gray-400 text-center py-6">No scans yet. Upload your first tomato!</p>
                : scans.map((scan, i) => (
                  <motion.div
                    key={scan.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="card flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs text-gray-500">
                        {format(new Date(scan.created_at), "MMM d, h:mm aa")}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        RF: {(scan.rf_confidence * 100).toFixed(0)}% confidence
                      </p>
                    </div>
                    <MaturityBadge label={scan.rf_prediction} />
                  </motion.div>
                ))
            }
          </div>
        </motion.div>
      </main>
    </div>
  );
}
