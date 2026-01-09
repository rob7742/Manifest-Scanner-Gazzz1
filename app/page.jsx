"use client";

import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function Page() {
  const [manifestPackages, setManifestPackages] = useState([]);
  const [scannedPackages, setScannedPackages] = useState([]);
  const [barcode, setBarcode] = useState("");
  const [manifestName, setManifestName] = useState("");
  const [debugTextLength, setDebugTextLength] = useState(0);
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

  /* 🔍 METRC ID EXTRACTION */
  const extractMetrcIds = (text) => {
    const regex = /\b1A[A-Z0-9]{20,28}\b/g;
    return [...new Set(text.match(regex) || [])];
  };

  /* 📄 PDF Handler */
  const handlePdfUpload = async (file) => {
    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((i) => i.str).join(" ");
      fullText += "\n" + pageText;
    }

    setDebugTextLength(fullText.length);

    const packages = extractMetrcIds(fullText);
    setDebugFound(packages.length);
    setManifestPackages(packages);
    setScannedPackages([]);

    if (!packages.length) errorBeep();
  };

  /* 📤 Upload Handler */
  const handleManifestUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setManifestName(file.name);

    if (file.type === "application/pdf") {
      await handlePdfUpload(file);
    } else {
      const text = await file.text();
      setDebugTextLength(text.length);
      const packages = extractMetrcIds(text);
      setDebugFound(packages.length);
      setManifestPackages(packages);
      setScannedPackages([]);
    }
  };

  /* 🔫 Scan */
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
    <main style={{ maxWidth: 680, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Manifest Barcode Verification</h1>

      <div style={{ marginTop: 20 }}>
        <strong>Upload Manifest (PDF / TXT / CSV)</strong><br />
        <input
          type="file"
          accept=".pdf,.txt,.csv"
          onChange={handleManifestUpload}
        />
        {manifestName && <p>Loaded: {manifestName}</p>}
        <p style={{ fontSize: 12 }}>
          Extracted text length: <strong>{debugTextLength}</strong><br />
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
