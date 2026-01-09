"use client";

import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";

// REQUIRED FOR NEXT / VERCEL
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

export default function Page() {
  const [manifestPackages, setManifestPackages] = useState([]);
  const [scannedPackages, setScannedPackages] = useState([]);
  const [barcode, setBarcode] = useState("");
  const [manifestName, setManifestName] = useState("");

  // 🔊 sounds
  const successBeep = () => new Audio("/beep-success.mp3").play();
  const errorBeep = () => new Audio("/beep-error.mp3").play();

  // ===============================
  // PDF MANIFEST PARSER (FIXED)
  // ===============================
  const handleManifestUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setManifestName(file.name);

    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      fullText += content.items.map((item) => item.str).join("\n") + "\n";
    }

    // 🔐 CRITICAL FILTER
    const lines = fullText.split("\n");
    const packageIds = [];

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes("Package | Accepted")) {
        const possibleId = lines[i + 1]?.trim();
        if (
          possibleId &&
          possibleId.startsWith("1A") &&
          possibleId.length > 20
        ) {
          packageIds.push(possibleId);
        }
      }
    }

    setManifestPackages([...new Set(packageIds)]);
    setScannedPackages([]);
  };

  // ===============================
  // SCAN HANDLER (AUTO + DUPES)
  // ===============================
  const handleAdd = () => {
    const code = barcode.trim();
    if (!code) return;

    if (!manifestPackages.includes(code)) {
      errorBeep();
      alert("NOT FOUND ON MANIFEST");
      setBarcode("");
      return;
    }

    if (scannedPackages.includes(code)) {
      errorBeep();
      alert("DUPLICATE SCAN");
      setBarcode("");
      return;
    }

    setScannedPackages((prev) => [...prev, code]);
    setBarcode("");
    successBeep();
  };

  const missing = manifestPackages.filter(
    (id) => !scannedPackages.includes(id)
  );

  return (
    <main style={{ maxWidth: 700, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Manifest Barcode Verification</h1>

      <div style={{ marginTop: 20 }}>
        <strong>Upload Manifest (PDF)</strong><br />
        <input type="file" accept="application/pdf" onChange={handleManifestUpload} />
        {manifestName && <p>Loaded: {manifestName}</p>}
      </div>

      <div style={{ marginTop: 20 }}>
        <strong>Scan Barcode</strong><br />
        <input
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          autoFocus
        />
      </div>

      <div style={{ marginTop: 30 }}>
        <p>Expected: {manifestPackages.length}</p>
        <p>Scanned: {scannedPackages.length}</p>
        <p style={{ color: missing.length ? "red" : "green" }}>
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
