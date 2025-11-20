"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabaseClient";

// Type for verified accounts
type VerifiedAccount = {
  id: string;
  user_id: string;
  platform: string;
  username: string;
  verification_code?: string | null;
  is_verified: boolean;
  verified_at?: string | null;
};

export default function SubmitClipPage() {
  const { user } = useUser();

  const [url, setUrl] = useState("");
  const [platform, setPlatform] = useState("");
  const [accounts, setAccounts] = useState<VerifiedAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch verified accounts
  useEffect(() => {
    if (!user) return;

    const fetchAccounts = async () => {
      const { data, error } = await supabase
        .from("user_verifications")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_verified", true);

      if (!error && data) {
        setAccounts(data as VerifiedAccount[]);
      }
    };

    fetchAccounts();
  }, [user]);

  // Auto-detect platform from URL
  useEffect(() => {
    const lower = url.toLowerCase();

    if (lower.includes("instagram")) setPlatform("instagram");
    else if (lower.includes("tiktok")) setPlatform("tiktok");
    else if (lower.includes("youtube") || lower.includes("youtu.be"))
      setPlatform("youtube");
    else if (lower.includes("twitter") || lower.includes("x.com"))
      setPlatform("x");
    else setPlatform("");
  }, [url]);

  // Submit clip function
  const submitClip = async () => {
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/submit-clip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clip_url: url,
        verified_account_id: selectedAccount,
        platform,
      }),
    });

    const result = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage("❌ " + (result.error || "Something went wrong"));
    } else {
      setMessage("✅ Clip submitted successfully!");
      setUrl("");
      setSelectedAccount("");
    }
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Submit a Clip</h1>

      {/* URL Input */}
      <div className="mb-4">
        <label className="block mb-2">Clip URL</label>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste your clip URL…"
          className="w-full p-3 rounded bg-gray-800 border border-gray-700"
        />
      </div>

      {/* Platform Indicator */}
      {platform && (
        <p className="mb-4 text-green-400">Detected platform: {platform}</p>
      )}

      {/* Verified Accounts Dropdown */}
      <div className="mb-4">
        <label className="block mb-2">Select Verified Account</label>
        <select
          value={selectedAccount}
          onChange={(e) => setSelectedAccount(e.target.value)}
          className="w-full p-3 rounded bg-gray-800 border border-gray-700"
        >
          <option value="">-- Choose Account --</option>

          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.username} ({acc.platform})
            </option>
          ))}
        </select>
      </div>

      {/* Submit Button */}
      <button
        onClick={submitClip}
        disabled={!url || !selectedAccount || !platform || loading}
        className="px-4 py-2 bg-blue-600 rounded disabled:opacity-50"
      >
        {loading ? "Submitting…" : "Submit Clip"}
      </button>

      {/* Message */}
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}
