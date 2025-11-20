"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const ADMINS = ["user_35hhkh9XkRoKcxzkADanXPsQj0t"]; // YOUR ADMIN ID

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  // Redirect admin users to /admin immediately
  useEffect(() => {
    if (isLoaded && user && ADMINS.includes(user.id)) {
      router.replace("/admin");
    }
  }, [user, isLoaded, router]);

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
          justifyContent: "space-between",
        }}
      >
        <div>
          <h2 style={{ marginBottom: "30px", fontSize: "22px" }}>
            ⚡ Clipping Panel
          </h2>

          <nav style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <Link href="/dashboard" style={{ color: "white", opacity: 0.85 }}>🏠 Dashboard</Link>
            <Link href="/dashboard/submit-clip" style={{ color: "white", opacity: 0.85 }}>📤 Submit Clip</Link>
            <Link href="/dashboard/my-clips" style={{ color: "white", opacity: 0.85 }}>🎬 My Clips</Link>
            <Link href="/dashboard/earnings" style={{ color: "white", opacity: 0.85 }}>💰 Earnings</Link>
            <Link href="/dashboard/profile" style={{ color: "white", opacity: 0.85 }}>👤 Profile</Link>
          </nav>
        </div>

        <div>
          <UserButton />
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, padding: "40px" }}>
        {children}
      </main>
    </div>
  );
}
