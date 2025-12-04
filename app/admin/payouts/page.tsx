"use client";

import { useEffect, useState } from "react";

type Payout = {
  id: string;
  user_id: string;
  paypal_email: string | null;
  legal_name: string | null;
  bank_name: string | null;
  account_number: string | null;
  ifsc_swift: string | null;
  country: string | null;
  address: string | null;
  phone: string | null;
  status: string | null;
};

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPayouts = async () => {
    try {
      const res = await fetch("/api/admin/payouts");
      const json = await res.json();

      const list =
        Array.isArray(json)
          ? json
          : Array.isArray(json?.payouts)
          ? json.payouts
          : [];

      setPayouts(list);
    } catch (err) {
      console.error("PAYOUTS FETCH ERROR:", err);
      setPayouts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayouts();
  }, []);

  const updatePayout = async (payout: Payout, status: "approved" | "rejected") => {
    const res = await fetch("/api/admin/payouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payout, status }),
    });

    const json = await res.json();
    if (!res.ok) {
      console.error("UPDATE PAYOUT ERROR:", json);
      return;
    }

    loadPayouts();
  };

  const approvePayout = (payout: Payout) => updatePayout(payout, "approved");
  const rejectPayout = (payout: Payout) => updatePayout(payout, "rejected");

  if (loading) {
    return <p className="text-white p-6">Loading payouts...</p>;
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">User Payouts</h1>

      <table className="w-full border-collapse border border-gray-700">
        <thead>
          <tr className="bg-gray-800">
            <th className="border border-gray-700 p-3">User ID</th>
            <th className="border border-gray-700 p-3">PayPal Email</th>
            <th className="border border-gray-700 p-3">Legal Name</th>
            <th className="border border-gray-700 p-3">Bank</th>
            <th className="border border-gray-700 p-3">Account No.</th>
            <th className="border border-gray-700 p-3">IFSC/SWIFT</th>
            <th className="border border-gray-700 p-3">Status</th>
            <th className="border border-gray-700 p-3">Actions</th>
          </tr>
        </thead>

        <tbody>
          {payouts.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center p-4 text-gray-400">
                No payout entries found.
              </td>
            </tr>
          ) : (
            payouts.map((u, i) => (
              <tr key={i} className="bg-gray-900">
                <td className="p-3 border border-gray-700">{u.user_id}</td>
                <td className="p-3 border border-gray-700">{u.paypal_email ?? "-"}</td>
                <td className="p-3 border border-gray-700">{u.legal_name ?? "-"}</td>
                <td className="p-3 border border-gray-700">{u.bank_name ?? "-"}</td>
                <td className="p-3 border border-gray-700">{u.account_number ?? "-"}</td>
                <td className="p-3 border border-gray-700">{u.ifsc_swift ?? "-"}</td>
                <td className="p-3 border border-gray-700 capitalize">
                  {u.status ?? "pending"}
                </td>

                <td className="border border-gray-700 p-3 text-center flex gap-2 justify-center">
                  <button
                    onClick={() => approvePayout(u)}
                    className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => rejectPayout(u)}
                    className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
