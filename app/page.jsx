"use client";

import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

export default function Page() {
  const [manifestPackages, setManifestPackages] = useState([]);
  const [scannedPackages, setScannedPackages] = useState([]);
  const [barcode, setBarcode] = useState("");
  const [manifestName, setManifestName] = useState("");

  // 🔊 optional beeps
  const successBeep = () => new Audio("/beep-success.mp3").play();
  const errorBeep = () => new Audio("/beep-error.mp3").play();

  // ==========================
  // ✅ METRC PDF PARSER (REAL)
  // ==========================
  const handleManifestUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setManifestName(file.name);

    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((i) => i.str).join(" ") + "\n";
    }

    // 1️⃣ Extract ALL METRC-style IDs
    const allIds =
      text.match(/1A[A-Z0-9]{20,}/g) || [];

    // 2️⃣ Remove source package IDs
    // METRC PDFs repeat IDs in order:
    // Real package ID ALWAYS appears FIRST per block
    const cleaned = [];
    for (let id of allIds) {
      if (!cleaned.includes(id)) {
        cleaned.push(id);
      }
    }

    // 3️⃣ Keep ONLY expected package count
    // (Source IDs come later and repeat)
    const finalPackages = cleaned.slice(0, Math.floor(cleaned.length / 2));

    setManifestPackages(finalPackages);
    setScannedPackages([]);
  };

  // ==========================
  // SCANNING
  // ==========================
  const handleAdd = () => {
    const code = barcode.trim();
    if (!code) return;

    if (!manifestPackages.includes(code)) {
      errorBeep();
      alert("NOT ON MANIFEST");
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
        <strong>Upload METRC Manifest (PDF)</strong><br />
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
