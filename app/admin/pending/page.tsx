"use client";

import { useEffect, useState } from "react";

type Clip = {
  id: string;
  user_id: string;
  platform: string;
  account_username: string;
  clip_url: string;
  status: string;
  earnings: number;
  created_at: string;
  campaign_id: string;
  views: number;
  campaign_name?: string;
  user_email?: string;
};

export default function PendingClipsPage() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPending = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/admin/clips/api");
      const json = await res.json();

      if (!res.ok) {
        console.error("ADMIN /admin/clips/api error:", json);
        setError(json.error || "Failed to load clips");
        setClips([]);
        return;
      }

      const allClips = (json.clips || []) as Clip[];
      const pendingOnly = allClips.filter((clip) => clip.status === "pending");

      setClips(pendingOnly);
    } catch (err) {
      console.error("FETCH PENDING ERROR:", err);
      setError("Network error while loading clips");
      setClips([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const updateClip = async (clip: Clip, status: "approved" | "rejected") => {
    const res = await fetch("/admin/clips/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clip, status }),
    });

    const json = await res.json();

    if (!res.ok) {
      console.error("UPDATE CLIP ERROR:", json);
      return;
    }

    loadPending();
  };

  const approveClip = (clip: Clip) => updateClip(clip, "approved");
  const rejectClip = (clip: Clip) => updateClip(clip, "rejected");

  if (loading) {
    return <p className="text-white p-6">Loading pending clips...</p>;
  }

  if (error) {
    return (
      <div className="p-6 text-white">
        <h1 className="text-2xl font-bold mb-4">⏳ Pending Clips</h1>
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

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
                <th className="border border-gray-700 p-3">Campaign</th>
                <th className="border border-gray-700 p-3">User Email</th>
                <th className="border border-gray-700 p-3">Clip</th>
                <th className="border border-gray-700 p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clips.map((clip) => (
                <tr key={clip.id} className="bg-gray-900">
                  <td className="border border-gray-700 p-3 text-center capitalize">
                    {clip.platform}
                  </td>
                  <td className="border border-gray-700 p-3 text-center">
                    {clip.account_username}
                  </td>
                  <td className="border border-gray-700 p-3 text-center">
                    {clip.campaign_name ?? "-"}
                  </td>
                  <td className="border border-gray-700 p-3 text-center">
                    {clip.user_email ?? "-"}
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
                  <td className="border border-gray-700 p-3 text-center flex gap-2 justify-center">
                    <button
                      onClick={() => approveClip(clip)}
                      className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => rejectClip(clip)}
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
