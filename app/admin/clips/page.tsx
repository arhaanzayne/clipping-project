"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

type Clip = {
  id: string;
  user_id: string;
  platform: string;
  account_username: string;
  clip_url: string;
  status: string;
  earnings: number;
  created_at: string;
};

export default function AllClipsPage() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [filteredClips, setFilteredClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  const fetchClips = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("clips")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setClips(data as Clip[]);
      setFilteredClips(data as Clip[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchClips();
  }, []);

  // Filtering logic
  useEffect(() => {
    let result = [...clips];

    // Search filter
    if (search.trim() !== "") {
      const term = search.toLowerCase();
      result = result.filter((clip) =>
        clip.clip_url.toLowerCase().includes(term) ||
        clip.platform.toLowerCase().includes(term) ||
        clip.account_username.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((clip) => clip.status === statusFilter);
    }

    // Platform filter
    if (platformFilter !== "all") {
      result = result.filter((clip) => clip.platform === platformFilter);
    }

    // Sorting
    if (sortOrder === "newest") {
      result.sort((a, b) => Number(new Date(b.created_at)) - Number(new Date(a.created_at)));
    } else if (sortOrder === "oldest") {
      result.sort((a, b) => Number(new Date(a.created_at)) - Number(new Date(b.created_at)));
    } else if (sortOrder === "highest") {
      result.sort((a, b) => b.earnings - a.earnings);
    } else if (sortOrder === "lowest") {
      result.sort((a, b) => a.earnings - b.earnings);
    }

    setFilteredClips(result);
  }, [search, statusFilter, platformFilter, sortOrder, clips]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-400";
      case "approved":
        return "text-green-400";
      case "rejected":
        return "text-red-400";
      default:
        return "text-gray-200";
    }
  };

  if (loading) return <p className="text-white p-6">Loading clips...</p>;

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">🎬 All Clips</h1>

      {/* FILTER BAR */}
      <div className="flex flex-wrap gap-4 mb-6">

        {/* SEARCH INPUT */}
        <input
          type="text"
          placeholder="Search clips, usernames, platforms..."
          className="bg-gray-900 border border-gray-600 rounded p-2 w-80"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* STATUS FILTER */}
        <select
          className="bg-gray-900 border border-gray-600 rounded p-2"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        {/* PLATFORM FILTER */}
        <select
          className="bg-gray-900 border border-gray-600 rounded p-2"
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value)}
        >
          <option value="all">All Platforms</option>
          <option value="instagram">Instagram</option>
          <option value="tiktok">TikTok</option>
          <option value="youtube">YouTube</option>
          <option value="x">X (Twitter)</option>
        </select>

        {/* SORT */}
        <select
          className="bg-gray-900 border border-gray-600 rounded p-2"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="highest">Highest Earnings</option>
          <option value="lowest">Lowest Earnings</option>
        </select>
      </div>

      {/* CLIPS TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-700">
          <thead>
            <tr className="bg-gray-800">
              <th className="border border-gray-700 p-3">Date</th>
              <th className="border border-gray-700 p-3">Platform</th>
              <th className="border border-gray-700 p-3">Account</th>
              <th className="border border-gray-700 p-3">Clip</th>
              <th className="border border-gray-700 p-3">Status</th>
              <th className="border border-gray-700 p-3">Earnings</th>
            </tr>
          </thead>

          <tbody>
            {filteredClips.map((clip) => (
              <tr key={clip.id} className="bg-gray-900">
                <td className="border border-gray-700 p-3">
                  {new Date(clip.created_at).toLocaleDateString()}
                </td>
                <td className="border border-gray-700 p-3 capitalize">
                  {clip.platform}
                </td>
                <td className="border border-gray-700 p-3">{clip.account_username}</td>
                <td className="border border-gray-700 p-3">
                  <a
                    href={clip.clip_url}
                    className="text-blue-400 underline"
                    target="_blank"
                  >
                    Open Clip
                  </a>
                </td>
                <td className={`border border-gray-700 p-3 font-bold ${getStatusColor(clip.status)}`}>
                  {clip.status}
                </td>
                <td className="border border-gray-700 p-3">${clip.earnings.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
