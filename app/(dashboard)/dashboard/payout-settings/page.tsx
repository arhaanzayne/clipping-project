"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { supabase } from "@/lib/supabaseClient";

type PayoutForm = {
  paypal_email: string;
  legal_name: string;
  bank_name: string;
  account_number: string;
  ifsc_swift: string;
  country: string;
  address: string;
  phone: string;
};

export default function PayoutSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<PayoutForm>({
    paypal_email: "",
    legal_name: "",
    bank_name: "",
    account_number: "",
    ifsc_swift: "",
    country: "",
    address: "",
    phone: "",
  });

  const [userId, setUserId] = useState<string | null>(null);

  // -----------------------
  // GET LOGGED IN USER (Supabase)
  // -----------------------
  useEffect(() => {
    async function loadUser() {
      // Try auth first
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
        return;
      }

      // Fallback: get user from database (like SubmitClipPage logic)
      const { data: users } = await supabase.from("users").select("id").limit(1);

      if (users && users.length > 0) {
        setUserId(users[0].id);
      }
    }

    loadUser();
  }, []);

  // -----------------------
  // LOAD PAYOUT SETTINGS
  // -----------------------
  useEffect(() => {
    if (!userId) return;

    async function load() {
      const res = await fetch(`/api/payout/settings?user_id=${userId}`);

      if (!res.ok) {
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (data) {
        setForm((prev) => ({ ...prev, ...data }));
      }

      setLoading(false);
    }

    load();
  }, [userId]);

  // -----------------------
  // HANDLE INPUT
  // -----------------------
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // -----------------------
  // SAVE PAYOUT SETTINGS
  // -----------------------
  async function handleSave() {
    if (!userId) {
      alert("No user found");
      return;
    }

    const res = await fetch("/api/payout/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        user_id: userId,
      }),
    });

    if (res.ok) {
      alert("Payout settings saved!");
    } else {
      alert("Failed to save.");
    }
  }

  if (loading) return <div className="text-white">Loading…</div>;

  // -----------------------
  // UI
  // -----------------------
  return (
    <div className="text-white max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Payout Settings</h1>

      <h2 className="text-xl font-semibold mt-8 mb-2">PayPal</h2>
      <input
        type="email"
        name="paypal_email"
        placeholder="PayPal Email"
        value={form.paypal_email}
        onChange={handleChange}
        className="w-full p-3 mb-4 bg-gray-800 rounded"
      />

      <h2 className="text-xl font-semibold mt-8 mb-2">Bank Transfer Details</h2>

      <input
        name="legal_name"
        placeholder="Legal Full Name"
        value={form.legal_name}
        onChange={handleChange}
        className="w-full p-3 mb-3 bg-gray-800 rounded"
      />

      <input
        name="bank_name"
        placeholder="Bank Name"
        value={form.bank_name}
        onChange={handleChange}
        className="w-full p-3 mb-3 bg-gray-800 rounded"
      />

      <input
        name="account_number"
        placeholder="Account Number"
        value={form.account_number}
        onChange={handleChange}
        className="w-full p-3 mb-3 bg-gray-800 rounded"
      />

      <input
        name="ifsc_swift"
        placeholder="IFSC or SWIFT Code"
        value={form.ifsc_swift}
        onChange={handleChange}
        className="w-full p-3 mb-3 bg-gray-800 rounded"
      />

      <input
        name="country"
        placeholder="Country"
        value={form.country}
        onChange={handleChange}
        className="w-full p-3 mb-3 bg-gray-800 rounded"
      />

      <input
        name="address"
        placeholder="Full Address"
        value={form.address}
        onChange={handleChange}
        className="w-full p-3 mb-3 bg-gray-800 rounded"
      />

      <input
        name="phone"
        placeholder="Phone Number"
        value={form.phone}
        onChange={handleChange}
        className="w-full p-3 mb-3 bg-gray-800 rounded"
      />

      <button
        onClick={handleSave}
        className="mt-6 bg-blue-600 px-6 py-3 rounded hover:bg-blue-700"
      >
        Save Settings
      </button>
    </div>
  );
}
