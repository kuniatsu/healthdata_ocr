import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Health Diagnosis OCR API",
  description: "API for extracting data from health diagnosis documents using OCR",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
