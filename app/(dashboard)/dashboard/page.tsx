"use client";

import { useEffect, useState } from "react";

type VerificationAccount = {
  id: string;
  user_id: string;
  platform: string;
  username: string;
  is_verified: boolean;
};

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<VerificationAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAccounts() {
      try {
        const res = await fetch("/api/accounts/list");
        const json = await res.json();

        if (!res.ok) {
          console.error("DASHBOARD API ERROR:", json);
          setAccounts([]);
          return;
        }

        setAccounts(json.accounts || []);
      } catch (err) {
        console.error("DASHBOARD FETCH ERROR:", err);
        setAccounts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchAccounts();
  }, []);

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;

  const instagram = accounts.filter((a) => a.platform === "instagram");
  const youtube = accounts.filter((a) => a.platform === "youtube");
  const tiktok = accounts.filter((a) => a.platform === "tiktok");
  const x = accounts.filter((a) => a.platform === "x");

  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard</h1>

      <Section
        title="Instagram Accounts"
        accounts={instagram}
        addLink="/dashboard/verify/instagram"
      />
      <Section
        title="YouTube Accounts"
        accounts={youtube}
        addLink="/dashboard/verify/youtube"
      />
      <Section
        title="TikTok Accounts"
        accounts={tiktok}
        addLink="/dashboard/verify/tiktok"
      />
      <Section
        title="X (Twitter) Accounts"
        accounts={x}
        addLink="/dashboard/verify/x"
      />
    </div>
  );
}

function Section({
  title,
  accounts,
  addLink,
}: {
  title: string;
  accounts: VerificationAccount[];
  addLink: string;
}) {
  return (
    <div
      style={{
        margin: "30px 0",
        padding: 20,
        border: "1px solid #333",
        borderRadius: 8,
      }}
    >
      <h2>{title}</h2>

      {accounts.length === 0 ? (
        <p style={{ opacity: 0.7 }}>No verified accounts yet.</p>
      ) : (
        <ul>
          {accounts.map((acc) => (
            <li key={acc.id} style={{ marginTop: 10 }}>
              @{acc.username}
            </li>
          ))}
        </ul>
      )}

      <a href={addLink} style={{ marginTop: 10, display: "inline-block" }}>
        <button>Add New</button>
      </a>
    </div>
  );
}
