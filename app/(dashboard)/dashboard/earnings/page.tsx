"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabaseClient";

type Clip = {
  id: string;
  platform: string;
  account_username: string;
  earnings: number;
  status: string;
  created_at: string;
};

export default function EarningsPage() {
  const { user } = useUser();
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadClips = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("clips")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setClips(data as Clip[]);
      }

      setLoading(false);
    };

    loadClips();
  }, [user]);

  const totalEarnings = clips.reduce((sum, clip) => sum + clip.earnings, 0);

  const platformEarnings = clips.reduce((acc, clip) => {
    acc[clip.platform] = (acc[clip.platform] || 0) + clip.earnings;
    return acc;
  }, {} as Record<string, number>);

  const accountEarnings = clips.reduce((acc, clip) => {
    acc[clip.account_username] =
      (acc[clip.account_username] || 0) + clip.earnings;
    return acc;
  }, {} as Record<string, number>);

  if (loading) return <div className="p-6 text-white">Loading earnings...</div>;

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">💰 Earnings</h1>

      {/* TOTAL EARNINGS */}
      <div className="mb-8 p-6 bg-gray-900 rounded-xl border border-gray-700">
        <h2 className="text-xl font-semibold mb-2">Total Earnings</h2>
        <p className="text-3xl font-bold text-green-400">${totalEarnings}</p>
      </div>

      {/* EARNINGS BY PLATFORM */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Earnings by Platform</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(platformEarnings).map(([platform, amount]) => (
            <div
              key={platform}
              className="p-4 bg-gray-900 rounded-lg border border-gray-700"
            >
              <p className="text-sm text-gray-400 capitalize">{platform}</p>
              <p className="text-2xl font-bold text-blue-400">${amount}</p>
            </div>
          ))}
        </div>
      </div>

      {/* EARNINGS BY ACCOUNT */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Earnings by Account</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(accountEarnings).map(([acc, amount]) => (
            <div
              key={acc}
              className="p-4 bg-gray-900 rounded-lg border border-gray-700"
            >
              <p className="text-sm text-gray-400">{acc}</p>
              <p className="text-2xl font-bold text-purple-400">${amount}</p>
            </div>
          ))}
        </div>
      </div>

      {/* APPROVED CLIPS TABLE */}
      <h2 className="text-xl font-semibold mb-4">Approved Clips</h2>

      {clips.length === 0 ? (
        <p className="text-gray-400">No approved clips yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-700">
            <thead>
              <tr className="bg-gray-800">
                <th className="border border-gray-700 p-3">Platform</th>
                <th className="border border-gray-700 p-3">Account</th>
                <th className="border border-gray-700 p-3">Earnings</th>
                <th className="border border-gray-700 p-3">Date</th>
              </tr>
            </thead>

            <tbody>
              {clips.map((clip) => (
                <tr key={clip.id} className="bg-gray-900">
                  <td className="border border-gray-700 p-3 capitalize">
                    {clip.platform}
                  </td>

                  <td className="border border-gray-700 p-3">
                    {clip.account_username}
                  </td>

                  <td className="border border-gray-700 p-3 text-green-400 font-bold">
                    ${clip.earnings}
                  </td>

                  <td className="border border-gray-700 p-3">
                    {new Date(clip.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}