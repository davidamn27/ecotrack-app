import "./globals.css";

export const metadata = {
  title: "EcoTrack",
  description: "Nachhaltiges Verhalten vergleichen und sichtbar machen.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
