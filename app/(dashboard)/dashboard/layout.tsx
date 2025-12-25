"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { syncUser } from "@/lib/syncUser";

const ADMINS = [
  "user_35hhkh9XkRoKcxzkADanXPsQj0t", // YOU
  "user_35i79wan4GYXipzY99M7Uwlgfk3" // NEW ADMIN
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return; // wait for Clerk

    // 🛑 No session at all → go sign in
    if (!isSignedIn || !user?.id) {
      router.push("/sign-in");
      return;
    }

    // ✅ Definitely logged in now
    syncUser();

    // ✅ Admin redirect
    if (ADMINS.includes(user.id)) {
      router.push("/admin");
    }
  }, [isLoaded, isSignedIn, user?.id, router]);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#0d0f17",
        color: "white",
      }}
    >
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
          height: "100%",
        }}
      >
        <div>
          <h2 style={{ marginBottom: "30px", fontSize: "22px" }}>
            ⚡ Clipping Panel
          </h2>

          <nav
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            <Link href="/dashboard" style={{ color: "white", opacity: 0.85 }}>
              🏠 Dashboard
            </Link>
            <Link
              href="/dashboard/submit-clip"
              style={{ color: "white", opacity: 0.85 }}
            >
              📤 Submit Clip
            </Link>
            <Link
              href="/dashboard/my-clips"
              style={{ color: "white", opacity: 0.85 }}
            >
              🎬 My Clips
            </Link>
            <Link
              href="/dashboard/earnings"
              style={{ color: "white", opacity: 0.85 }}
            >
              💰 Earnings
            </Link>
            <Link
              href="/dashboard/payout-settings"
              style={{ color: "white", opacity: 0.85 }}
            >
              🏦 Payout Settings
            </Link>
            
          </nav>
        </div>

        <div>
          <UserButton />
        </div>
      </aside>

      <main
        style={{
          flex: 1,
          padding: "40px",
          background: "#0d0f17",
        }}
      >
        {children}
      </main>
    </div>
  );
}
