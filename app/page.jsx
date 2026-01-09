"use client";

import { useState } from "react";

export default function Page() {
  const [manifestPackages, setManifestPackages] = useState([]);
  const [scannedPackages, setScannedPackages] = useState([]);
  const [barcode, setBarcode] = useState("");
  const [manifestName, setManifestName] = useState("");
  const [debugFound, setDebugFound] = useState(0);

  /* 🔊 Beeps */
  const playBeep = (freq, duration = 120) => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      ctx.currentTime + duration / 1000
    );
    setTimeout(() => {
      osc.stop();
      ctx.close();
    }, duration);
  };

  const successBeep = () => playBeep(800);
  const errorBeep = () => playBeep(200, 200);

  /* 🔒 METRC PACKAGE ID VALIDATION */
  const isValidMetrcId = (value) =>
    /^1A[A-Z0-9]{20,28}$/.test(value);

  /* 📄 CSV PARSER – PACKAGE ID COLUMN ONLY */
  const extractPackagesFromCsv = (text) => {
    const lines = text.split(/\r?\n/);
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

    // Find the Package ID column
    const packageIdIndex = headers.findIndex(
      (h) =>
        h === "package id" ||
        h === "packageid" ||
        h.includes("package id")
    );

    if (packageIdIndex === -1) return [];

    const packages = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",");
      const value = cols[packageIdIndex]?.trim();
      if (value && isValidMetrcId(value)) {
        packages.push(value);
      }
    }

    return [...new Set(packages)];
  };

  /* 📤 Upload Handler */
  const handleManifestUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setManifestName(file.name);

    const text = await file.text();
    let packages = [];

    if (file.name.toLowerCase().endsWith(".csv")) {
      packages = extractPackagesFromCsv(text);
    } else {
      // TXT fallback (strict filtering)
      packages = [...new Set(text.match(/\b1A[A-Z0-9]{20,28}\b/g) || [])];
    }

    setManifestPackages(packages);
    setDebugFound(packages.length);
    setScannedPackages([]);

    if (!packages.length) errorBeep();
  };

  /* 🔫 Scan Handler */
  const handleAdd = () => {
    const code = barcode.trim();

    if (!isValidMetrcId(code)) {
      errorBeep();
      setBarcode("");
      return;
    }

    if (scannedPackages.includes(code)) {
      errorBeep();
      setBarcode("");
      return;
    }

    setScannedPackages((prev) => [...prev, code]);
    successBeep();
    setBarcode("");
  };

  const missing = manifestPackages.filter(
    (id) => !scannedPackages.includes(id)
  );

  return (
    <main style={{ maxWidth: 700, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Manifest Barcode Verification</h1>

      <div style={{ marginTop: 20 }}>
        <strong>Upload Manifest (CSV recommended)</strong><br />
        <input
          type="file"
          accept=".csv,.txt"
          onChange={handleManifestUpload}
        />
        {manifestName && <p>Loaded: {manifestName}</p>}
        <p style={{ fontSize: 12 }}>
          Package IDs detected: <strong>{debugFound}</strong>
        </p>
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
      </div>
    </main>
  );
}
