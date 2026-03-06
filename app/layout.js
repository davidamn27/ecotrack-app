import "./globals.css";
import ConvexClientProvider from "./convex-client-provider";

export const metadata = {
  title: "EcoTrack",
  description: "Nachhaltiges Verhalten vergleichen und sichtbar machen.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
