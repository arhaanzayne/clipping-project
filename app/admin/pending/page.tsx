"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Clip = {
  id: string;
  user_id: string;
  clip_url: string;
  platform: string;
  account_username: string;
  created_at: string;
};

export default function PendingClipsPage() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState<Record<string, number>>({});

  // Load pending clips
  const fetchClips = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("clips")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setClips(data as Clip[]);
    }

    setLoading(false);
  };

  // Approve clip
  const approveClip = async (clipId: string) => {
    const amount = earnings[clipId] || 0;

    await supabase
      .from("clips")
      .update({ status: "approved", earnings: amount })
      .eq("id", clipId);

    fetchClips();
  };

  // Reject clip
  const rejectClip = async (clipId: string) => {
    await supabase
      .from("clips")
      .update({ status: "rejected", earnings: 0 })
      .eq("id", clipId);

    fetchClips();
  };

  useEffect(() => {
    fetchClips();
  }, []);

  if (loading) return <p className="text-white p-6">Loading pending clips...</p>;

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">⏳ Pending Clips</h1>

      {clips.length === 0 ? (
        <p className="text-gray-400">No pending clips.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-700">
            <thead>
              <tr className="bg-gray-800">
                <th className="border border-gray-700 p-3">Platform</th>
                <th className="border border-gray-700 p-3">Account</th>
                <th className="border border-gray-700 p-3">Clip</th>
                <th className="border border-gray-700 p-3">Earnings ($)</th>
                <th className="border border-gray-700 p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {clips.map((clip) => (
                <tr key={clip.id} className="bg-gray-900">
                  <td className="border border-gray-700 p-3 capitalize text-center">
                    {clip.platform}
                  </td>

                  <td className="border border-gray-700 p-3 text-center">
                    {clip.account_username}
                  </td>

                  <td className="border border-gray-700 p-3 text-center">
                    <a
                      href={clip.clip_url}
                      className="text-blue-400 underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open Clip
                    </a>
                  </td>

                  <td className="border border-gray-700 p-3 text-center">
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder="0.00"
                      className="bg-gray-800 border border-gray-600 p-2 rounded text-center w-24"
                      value={earnings[clip.id] || ""}
                      onChange={(e) =>
                        setEarnings({
                          ...earnings,
                          [clip.id]: Number(e.target.value),
                        })
                      }
                    />
                  </td>

                  <td className="border border-gray-700 p-3 text-center flex gap-2 justify-center">
                    <button
                      onClick={() => approveClip(clip.id)}
                      className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => rejectClip(clip.id)}
                      className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
                    >
                      Reject
                    </button>
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
