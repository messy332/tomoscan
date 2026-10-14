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

const schema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string()
    .min(8, "At least 8 characters")
    .regex(/[A-Z]/, "Must include uppercase")
    .regex(/\d/, "Must include a number"),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/register", {
        full_name: data.full_name,
        email: data.email,
        password: data.password,
      });
      Cookies.set("access_token", res.data.access_token, { secure: true, sameSite: "strict" });
      Cookies.set("refresh_token", res.data.refresh_token, { secure: true, sameSite: "strict" });
      toast.success("Account created!");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md"
      >
        <Link href="/" className="text-sm text-gray-400 flex items-center gap-1 mb-6 hover:text-tomato-500 transition-colors">
          ← Back
        </Link>

        <h1 className="text-2xl font-bold mb-1">Create your account</h1>
        <p className="text-gray-500 text-sm mb-8">Your smarter harvest starts here.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {[
            { label: "Full Name",        name: "full_name",        type: "text",     placeholder: "Enter your full name" },
            { label: "Email Address",    name: "email",            type: "email",    placeholder: "Enter your email address" },
            { label: "Password",         name: "password",         type: "password", placeholder: "Create a password" },
            { label: "Confirm Password", name: "confirm_password", type: "password", placeholder: "Re-enter your password" },
          ].map(({ label, name, type, placeholder }) => (
            <div key={name}>
              <label className="text-sm font-medium text-gray-700 block mb-1">{label}</label>
              <input
                {...register(name as keyof FormData)}
                type={type}
                placeholder={placeholder}
                className="input-field"
                autoComplete={type === "password" ? "new-password" : undefined}
              />
              {errors[name as keyof FormData] && (
                <p className="text-red-500 text-xs mt-1">{errors[name as keyof FormData]?.message}</p>
              )}
            </div>
          ))}

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full btn-primary py-3 mt-2"
          >
            {loading ? "Creating account…" : "Register"}
          </motion.button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-tomato-500 font-semibold hover:underline">Sign in.</Link>
        </p>
      </motion.div>
    </main>
  );
}
