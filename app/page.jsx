"use client";

import { useState } from "react";

export default function Page() {
  const [manifestPackages, setManifestPackages] = useState([]);
  const [scannedPackages, setScannedPackages] = useState([]);
  const [barcode, setBarcode] = useState("");
  const [manifestName, setManifestName] = useState("");

  // 🔒 STRICT PACKAGE ID FILTER
  const extractPackageIds = (text) => {
    return [
      ...new Set(
        (text.match(/\b1A4[A-Z0-9]{21}\b/g) || [])
      )
    ];
  };

  // Upload + parse manifest
  const handleManifestUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setManifestName(file.name);

    const text = await file.text();

    const packages = extractPackageIds(text);

    setManifestPackages(packages);
    setScannedPackages([]);
  };

  // Add scanned barcode
  const handleAdd = () => {
    const code = barcode.trim();

    // 🔒 Ignore non-package scans
    if (!/^\b1A4[A-Z0-9]{21}\b$/.test(code)) {
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
        <strong>Upload Manifest</strong>
        <br />
        <input type="file" onChange={handleManifestUpload} />
        {manifestName && <p>Loaded: {manifestName}</p>}
      </div>

      <div style={{ marginTop: 20 }}>
        <strong>Scan Package Barcode</strong>
        <br />
        <input
          type="text"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          autoFocus
          disabled={!manifestPackages.length}
        />
        <br />
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
