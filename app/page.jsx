"use client";

import { useState } from "react";

export default function Page() {
  const [manifestPackages, setManifestPackages] = useState([]);
  const [scannedPackages, setScannedPackages] = useState([]);
  const [barcode, setBarcode] = useState("");
  const [manifestName, setManifestName] = useState("");

  /* 🔊 Beep Functions */
  const playBeep = (frequency, duration = 120) => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    oscillator.connect(gain);
    gain.connect(audioCtx.destination);

    oscillator.start();
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      audioCtx.currentTime + duration / 1000
    );

    setTimeout(() => {
      oscillator.stop();
      audioCtx.close();
    }, duration);
  };

  const successBeep = () => playBeep(800);
  const errorBeep = () => playBeep(200, 200);

  /* 🔒 METRC PACKAGE ID FILTER */
  const extractMetrcIds = (text) => {
    return [
      ...new Set(
        (text.match(/\b1A[A-Z0-9]{22}\b/g) || [])
      )
    ];
  };

  /* 📤 Upload Manifest */
  const handleManifestUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setManifestName(file.name);
    const text = await file.text();

    const packages = extractMetrcIds(text);
    setManifestPackages(packages);
    setScannedPackages([]);
  };

  /* 🔫 Scan Barcode */
  const handleAdd = () => {
    const code = barcode.trim();

    // ❌ Invalid code
    if (!/^\b1A[A-Z0-9]{22}\b$/.test(code)) {
      errorBeep();
      setBarcode("");
      return;
    }

    // ❌ Duplicate scan
    if (scannedPackages.includes(code)) {
      errorBeep();
      setBarcode("");
      return;
    }

    // ✅ Valid scan
    setScannedPackages((prev) => [...prev, code]);
    successBeep();
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
