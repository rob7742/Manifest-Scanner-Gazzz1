"use client";

import { useState } from "react";

export default function Page() {
  const [manifestPackages, setManifestPackages] = useState([]);
  const [scannedPackages, setScannedPackages] = useState([]);
  const [barcode, setBarcode] = useState("");
  const [manifestName, setManifestName] = useState("");

  // 🔹 GLOBAL METRC PACKAGE ID REGEX
  const METRC_REGEX = /\b1A[A-Z0-9]{20,28}\b/g;

  // 🔹 CSV / TEXT PARSER — PACKAGE IDS ONLY
  const extractPackages = (text) => {
    const matches = text.match(METRC_REGEX) || [];

    // Deduplicate + sort for consistency
    return [...new Set(matches)];
  };

  // 🔹 MANIFEST UPLOAD HANDLER
  const handleManifestUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setManifestName(file.name);

    const text = await file.text();
    const packages = extractPackages(text);

    if (packages.length === 0) {
      alert("❌ No METRC package IDs detected in file");
      return;
    }

    setManifestPackages(packages);
    setScannedPackages([]);
  };

  // 🔹 SCAN HANDLER
  const handleAdd = () => {
    const code = barcode.trim();
    if (!code) return;

    if (!manifestPackages.includes(code)) {
      alert("❌ Package NOT on manifest");
      setBarcode("");
      return;
    }

    if (scannedPackages.includes(code)) {
      alert("⚠️ Duplicate scan detected");
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
    <main style={{ maxWidth: 700, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Manifest Barcode Verification</h1>

      <div style={{ marginTop: 20 }}>
        <strong>Upload Manifest (CSV / TXT)</strong>
        <br />
        <input
          type="file"
          accept=".csv,text/csv,text/plain"
          onChange={handleManifestUpload}
        />
        {manifestName && <p>Loaded: {manifestName}</p>}
      </div>

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
        <button onClick={handleAdd} disabled={!manifestPackages.length}>
          Add
        </button>
      </div>

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
