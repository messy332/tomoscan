"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Skeleton from "@/components/ui/Skeleton";
import api from "@/lib/api";
import { User } from "@/types";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get<User[]>("/admin/users?limit=100")
      .then((r) => setUsers(r.data))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const toggle = async (user: User) => {
    try {
      await api.patch(`/admin/users/${user.id}`, { is_active: !user.is_active });
      toast.success(`User ${user.is_active ? "deactivated" : "activated"}`);
      load();
    } catch {
      toast.error("Update failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role="admin" />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold mb-1">User Management</h1>
          <p className="text-gray-500 text-sm mb-6">{users.length} registered users</p>

          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-xs border-b border-gray-100">
                  <th className="text-left py-2 pr-4">Name</th>
                  <th className="text-left py-2 pr-4">Email</th>
                  <th className="text-left py-2 pr-4">Role</th>
                  <th className="text-left py-2 pr-4">Joined</th>
                  <th className="text-left py-2">Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array(5).fill(0).map((_, i) => (
                    <tr key={i}><td colSpan={6}><Skeleton className="h-10 my-1" /></td></tr>
                  ))
                  : users.map((u, i) => (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-gray-50 hover:bg-gray-50"
                    >
                      <td className="py-3 pr-4 font-medium">{u.full_name}</td>
                      <td className="py-3 pr-4 text-gray-500">{u.email}</td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                          ${u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-50 text-blue-600"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-gray-400 text-xs">
                        {format(new Date(u.created_at), "MMM d, yyyy")}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                          ${u.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                          {u.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => toggle(u)}
                          className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors
                            ${u.is_active
                              ? "bg-red-50 text-red-600 hover:bg-red-100"
                              : "bg-green-50 text-green-600 hover:bg-green-100"}`}
                        >
                          {u.is_active ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </motion.tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
