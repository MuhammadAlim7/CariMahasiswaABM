import type { Metadata } from "next";
import { Space_Grotesk, Figtree } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Sonner } from "@/app/components/Sonner";

const grotesk = Space_Grotesk({
   variable: "--font-grotesk",
   subsets: ["latin"],
});

const figtree = Figtree({
   variable: "--font-figtree",
   subsets: ["latin"],
});

export const metadata: Metadata = {
   title: "Cari Mahasiswa ABM",
   description:
      "Temukan mahasiswa ABM dengan mudah. Aplikasi pencarian online yang cepat, ringan, dan gratis untuk kebutuhan kampus dan dokumentasi. (cocok untuk kamu yg suka stalking 😋)",
   keywords: ["foto mahasiswa", "ABM", "cari foto", "mahasiswa ABM"],
   icons: {
      icon: "/abm.png",
   },
   other: {
      "google-site-verification": "11ND7Lq7wqVz2HhllgMw5LZWB5FUxTDMtmrbx0LetDQ",
      "theme-color": "#ffffff",
   },
   robots: {
      index: true,
      follow: true,
   },
   authors: [
      { name: "Muhammad Nur Alim", url: "https://muhammadalim7.github.io/" },
   ],
   openGraph: {
      title: "Cari Foto Mahasiswa ABM",
      description: "Aplikasi untuk mencari foto mahasiswa ABM",
      url: "https://cari-mahasiswa-abm.vercel.app/",
      siteName: "Cari Foto Mahasiswa ABM",
      locale: "id_ID",
      type: "website",
   },
};

export default function RootLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   return (
      <html lang="id" suppressHydrationWarning>
         <body
            className={`${grotesk.variable} ${figtree.variable} antialiased`}
         >
            <ThemeProvider
               attribute="class"
               defaultTheme="light"
               enableSystem
               disableTransitionOnChange
            >
               {children}
               <Sonner position="top-center" />
            </ThemeProvider>
         </body>
      </html>
   );
}
