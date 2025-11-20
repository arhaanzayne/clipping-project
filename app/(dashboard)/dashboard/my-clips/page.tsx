"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabaseClient";

type Clip = {
  id: string;
  clip_url: string;
  platform: string;
  account_username: string;
  status: string;
  earnings: number;
  created_at: string;
};

export default function MyClipsPage() {
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
        .order("created_at", { ascending: false });

      if (!error && data) {
        setClips(data as Clip[]);
      }

      setLoading(false);
    };

    loadClips();
  }, [user]);

  const statusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-400";
      case "approved":
        return "text-green-400";
      case "rejected":
        return "text-red-400";
      default:
        return "text-gray-300";
    }
  };

  if (loading) return <div className="p-6 text-white">Loading clips...</div>;

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">My Clips</h1>

      {clips.length === 0 ? (
        <p className="text-gray-400">You haven't submitted any clips yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-700">
            <thead>
              <tr className="bg-gray-800">
                <th className="border border-gray-700 p-3">Platform</th>
                <th className="border border-gray-700 p-3">Account</th>
                <th className="border border-gray-700 p-3">Clip URL</th>
                <th className="border border-gray-700 p-3">Status</th>
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

                  <td className="border border-gray-700 p-3">
                    <a
                      href={clip.clip_url}
                      className="text-blue-400 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Clip
                    </a>
                  </td>

                  <td
                    className={`border border-gray-700 p-3 font-semibold ${statusColor(
                      clip.status
                    )}`}
                  >
                    {clip.status}
                  </td>

                  <td className="border border-gray-700 p-3">
                    ₹{clip.earnings}
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
