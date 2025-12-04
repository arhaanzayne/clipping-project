"use client";

import { useEffect, useState } from "react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      console.log("USERS RESPONSE:", data);

      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        setUsers([]);
      }
    }
    load();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-white">Users</h1>

      {/* DARK THEME TABLE */}
      <table className="w-full border border-gray-700 text-sm text-gray-200">
        <thead className="bg-gray-800 text-gray-300">
          <tr>
            <th className="p-3 border border-gray-700 text-left">User ID</th>
            <th className="p-3 border border-gray-700 text-left">Email</th>
            <th className="p-3 border border-gray-700 text-left">Approved Clips</th>
            <th className="p-3 border border-gray-700 text-left">Total Earnings</th>
            <th className="p-3 border border-gray-700 text-left">Joined</th>
          </tr>
        </thead>

        <tbody className="bg-[#0d0d0d]">
          {users.map((u: any, i) => (
            <tr
              key={u.id}
              className={i % 2 === 0 ? "bg-[#0f0f0f]" : "bg-[#141414]"}
            >
              <td className="p-3 border border-gray-800">{u.id}</td>
              <td className="p-3 border border-gray-800">{u.email}</td>
              <td className="p-3 border border-gray-800">
                {u.total_approved_clips}
              </td>
              <td className="p-3 border border-gray-800">
                ${u.total_earnings}
              </td>
              <td className="p-3 border border-gray-800">
                {new Date(u.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}

          {users.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center p-4 text-gray-500">
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
