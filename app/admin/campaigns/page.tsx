"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// TYPES
type Campaign = {
  id: string;
  name: string;
  description: string;
  rpm_youtube: number;
  rpm_tiktok: number;
  rpm_instagram: number;
  rpm_x: number;
  sop_text: string;
  sop_url: string;
  enabled_platforms: {
    youtube: boolean;
    tiktok: boolean;
    instagram: boolean;
    x: boolean;
  };
  created_at: string;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showModal, setShowModal] = useState(false);

  // EDIT / CREATE STATES
  const [editId, setEditId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rpmYt, setRpmYt] = useState("");
  const [rpmTt, setRpmTt] = useState("");
  const [rpmIg, setRpmIg] = useState("");
  const [rpmX, setRpmX] = useState("");
  const [sopText, setSopText] = useState("");
  const [sopUrl, setSopUrl] = useState("");

  const [platforms, setPlatforms] = useState({
    youtube: false,
    tiktok: false,
    instagram: false,
    x: false,
  });

  // LOAD LIST
  async function loadCampaigns() {
    const { data } = await supabase
      .from("campaigns")
      .select("*")
      .order("created_at", { ascending: false });

    setCampaigns(data || []);
  }

  useEffect(() => {
    loadCampaigns();
  }, []);

  // RESET FORM FOR CREATE
  function resetForm() {
    setEditId(null);
    setName("");
    setDescription("");
    setRpmYt("");
    setRpmTt("");
    setRpmIg("");
    setRpmX("");
    setSopText("");
    setSopUrl("");
    setPlatforms({
      youtube: false,
      tiktok: false,
      instagram: false,
      x: false,
    });
  }

  // OPEN EDIT MODAL
  function startEdit(c: Campaign) {
    setEditId(c.id);
    setName(c.name);
    setDescription(c.description);
    setRpmYt(String(c.rpm_youtube));
    setRpmTt(String(c.rpm_tiktok));
    setRpmIg(String(c.rpm_instagram));
    setRpmX(String(c.rpm_x));
    setSopText(c.sop_text);
    setSopUrl(c.sop_url);
    setPlatforms({
      youtube: c.enabled_platforms?.youtube ?? false,
      tiktok: c.enabled_platforms?.tiktok ?? false,
      instagram: c.enabled_platforms?.instagram ?? false,
      x: c.enabled_platforms?.x ?? false,
    });
    setShowModal(true);
  }

  // CREATE NEW CAMPAIGN
  async function handleCreate() {
    const res = await fetch(`/admin/campaigns/api/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        rpm_youtube: Number(rpmYt),
        rpm_tiktok: Number(rpmTt),
        rpm_instagram: Number(rpmIg),
        rpm_x: Number(rpmX),
        sop_text: sopText,
        sop_url: sopUrl,
        enabled_platforms: platforms,
      }),
    });

    const json = await res.json();
    console.log("CREATE RESPONSE:", json);

    setShowModal(false);
    await loadCampaigns();
  }

  // UPDATE
  async function handleUpdate() {
    if (!editId) return;

    const res = await fetch(`/admin/campaigns/api`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editId,
        name,
        description,
        rpm_youtube: Number(rpmYt),
        rpm_tiktok: Number(rpmTt),
        rpm_instagram: Number(rpmIg),
        rpm_x: Number(rpmX),
        sop_text: sopText,
        sop_url: sopUrl,
        enabled_platforms: platforms,
      }),
    });

    const json = await res.json();
    console.log("UPDATE RESPONSE:", json);

    setShowModal(false);
    await loadCampaigns();
  }

  // DELETE
  async function handleDelete(id: string) {
    await fetch(`/admin/campaigns/api/${id}`, { method: "DELETE" });
    await loadCampaigns();
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">📢 Campaigns</h1>

      {/* CREATE BUTTON */}
      <div className="flex justify-end mb-4">
        <button
          className="px-4 py-2 bg-blue-600 rounded"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          + New Campaign
        </button>
      </div>

      {/* TABLE */}
      <table className="w-full text-left border border-gray-700 mt-4">
        <thead className="bg-gray-800">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Platforms</th>
            <th className="p-3">RPMs</th>
            <th className="p-3">Created</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((c) => (
            <tr key={c.id} className="border-t border-gray-700">
              <td className="p-3">{c.name}</td>

              <td className="p-3 flex gap-2">
                {c.enabled_platforms?.youtube && (
                  <span className="px-2 py-1 text-xs bg-red-600 rounded">YT</span>
                )}
                {c.enabled_platforms?.tiktok && (
                  <span className="px-2 py-1 text-xs bg-black rounded">TT</span>
                )}
                {c.enabled_platforms?.instagram && (
                  <span className="px-2 py-1 text-xs bg-pink-600 rounded">IG</span>
                )}
                {c.enabled_platforms?.x && (
                  <span className="px-2 py-1 text-xs bg-gray-500 rounded">X</span>
                )}
              </td>

              <td className="p-3 text-sm text-gray-300">
                IG: {c.rpm_instagram} · TT: {c.rpm_tiktok} · YT: {c.rpm_youtube} · X:{" "}
                {c.rpm_x}
              </td>

              <td className="p-3 text-gray-400 text-sm">
                {new Date(c.created_at).toLocaleDateString()}
              </td>

              <td className="p-3">
                <button
                  className="px-2 py-1 bg-yellow-600 rounded text-sm mr-2"
                  onClick={() => startEdit(c)}
                >
                  Edit
                </button>

                <button
                  className="px-2 py-1 bg-red-600 rounded text-sm"
                  onClick={() => handleDelete(c.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* EDIT / CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center">
          <div className="bg-gray-900 p-6 rounded-lg w-[500px]">
            <h2 className="text-xl font-bold mb-4">
              {editId ? "Edit Campaign" : "Create Campaign"}
            </h2>

            <div className="flex flex-col gap-3">
              <input
                value={name}
                className="p-2 bg-gray-800 border border-gray-700 rounded"
                onChange={(e) => setName(e.target.value)}
                placeholder="Campaign name"
              />

              <textarea
                value={description}
                rows={3}
                className="p-2 bg-gray-800 border border-gray-700 rounded"
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  value={rpmYt}
                  onChange={(e) => setRpmYt(e.target.value)}
                  className="p-2 bg-gray-800 border border-gray-700 rounded"
                  placeholder="RPM YT"
                />
                <input
                  value={rpmTt}
                  onChange={(e) => setRpmTt(e.target.value)}
                  className="p-2 bg-gray-800 border border-gray-700 rounded"
                  placeholder="RPM TT"
                />
                <input
                  value={rpmIg}
                  onChange={(e) => setRpmIg(e.target.value)}
                  className="p-2 bg-gray-800 border border-gray-700 rounded"
                  placeholder="RPM IG"
                />
                <input
                  value={rpmX}
                  onChange={(e) => setRpmX(e.target.value)}
                  className="p-2 bg-gray-800 border border-gray-700 rounded"
                  placeholder="RPM X"
                />
              </div>

              <textarea
                value={sopText}
                rows={3}
                className="p-2 bg-gray-800 border border-gray-700 rounded"
                onChange={(e) => setSopText(e.target.value)}
                placeholder="SOP text"
              />

              <input
                value={sopUrl}
                className="p-2 bg-gray-800 border border-gray-700 rounded"
                onChange={(e) => setSopUrl(e.target.value)}
                placeholder="SOP URL"
              />

              {/* PLATFORM CHECKBOXES */}
              <div className="flex gap-6 mt-2">
                <label>
                  <input
                    type="checkbox"
                    checked={platforms.youtube}
                    onChange={(e) =>
                      setPlatforms({ ...platforms, youtube: e.target.checked })
                    }
                  />{" "}
                  YouTube
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={platforms.tiktok}
                    onChange={(e) =>
                      setPlatforms({ ...platforms, tiktok: e.target.checked })
                    }
                  />{" "}
                  TikTok
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={platforms.instagram}
                    onChange={(e) =>
                      setPlatforms({ ...platforms, instagram: e.target.checked })
                    }
                  />{" "}
                  Instagram
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={platforms.x}
                    onChange={(e) =>
                      setPlatforms({ ...platforms, x: e.target.checked })
                    }
                  />{" "}
                  X
                </label>
              </div>

              {/* BUTTONS */}
              <div className="flex justify-end gap-3 mt-4">
                <button
                  className="px-4 py-2 bg-gray-700 rounded"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                {editId ? (
                  <button
                    className="px-4 py-2 bg-green-600 rounded"
                    onClick={handleUpdate}
                  >
                    Update
                  </button>
                ) : (
                  <button
                    className="px-4 py-2 bg-blue-600 rounded"
                    onClick={handleCreate}
                  >
                    Create
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
