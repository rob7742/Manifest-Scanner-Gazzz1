export const metadata = {
  title: "Manifest Scanner",
  description: "Live barcode to manifest verification",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
