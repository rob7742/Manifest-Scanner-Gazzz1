"use client";

import { useState } from "react";

export default function Page() {
  const [manifestPackages, setManifestPackages] = useState([]);
  const [scannedPackages, setScannedPackages] = useState([]);
  const [scanInput, setScanInput] = useState("");
  const [manifestName, setManifestName] = useState("");

  const handleManifestUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setManifestName(file.name);
    const text = await file.text();

    const matches = text.match(/1A[A-Z0-9]{20,26}/g) || [];
    setManifestPackages([...new Set(matches)]);
    setScannedPackages([]);
  };

  const scanBarcode = () => {
    if (!scanInput) return;
    setScannedPackages((prev) => [...prev, scanInput.trim()]);
    setScanInput("");
  };

  const missing = manifestPackages.filter(
    (id) => !scannedPackages.includes(id)
  );

  return (
    <main style={{ maxWidth: 600, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Manifest Barcode Verification</h1>

      <div style={{ marginTop: 20 }}>
        <strong>Upload Manifest</strong><br />
        <input type="file" onChange={handleManifestUpload} />
        {manifestName && <p>Loaded: {manifestName}</p>}
      </div>

      <div style={{ marginTop: 20 }}>
        <strong>Scan Barcode</strong><br />
       <input
  type="text"
  value={barcode}
  onChange={(e) => setBarcode(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      handleAdd();
    }
  }}
  autoFocus
/>

        <button onClick={scanBarcode} disabled={!manifestPackages.length}>
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
            {missing.map((id) => <li key={id}>{id}</li>)}
          </ul>
        )}
      </div>
    </main>
  );
}
