"use client";

import { useState } from "react";

export default function Page() {
  const [manifestPackages, setManifestPackages] = useState([]);
  const [scannedPackages, setScannedPackages] = useState([]);
  const [barcode, setBarcode] = useState("");
  const [manifestName, setManifestName] = useState("");

  // 🔒 STRICT: METRC PACKAGE IDS ONLY
  const extractMetrcIds = (text) => {
    return [
      ...new Set(
        (text.match(/\b1A[A-Z0-9]{22}\b/g) || [])
      )
    ];
  };

  // Upload manifest (PDF/TXT/CSV converted to text)
  const handleManifestUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setManifestName(file.name);

    const text = await file.text();
    const packages = extractMetrcIds(text);

    setManifestPackages(packages);
    setScannedPackages([]);
  };

  // Add scanned barcode
  const handleAdd = () => {
    const code = barcode.trim();

    // 🔒 Reject non-METRC scans
    if (!/^\b1A[A-Z0-9]{22}\b$/.test(code)) {
      setBarcode("");
      return;
    }

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

      <div style={{ marginTop: 20 }}>
        <strong>Upload Manifest</strong><br />
        <input type="file" accept=".txt,.csv" onChange={handleManifestUpload} />
        {manifestName && <p>Loaded: {manifestName}</p>}
      </div>

      <div style={{ marginTop: 20 }}>
        <strong>Scan METRC Package</strong><br />
        <input
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          autoFocus
          disabled={!manifestPackages.length}
        />
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
