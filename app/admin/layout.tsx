export const dynamic = "force-dynamic";  // 🔥 REQUIRED FIX

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

const ADMINS = [
  "user_35hhkh9XkRoKcxzkADanXPsQj0t", // YOU
  "user_35i79wan4GYXipzY99M7Uwlgfk3" // NEW ADMIN
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user || !ADMINS.includes(user.id)) {
    redirect("/dashboard");
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0d0f17", color: "white" }}>
      {/* SIDEBAR */}
      <aside
        style={{
          width: "260px",
          padding: "30px 20px",
          background: "#11131b",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <h2 style={{ marginBottom: "20px", fontSize: "22px" }}>🛠 Admin Panel</h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <Link href="/admin" style={{ opacity: 0.85 }}>🏠 Overview</Link>
          <Link href="/admin/pending" style={{ opacity: 0.85 }}>⏳ Pending Clips</Link>
          <Link href="/admin/clips" style={{ opacity: 0.85 }}>🎬 All Clips</Link>
          <Link href="/admin/users" style={{ opacity: 0.85 }}>👥 Users</Link>
          <Link href="/admin/payouts" style={{ opacity: 0.85 }}>🧾 Payouts</Link>
          <Link href="/admin/analytics" style={{ opacity: 0.85 }}>📊 Analytics</Link>
          <Link href="/admin/campaigns" style={{ color: "white", opacity: 0.85 }}>
            📢 Campaigns
          </Link>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, padding: "40px" }}>{children}</main>
    </div>
  );
}
