"use client";

import { useEffect, useState } from "react";

type Clip = {
  id: string;
  platform: string;
  account_username: string;
  clip_url: string;
  status: string;
  created_at: string;
  earnings: number | null;
  views: number | null;
  campaign_name?: string;
  user_email?: string;
};

export default function AdminClipsPage() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [filtered, setFiltered] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);

  const [platformFilter, setPlatformFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [campaignFilter, setCampaignFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await fetch("/api/admin/clips");
      const json = await res.json();

      if (res.ok) {
        setClips(json.clips);
        setFiltered(json.clips);
      }

      setLoading(false);
    };

    load();
  }, []);

  // FILTER HANDLER
  useEffect(() => {
    let f = [...clips];

    if (platformFilter) f = f.filter((c) => c.platform === platformFilter);
    if (statusFilter) f = f.filter((c) => c.status === statusFilter);
    if (campaignFilter) f = f.filter((c) => c.campaign_name === campaignFilter);
    if (emailFilter) f = f.filter((c) => c.user_email === emailFilter);

    setFiltered(f);
  }, [platformFilter, statusFilter, campaignFilter, emailFilter, clips]);

  if (loading) return <p className="text-white p-6">Loading clips…</p>;

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">📊 All Clips</h1>

      {/* FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

        <select
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value)}
          className="p-3 bg-gray-800 border border-gray-700 rounded"
        >
          <option value="">All Platforms</option>
          <option value="instagram">Instagram</option>
          <option value="tiktok">TikTok</option>
          <option value="youtube">YouTube</option>
          <option value="x">Twitter/X</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-3 bg-gray-800 border border-gray-700 rounded"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <input
          type="text"
          placeholder="Filter by campaign"
          value={campaignFilter}
          onChange={(e) => setCampaignFilter(e.target.value)}
          className="p-3 bg-gray-800 border border-gray-700 rounded"
        />

        <input
          type="text"
          placeholder="Filter by user email"
          value={emailFilter}
          onChange={(e) => setEmailFilter(e.target.value)}
          className="p-3 bg-gray-800 border border-gray-700 rounded"
        />
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-700">
          <thead>
            <tr className="bg-gray-800">
              <th className="border p-3">Platform</th>
              <th className="border p-3">Account</th>
              <th className="border p-3">Campaign</th>
              <th className="border p-3">User Email</th>
              <th className="border p-3">Views</th>
              <th className="border p-3">Earnings</th>
              <th className="border p-3">Status</th>
              <th className="border p-3">Clip</th>
              <th className="border p-3">Date</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((clip) => (
              <tr key={clip.id} className="bg-gray-900">
                <td className="border p-3 capitalize">{clip.platform}</td>
                <td className="border p-3">{clip.account_username}</td>
                <td className="border p-3">{clip.campaign_name || "-"}</td>
                <td className="border p-3">{clip.user_email || "-"}</td>
                <td className="border p-3">{clip.views ?? 0}</td>
                <td className="border p-3 text-green-400 font-bold">
                  ${clip.earnings ?? 0}
                </td>
                <td className="border p-3 capitalize">{clip.status}</td>

                <td className="border p-3">
                  <a
                    href={clip.clip_url}
                    target="_blank"
                    className="text-blue-400 underline"
                  >
                    Open
                  </a>
                </td>

                <td className="border p-3">
                  {new Date(clip.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
