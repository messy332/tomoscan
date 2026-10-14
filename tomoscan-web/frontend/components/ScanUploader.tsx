"use client";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { ScanResponse } from "@/types";
import ScanResult from "./ScanResult";
import Skeleton from "./ui/Skeleton";

const MAX_MB = 5;

export default function ScanUploader({ onSaved }: { onSaved?: () => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResponse | null>(null);

  const onDrop = useCallback((accepted: File[]) => {
    const f = accepted[0];
    if (!f) return;
    if (f.size > MAX_MB * 1024 * 1024) {
      toast.error(`File too large. Max ${MAX_MB}MB.`);
      return;
    }
    setFile(f);
    setResult(null);
    const url = URL.createObjectURL(f);
    setPreview(url);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [] },
    maxFiles: 1,
  });

  const classify = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await api.post<ScanResponse>("/scans/classify", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
      onSaved?.();
      toast.success("Classification complete!");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Classification failed");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
  };

  return (
    <div className="space-y-5">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
          ${isDragActive ? "border-tomato-500 bg-tomato-50" : "border-gray-200 hover:border-tomato-300"}`}
      >
        <input {...getInputProps()} />
        {preview ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative h-48 rounded-xl overflow-hidden mx-auto max-w-xs"
          >
            <Image src={preview} alt="preview" fill className="object-cover" unoptimized />
          </motion.div>
        ) : (
          <div className="space-y-2 py-4">
            <div className="text-4xl">📷</div>
            <p className="text-gray-600 font-medium">Drop a tomato image here</p>
            <p className="text-gray-400 text-sm">or click to browse · JPG, PNG, WEBP · max {MAX_MB}MB</p>
          </div>
        )}
      </div>

      {/* Actions */}
      {file && !result && (
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={classify}
            disabled={loading}
            className="flex-1 btn-primary py-3"
          >
            {loading ? "Classifying…" : "🔬 Classify Tomato"}
          </motion.button>
          <button onClick={reset} className="px-4 py-3 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm">
            Reset
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result */}
      <AnimatePresence>
        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <ScanResult result={result} onReset={reset} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
