"use client";

export default function Home() {
  return (
    <main
      style={{
        height: "100vh",
        padding: "0 40px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(180deg, #0d0f17 0%, #121622 100%)",
        color: "white",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "42px", marginBottom: "20px" }}>
        Your Clips. Your Earnings.
      </h1>

      <p style={{ maxWidth: "600px", fontSize: "18px", opacity: 0.8 }}>
        A content clipping platform built for creators and editors.
        Submit clips. Get approved. Get paid.
        Powered by Discord and Google authentication.
      </p>

      <div style={{ marginTop: "40px" }}>
        <button
          style={{
            padding: "14px 32px",
            backgroundColor: "#6366f1",
            fontSize: "18px",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
          onClick={() =>
            // 🔥 FIX: No more localhost
            // Clerk will automatically use the correct domain (dev or production)
            (window.location.href =
              "/sign-in?redirect_url=/dashboard")
          }
        >
          Get Started
        </button>
      </div>
    </main>
  );
}
