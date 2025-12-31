"use client";

import { useState } from "react";

export default function Page() {
  const [manifestPackages, setManifestPackages] = useState([]);
  const [scannedPackages, setScannedPackages] = useState([]);
  const [barcode, setBarcode] = useState("");
  const [manifestName, setManifestName] = useState("");

const handleAdd = () => {
  const code = barcode.trim();
  if (!code) return;

  if (scannedPackages.includes(code)) {
    alert("Duplicate scan detected");
    setBarcode("");
    return;
  }

  setScannedPackages(prev => [...prev, code]);
  setBarcode("");
};

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
            {missing.map((id) => <li key={id}>{id}</li>)}
          </ul>
        )}
      </div>
    </main>
  );
}
