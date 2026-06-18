import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/store/auth-context";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AttendX — Smart QR-Based Attendance Management for Colleges",
  description:
    "Revolutionize college attendance with secure QR codes, real-time monitoring, comprehensive analytics, and role-based dashboards for admins, faculty, and students.",
  keywords: ["attendance", "QR code", "college", "university", "management", "education"],
  authors: [{ name: "AttendX" }],
  openGraph: {
    title: "AttendX — Smart QR-Based Attendance Management",
    description: "Secure QR-based attendance system built for modern educational institutions.",
    type: "website",
    siteName: "AttendX",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
