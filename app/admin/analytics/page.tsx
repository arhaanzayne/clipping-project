"use client";

import { useEffect, useState } from "react";

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/admin/analytics");
      setData(await res.json());
    }
    load();
  }, []);

  if (!data) return <div className="p-6 text-white">Loading analytics...</div>;

  const {
    totals,
    earningsPerUser,
    earningsPerPlatform,
    earningsUserPlatform,
    campaignStats,
    leaderboard,
  } = data;

  return (
    <div className="p-6 text-white space-y-10 min-h-screen bg-[#0d0f17]">
      <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>

      {/* GLOBAL CARDS */}
      <div className="grid grid-cols-4 gap-4">
        <Card title="Total Users" value={totals.totalUsers} />
        <Card title="Total Clips" value={totals.totalClips} />
        <Card title="Approved Clips" value={totals.totalApprovedClips} />
        <Card title="Total Earnings" value={`$${totals.totalEarnings}`} />
      </div>

      {/* EARNINGS SECTION */}
      <SectionTitle title="Earnings Per User" />
      <SimpleTable data={earningsPerUser} headers={["User ID", "Earnings"]} />

      <SectionTitle title="Earnings Per Platform" />
      <SimpleTable data={earningsPerPlatform} headers={["Platform", "Earnings"]} />

      <SectionTitle title="Earnings Per User Per Platform" />
      <UserPlatformTable data={earningsUserPlatform} />

      {/* CAMPAIGNS */}
      <SectionTitle title="Campaign Analytics" />
      <CampaignTable data={campaignStats} />

      {/* LEADERBOARD */}
      <SectionTitle title="Top Earners" />
      <Leaderboard data={leaderboard} />
    </div>
  );
}

/* --- COMPONENTS (Typed) --- */

type CardProps = {
  title: string;
  value: string | number;
};

function Card({ title, value }: CardProps) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <div className="text-gray-400">{title}</div>
      <div className="text-2xl font-bold mt-2">{value}</div>
    </div>
  );
}

type SectionTitleProps = { title: string };

function SectionTitle({ title }: SectionTitleProps) {
  return <h2 className="text-2xl font-semibold mt-10 mb-3">{title}</h2>;
}

type SimpleTableProps = {
  data: Record<string, number>;
  headers: string[];
};

function SimpleTable({ data, headers }: SimpleTableProps) {
  return (
    <table className="w-full border border-gray-700">
      <thead className="bg-gray-900">
        <tr>
          {headers.map((h, i) => (
            <th key={i} className="p-3 border border-gray-700 text-left">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Object.entries(data).map(([key, val], i) => (
          <tr key={i} className="bg-gray-800 border-b border-gray-700">
            <td className="p-3">{key}</td>
            <td className="p-3">${val}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

type UserPlatformTableProps = {
  data: Record<string, Record<string, number>>;
};

function UserPlatformTable({ data }: UserPlatformTableProps) {
  return (
    <table className="w-full border border-gray-700">
      <thead className="bg-gray-900">
        <tr>
          <th className="p-3 border border-gray-700">User ID</th>
          <th className="p-3 border border-gray-700">Platform</th>
          <th className="p-3 border border-gray-700">Earnings</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(data).map(([user_id, platforms], i) =>
          Object.entries(platforms).map(([platform, amount], j) => (
            <tr key={`${i}-${j}`} className="bg-gray-800 border-b border-gray-700">
              <td className="p-3">{user_id}</td>
              <td className="p-3">{platform}</td>
              <td className="p-3">${amount}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

type Campaign = {
  name: string;
  total_clips: number;
  approved_clips: number;
  total_earnings: number;
};

type CampaignTableProps = { data: Campaign[] };

function CampaignTable({ data }: CampaignTableProps) {
  return (
    <table className="w-full border border-gray-700">
      <thead className="bg-gray-900">
        <tr>
          <th className="p-3">Campaign</th>
          <th className="p-3">Total Clips</th>
          <th className="p-3">Approved Clips</th>
          <th className="p-3">Total Earnings</th>
        </tr>
      </thead>
      <tbody>
        {data.map((c, i) => (
          <tr key={i} className="bg-gray-800 border-b border-gray-700">
            <td className="p-3">{c.name}</td>
            <td className="p-3">{c.total_clips}</td>
            <td className="p-3">{c.approved_clips}</td>
            <td className="p-3">${c.total_earnings}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

type LeaderboardProps = {
  data: { user_id: string; total: number }[];
};

function Leaderboard({ data }: LeaderboardProps) {
  return (
    <ol className="list-decimal ml-6">
      {data.map((x, i) => (
        <li key={i} className="text-lg mb-1">
          <span className="text-gray-300">{x.user_id}</span> —{" "}
          <span className="font-bold">${x.total}</span>
        </li>
      ))}
    </ol>
  );
}
