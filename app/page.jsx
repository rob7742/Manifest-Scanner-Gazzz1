"use client";

import { useState } from "react";

export default function Page() {
  const [manifestPackages, setManifestPackages] = useState([]);
  const [scannedPackages, setScannedPackages] = useState([]);
  const [barcode, setBarcode] = useState("");
  const [manifestName, setManifestName] = useState("");

  // 🔹 Upload + parse manifest (PACKAGE IDS ONLY)
  const handleManifestUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setManifestName(file.name);

    const text = await file.text();

    // ✅ Only package IDs (uppercase alphanumeric, 20–32 chars)
    const packageIdRegex = /\b[A-Z0-9]{20,32}\b/g;

    const matches = text.match(packageIdRegex) || [];
    const uniquePackages = [...new Set(matches)];

    setManifestPackages(uniquePackages);
    setScannedPackages([]);
  };

  // 🔹 Add scanned barcode (auto / manual)
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

  // 🔹 Missing packages
  const missing = manifestPackages.filter(
    (id) => !scannedPackages.includes(id)
  );

  return (
    <main
      style={{
        maxWidth: 600,
        margin: "40px auto",
        fontFamily: "sans-serif",
      }}
    >
      <h1>Manifest Barcode Verification</h1>

      {/* Upload Manifest */}
      <div style={{ marginTop: 20 }}>
        <strong>Upload Manifest</strong>
        <br />
        <input type="file" onChange={handleManifestUpload} />
        {manifestName && <p>Loaded: {manifestName}</p>}
      </div>

      {/* Scan Barcode */}
      <div style={{ marginTop: 20 }}>
        <strong>Scan Barcode</strong>
        <br />
        <input
          type="text"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
          autoFocus
        />
        <br />
        <button
          onClick={handleAdd}
          disabled={!manifestPackages.length}
          style={{ marginTop: 10 }}
        >
          Add
        </button>
      </div>

      {/* Counts */}
      <div involvement={{ marginTop: 30 }}>
        <p>Expected: {manifestPackages.length}</p>
        <p>Scanned: {scannedPackages.length}</p>
        <p
          style={{
            color: missing.length ? "red" : "green",
            fontWeight: "bold",
          }}
        >
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
