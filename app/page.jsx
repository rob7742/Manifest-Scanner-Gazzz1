"use client";

import { useState } from "react";

/**
 * 🔹 EDIT THIS LIST to add/remove preloaded manifests
 * Files must exist in: public/manifests/
 */
const PRELOADED_MANIFESTS = [
  { name: "Manifest 001", file: "/manifests/manifest-001.txt" },
  { name: "Manifest 002", file: "/manifests/manifest-002.txt" },
  { name: "Manifest 003", file: "/manifests/manifest-003.txt" }
];

export default function Page() {
  const [manifestPackages, setManifestPackages] = useState([]);
  const [scannedPackages, setScannedPackages] = useState([]);
  const [barcode, setBarcode] = useState("");
  const [manifestName, setManifestName] = useState("");

  /* -------- Manifest Loading -------- */

  const extractPackages = (text) => {
    const matches = text.match(/1A[A-Z0-9]{20,26}/g) || [];
    return [...new Set(matches)];
  };

  const handleManifestUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    setManifestPackages(extractPackages(text));
    setScannedPackages([]);
    setManifestName(file.name);
  };

  const loadPreloadedManifest = async (path, displayName) => {
    const response = await fetch(path);
    const text = await response.text();

    setManifestPackages(extractPackages(text));
    setScannedPackages([]);
    setManifestName(displayName);
  };

  /* -------- Scanning -------- */

  const handleAdd = () => {
    const code = barcode.trim();
    if (!code) return;

    if (scannedPackages.includes(code)) {
      alert("Duplicate scan detected");
      setBarcode("");
      return;
    }

    setScannedPackages((prev) => [...prev, code]);
    setBarcode("");
  };

  const missing = manifestPackages.filter(
    (id) => !scannedPackages.includes(id)
  );

  return (
    <main style={{ maxWidth: 600, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Manifest Barcode Verification</h1>

      {/* Preloaded Manifest Selector */}
      <div style={{ marginTop: 20 }}>
        <strong>Select Preloaded Manifest</strong><br />
        <select
          defaultValue=""
          onChange={(e) => {
            const m = PRELOADED_MANIFESTS.find(
              (x) => x.file === e.target.value
            );
            if (m) loadPreloadedManifest(m.file, m.name);
          }}
        >
          <option value="" disabled>
            -- Select a manifest --
          </option>
          {PRELOADED_MANIFESTS.map((m) => (
            <option key={m.file} value={m.file}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      {/* Upload Manifest */}
      <div style={{ marginTop: 20 }}>
        <strong>Upload Manifest</strong><br />
        <input type="file" onChange={handleManifestUpload} />
        {manifestName && <p>Loaded: {manifestName}</p>}
      </div>

      {/* Scan Barcode */}
      <div style={{ marginTop: 20 }}>
        <strong>Scan Barcode</strong><br />
        <input
          type="text"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
          autoFocus
          disabled={!manifestPackages.length}
        />
        <button onClick={handleAdd} disabled={!manifestPackages.length}>
          Add
        </button>
      </div>

      {/* Status */}
      <div style={{ marginTop: 30 }}>
        <p>Expected: {manifestPackages.length}</p>
        <p>Scanned: {scannedPackages.length}</p>
        <p style={{ color: missing.length ? "red" : "green", fontWeight: "bold" }}>
          Missing: {missing.length}
        </p>

        {missing.length > 0 && (
          <ul>
            {missing.map((id) => (
              <li key={id}>{id}</li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
