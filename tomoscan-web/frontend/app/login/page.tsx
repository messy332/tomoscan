"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import Link from "next/link";
import api from "@/lib/api";
import { isAdmin } from "@/lib/auth";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", data);
      Cookies.set("access_token", res.data.access_token, { secure: true, sameSite: "strict" });
      Cookies.set("refresh_token", res.data.refresh_token, { secure: true, sameSite: "strict" });
      toast.success("Welcome back!");
      router.push(isAdmin() ? "/admin" : "/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md"
      >
        <Link href="/" className="text-sm text-gray-400 flex items-center gap-1 mb-6 hover:text-tomato-500 transition-colors">
          ← Back
        </Link>

        <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
        <p className="text-gray-500 text-sm mb-8">Sign in to keep your harvest growing.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Email Address</label>
            <input {...register("email")} placeholder="Enter your email address"
              className="input-field" type="email" autoComplete="email" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
            <input {...register("password")} placeholder="Enter your password"
              className="input-field" type="password" autoComplete="current-password" />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full btn-primary py-3 mt-2"
          >
            {loading ? "Signing in…" : "Log In"}
          </motion.button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-tomato-500 font-semibold hover:underline">Register</Link>
        </p>
      </motion.div>
    </main>
  );
}
