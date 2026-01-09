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
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration / 1000);
    setTimeout(() => {
      osc.stop();
      ctx.close();
    }, duration);
  };

  const successBeep = () => playBeep(800);
  const errorBeep = () => playBeep(200, 200);

  /* 🔍 REAL-WORLD METRC PACKAGE EXTRACTION */
  const extractMetrcIds = (text) => {
    /**
     * Matches:
     * - Starts with 1A
     * - Uppercase letters + numbers
     * - Length 22–30 (covers ALL known METRC formats)
     */
    const regex = /\b1A[A-Z0-9]{20,28}\b/g;
    const matches = text.match(regex) || [];
    return [...new Set(matches)];
  };

  /* 📤 Upload Manifest */
  const handleManifestUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setManifestName(file.name);

    const text = await file.text();
    const packages = extractMetrcIds(text);

    setDebugFound(packages.length);
    setManifestPackages(packages);
    setScannedPackages([]);

    if (!packages.length) errorBeep();
  };

  /* 🔫 Scan Handler */
  const handleAdd = () => {
    const code = barcode.trim();

    if (!/^1A[A-Z0-9]{20,28}$/.test(code)) {
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
    <main style={{ maxWidth: 650, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Manifest Barcode Verification</h1>

      <div style={{ marginTop: 20 }}>
        <strong>Upload Manifest (TXT / CSV)</strong><br />
        <input type="file" accept=".txt,.csv" onChange={handleManifestUpload} />
        {manifestName && <p>Loaded: {manifestName}</p>}
        <p style={{ fontSize: 12 }}>
          IDs detected in manifest: <strong>{debugFound}</strong>
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
