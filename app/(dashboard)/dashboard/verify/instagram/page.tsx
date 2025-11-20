"use client";

import { useState } from "react";

export default function InstagramVerify() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");

  async function generateCode() {
    setLoading(true);

    const res = await fetch("/api/verify/instagram/generate", {
      method: "POST",
      body: JSON.stringify({ username }),
    });

    const data = await res.json();

    setCode(data.code);
    setLoading(false);
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Instagram Verification</h2>

      <input
        placeholder="Instagram username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ padding: 10, width: "300px" }}
      />

      <button onClick={generateCode} style={{ marginLeft: 10 }}>
        {loading ? "Generating..." : "Generate Code"}
      </button>

      {code && (
        <div style={{ marginTop: 20 }}>
          <strong>Your verification code:</strong>
          <div>{code}</div>
          <p>Add this code to your Instagram bio.</p>
        </div>
      )}
    </div>
  );
}
