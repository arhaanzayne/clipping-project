"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Earning = {
  id: string;
  clip_id: string | null;
  platform: string | null;
  amount: number;
  created_at: string;
};

export default function EarningsPage() {
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // -----------------------------
  // FETCH ALL EARNINGS (NO CLERK)
  // -----------------------------
  useEffect(() => {
    let cancelled = false;

    const loadEarnings = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("earnings")
          .select("id, clip_id, platform, amount, created_at")
          .order("created_at", { ascending: false });

        if (cancelled) return;

        if (error) {
          console.error("EARNINGS FETCH ERROR:", error);
          setError(error.message);
          setEarnings([]);
        } else {
          const safeData =
            (data ?? []).map((row: any) => ({
              id: row.id,
              clip_id: row.clip_id ?? null,
              platform: row.platform ?? null,
              amount: Number(row.amount ?? 0),
              created_at: row.created_at,
            })) as Earning[];

          setEarnings(safeData);
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error("EARNINGS FETCH EXCEPTION:", err);
          setError(err?.message ?? "Unexpected error");
          setEarnings([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadEarnings();

    return () => {
      cancelled = true;
    };
  }, []);

  // -----------------------------
  // RENDER STATES
  // -----------------------------
  if (loading) {
    return <div className="p-6 text-white">Loading earnings...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-white">
        <p className="text-red-400 mb-2">Error loading earnings:</p>
        <p className="text-sm text-red-300">{error}</p>
      </div>
    );
  }

  const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);

  const platformEarnings = earnings.reduce(
    (acc: Record<string, number>, e) => {
      const platform = e.platform || "unknown";
      acc[platform] = (acc[platform] || 0) + e.amount;
      return acc;
    },
    {}
  );

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">💰 Earnings</h1>

      {/* TOTAL EARNINGS */}
      <div className="mb-8 p-6 bg-gray-900 rounded-xl border border-gray-700">
        <h2 className="text-xl font-semibold mb-2">Total Earnings (All Users)</h2>
        <p className="text-3xl font-bold text-green-400">
          ${totalEarnings.toFixed(2)}
        </p>
      </div>

      {/* EARNINGS BY PLATFORM */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Earnings by Platform</h2>

        {Object.keys(platformEarnings).length === 0 ? (
          <p className="text-gray-400">No earnings yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(platformEarnings).map(([platform, amount]) => (
              <div
                key={platform}
                className="p-4 bg-gray-900 rounded-lg border border-gray-700"
              >
                <p className="text-sm text-gray-400 capitalize">{platform}</p>
                <p className="text-2xl font-bold text-blue-400">
                  ${amount.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EARNINGS TABLE */}
      <h2 className="text-xl font-semibold mb-4">Earning Records</h2>

      {earnings.length === 0 ? (
        <p className="text-gray-400">
          No earnings yet. Once clips are approved, they will show up here.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-700">
            <thead>
              <tr className="bg-gray-800">
                <th className="border border-gray-700 p-3">Platform</th>
                <th className="border border-gray-700 p-3">Amount</th>
                <th className="border border-gray-700 p-3">Date</th>
              </tr>
            </thead>

            <tbody>
              {earnings.map((e) => (
                <tr key={e.id} className="bg-gray-900">
                  <td className="border border-gray-700 p-3 capitalize">
                    {e.platform || "-"}
                  </td>

                  <td className="border border-gray-700 p-3 text-green-400 font-bold">
                    ${e.amount.toFixed(2)}
                  </td>

                  <td className="border border-gray-700 p-3">
                    {new Date(e.created_at).toLocaleDateString()}
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
