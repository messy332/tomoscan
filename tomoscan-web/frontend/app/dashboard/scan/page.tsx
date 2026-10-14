"use client";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import ScanUploader from "@/components/ScanUploader";

export default function ScanPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role="member" />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold mb-1">Classify Tomato</h1>
          <p className="text-gray-500 text-sm mb-6">
            Upload an image — both Decision Tree &amp; Random Forest will analyse it simultaneously.
          </p>
          <ScanUploader />
        </motion.div>
      </main>
    </div>
  );
}
