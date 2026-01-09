"use client";

import { useState } from "react";

export default function Page() {
  const [manifestPackages, setManifestPackages] = useState([]);
  const [scannedPackages, setScannedPackages] = useState([]);
  const [barcode, setBarcode] = useState("");
  const [manifestName, setManifestName] = useState("");

  // 🔹 CSV PACKAGE-ID-ONLY EXTRACTOR
  const extractPackagesFromCsv = (text) => {
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return [];

    const headers = lines[0]
      .split(",")
      .map((h) => h.trim().toLowerCase());

    // STRICT match — avoids Source / Parent / Origin IDs
    const packageIdIndex = headers.findIndex(
      (h) => h === "package id" || h === "package_id"
    );

    if (packageIdIndex === -1) return [];

    const packages = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",");
      const value = cols[packageIdIndex]?.trim();

      // METRC Package ID format ONLY
      if (value && /^1A[A-Z0-9]{20,28}$/.test(value)) {
        packages.push(value);
      }
    }

    return [...new Set(packages)];
  };

  // 🔹 FILE UPLOAD HANDLER
  const handleManifestUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setManifestName(file.name);

    const text = await file.text();
    const packages = extractPackagesFromCsv(text);

    setManifestPackages(packages);
    setScannedPackages([]);
  };

  // 🔹 SCAN / ADD HANDLER (NO DUPLICATES)
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
        <strong>Upload Manifest (CSV)</strong>
        <br />
        <input type="file" accept=".csv,text/csv" onChange={handleManifestUpload} />
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
