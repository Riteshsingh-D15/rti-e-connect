import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";

export const metadata = {
  title: "RTI E CONNECT – Transparency Through Technology",
  description:
    "AI-Powered Indian RTI Management Portal for Citizens, Public Information Officers, and Administrators",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full" data-scroll-behavior="smooth">
      <body className="min-h-full bg-[#F4F7FB] font-sans text-[#102A43] antialiased selection:bg-blue-100 selection:text-[#102A43]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
