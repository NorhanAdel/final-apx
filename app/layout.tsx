"use client";

import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/auth-context";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "sonner";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-cairo",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    const savedLang = localStorage.getItem("lang") || "en";
    setLang(savedLang);
  }, []);

  const changeLang: React.Dispatch<React.SetStateAction<string>> = (value) => {
    const newLang = typeof value === "function" ? value(lang) : value;

    setLang(newLang);
    localStorage.setItem("lang", newLang);
  };

  return (
    <html lang={lang} dir={lang === "ar" ? "rtl" : "ltr"} suppressHydrationWarning>
      <body className={`${cairo.variable} font-sans antialiased`}>
        <GoogleOAuthProvider
          clientId={
            process.env.GOOGLE_CLIENT_ID ||
            "889740084185-4qk2gek7tdkk7qjreaffo1kd6cg2un53.apps.googleusercontent.com"
          }
        >
          <AuthProvider>
            <ThemeProvider>
              <Toaster
                position="top-center"
                richColors={false}
                toastOptions={{
                  style: {
                    background: "rgba(9, 11, 110, 0.4)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid #021448",
                    borderLeft: "2px solid #facc15",
                    borderRight: "2px solid #facc15",
                    color: "#ffffff",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontFamily: "var(--font-cairo)",
                  },
                  className: "my-custom-toast",
                }}
              />

              <Navbar lang={lang} setLang={changeLang} />

              <main className="min-h-screen">{children}</main>

              <Footer lang={lang} />
            </ThemeProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}