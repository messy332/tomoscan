"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { logout } from "@/lib/auth";
import toast from "react-hot-toast";

interface Props {
  role: "member" | "admin";
  fullName?: string;
}

const memberLinks = [
  { href: "/dashboard",         label: "Home",       icon: "🏠" },
  { href: "/dashboard/scan",    label: "Scan",       icon: "🔬" },
  { href: "/dashboard/stats",   label: "Statistics", icon: "📊" },
  { href: "/dashboard/history", label: "History",    icon: "🕐" },
  { href: "/dashboard/profile", label: "Profile",    icon: "👤" },
];
const adminLinks = [
  { href: "/admin",             label: "Dashboard",  icon: "📈" },
  { href: "/admin/users",       label: "Users",      icon: "👥" },
  { href: "/admin/scans",       label: "All Scans",  icon: "📋" },
  { href: "/admin/evaluation",  label: "Evaluation", icon: "🧪" },
];

export default function Navbar({ role, fullName }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const links = role === "admin" ? adminLinks : memberLinks;

  const handleLogout = () => {
    logout();
    toast.success("Signed out");
    router.push("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href={role === "admin" ? "/admin" : "/dashboard"}>
          <span className="font-bold text-lg">
            Tomo<span className="text-tomato-500">Scan</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link key={l.href} href={l.href}>
              <motion.span
                whileHover={{ scale: 1.05 }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                  ${pathname === l.href ? "bg-tomato-50 text-tomato-600" : "text-gray-500 hover:text-gray-800"}`}
              >
                {l.label}
              </motion.span>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {fullName && <span className="text-sm text-gray-500 hidden sm:block">{fullName}</span>}
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-tomato-500 transition-colors px-2 py-1 rounded-lg"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
