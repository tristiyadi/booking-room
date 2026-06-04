import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "RoomBook — Sistem Booking Ruang Meeting",
  description:
    "Sistem manajemen booking ruang meeting untuk perusahaan. Lihat ketersediaan, buat reservasi, dan kelola ruangan dengan mudah.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RoomBook",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={cn("h-full antialiased", inter.variable)} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={true}>
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                if (${process.env.NODE_ENV === "production"}) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js').then(
                      function(registration) {
                        console.log('ServiceWorker registration successful with scope: ', registration.scope);
                      },
                      function(err) {
                        console.log('ServiceWorker registration failed: ', err);
                      }
                    );
                  });
                } else {
                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    for (let registration of registrations) {
                      registration.unregister().then(function(success) {
                        if (success) {
                          console.log('ServiceWorker unregistered in development to prevent HMR reload loops.');
                          window.location.reload();
                        }
                      });
                    }
                  });
                }
              }
            `,
          }}
        />
      </body>
    </html>
  );
}