export async function syncUser() {
  try {
    const res = await fetch("/api/sync-user", {
      method: "POST",
    });

    if (!res.ok) {
      console.error("Sync user failed:", await res.text());
    }
  } catch (err) {
    console.error("Sync user error:", err);
  }
}
