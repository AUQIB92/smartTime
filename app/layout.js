import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/lib/ToastContext";
import Toast from "@/components/Toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SmartTime - Intelligent Timetable Management",
  description: "A comprehensive timetable management system for educational institutions",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastProvider>
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
          <Toast />
        </ToastProvider>
      </body>
    </html>
  );
}
