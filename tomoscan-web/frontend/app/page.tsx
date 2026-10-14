"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, isAdmin } from "@/lib/auth";
import { motion } from "framer-motion";
import Link from "next/link";

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace(isAdmin() ? "/admin" : "/dashboard");
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-lg"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="text-5xl mb-6"
        >
          🍅
        </motion.div>

        <h1 className="text-4xl font-bold text-white mb-2">
          Tomo<span className="text-tomato-500">Scan</span>
        </h1>
        <p className="text-gray-400 text-lg mb-3">
          AI-Powered Tomato Maturity &amp; Quality Classification.
        </p>
        <p className="text-gray-500 text-sm mb-10">
          Know when to pick. Make every harvest count.
        </p>

        <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full btn-primary py-3 text-base"
            >
              Sign In
            </motion.button>
          </Link>
          <Link href="/register">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3 rounded-xl border border-tomato-500 text-tomato-400
                         hover:bg-tomato-500/10 font-semibold text-base transition-all"
            >
              Create Account
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
