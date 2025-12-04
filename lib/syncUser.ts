export async function syncUser() {
  try {
    const res = await fetch("/api/sync-user", {
      method: "POST",
    });

    if (!res.ok) {
      console.warn("Sync user skipped (no session yet).");
      return;
    }
  } catch (err) {
    console.error("Sync error:", err);
  }
}
