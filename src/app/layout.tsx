import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Book Worm — Your Online Bookstore",
  description: "Browse thousands of books. Personalised recommendations, fast delivery, great prices.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#1a1a2e] text-gray-100">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
