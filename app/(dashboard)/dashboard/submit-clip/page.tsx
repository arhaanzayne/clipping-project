"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

type VerifiedAccount = {
  id: string;
  user_id: string;
  platform: string;
  username: string;
  is_verified: boolean;
};

type Campaign = {
  id: string;
  name: string;
};

export default function SubmitClipPage() {
  const [url, setUrl] = useState("");
  const [platform, setPlatform] = useState("");
  const [accounts, setAccounts] = useState<VerifiedAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [accountsLoading, setAccountsLoading] = useState(true);

  // -----------------------------
  // FETCH VERIFIED ACCOUNTS
  // -----------------------------
  useEffect(() => {
    const fetchAccounts = async () => {
      setAccountsLoading(true);

      const { data, error } = await supabase
        .from("user_verifications")
        .select("*")
        .eq("is_verified", true);

      if (!error && data) {
        setAccounts(data as VerifiedAccount[]);
      } else {
        console.error("FETCH ACCOUNTS ERROR:", error);
        setAccounts([]);
      }

      setAccountsLoading(false);
    };

    fetchAccounts();
  }, []);

  // -----------------------------
  // FETCH CAMPAIGNS
  // -----------------------------
  useEffect(() => {
    const fetchCampaigns = async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("id, name");

      if (!error && data) {
        setCampaigns(data as Campaign[]);
      } else {
        console.error("FETCH CAMPAIGNS ERROR:", error);
      }
    };

    fetchCampaigns();
  }, []);

  // -----------------------------
  // AUTO-DETECT PLATFORM
  // -----------------------------
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

  // -----------------------------
  // SUBMIT CLIP
  // -----------------------------
  const submitClip = async () => {
    setLoading(true);
    setMessage("");

    const account = accounts.find((a) => a.id === selectedAccount);

    if (!account) {
      setLoading(false);
      setMessage("❌ Please select a verified account.");
      return;
    }

    // fetch user email from users table
    let userEmail = "";
    const { data: userRow } = await supabase
      .from("users")
      .select("email")
      .eq("id", account.user_id)
      .single();

    if (userRow) {
      userEmail = userRow.email;
    }

    // find selected campaign
    const campaign = campaigns.find((c) => c.id === selectedCampaign);

    try {
      const res = await fetch("/api/submit-clip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clip_url: url,
          verified_account_id: selectedAccount,
          campaign_id: selectedCampaign,
          campaign_name: campaign?.name || "",
          user_id: account.user_id,
          user_email: userEmail,
          platform,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setMessage("❌ " + (result.error || "Something went wrong"));
      } else {
        setMessage("✅ Clip submitted successfully!");
        setUrl("");
        setSelectedAccount("");
        setSelectedCampaign("");
      }
    } catch (err) {
      console.error("SUBMIT CLIP ERROR:", err);
      setMessage("❌ Unexpected error while submitting clip.");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Submit a Clip</h1>

      {/* URL */}
      <div className="mb-4">
        <label className="block mb-2">Clip URL</label>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste your clip URL…"
          className="w-full p-3 rounded bg-gray-800 border border-gray-700"
        />
      </div>

      {platform && (
        <p className="mb-4 text-green-400">
          Detected platform: {platform}
        </p>
      )}

      {/* CAMPAIGN */}
      <div className="mb-4">
        <label className="block mb-2">Select Campaign</label>
        <select
          value={selectedCampaign}
          onChange={(e) => setSelectedCampaign(e.target.value)}
          className="w-full p-3 rounded bg-gray-800 border border-gray-700"
        >
          <option value="">-- Choose Campaign --</option>
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* VERIFIED ACCOUNT */}
      <div className="mb-4">
        <label className="block mb-2">Select Verified Account</label>

        {accountsLoading ? (
          <p>Loading your verified accounts…</p>
        ) : accounts.length === 0 ? (
          <p className="text-sm text-gray-400">
            No verified accounts found. Please verify at least one account first.
          </p>
        ) : (
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
        )}
      </div>

      {/* SUBMIT BTN */}
      <button
        onClick={submitClip}
        disabled={
          !url ||
          !selectedAccount ||
          !selectedCampaign ||
          !platform ||
          loading
        }
        className="px-4 py-2 bg-blue-600 rounded disabled:opacity-50"
      >
        {loading ? "Submitting…" : "Submit Clip"}
      </button>

      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}
