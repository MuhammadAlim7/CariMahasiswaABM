import type { Metadata } from "next";
import { Space_Grotesk, Figtree } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "sonner";

const grotesk = Space_Grotesk({
   variable: "--font-grotesk",
   subsets: ["latin"],
});

const figtree = Figtree({
   variable: "--font-figtree",
   subsets: ["latin"],
});

export const metadata: Metadata = {
   title: "Cari Foto Mahasiswa ABM",
   icons: {
      icon: "/abm.png",
   },
   description: "Aplikasi untuk mencari foto mahasiswa ABM",
   other: {
      "google-site-verification": "-VJnWFmz3P8w1snXji-bSPxdfesfhGUaeNezACC4-c0", // paste kode dari Google
   },
   keywords: ["foto mahasiswa", "ABM", "cari foto", "mahasiswa ABM"],
   authors: [
      { name: "Muhammad Nur Alim", url: "https://muhammadalim7.github.io/" },
   ],
   openGraph: {
      title: "Cari Foto Mahasiswa ABM",
      description: "Aplikasi untuk mencari foto mahasiswa ABM",
      url: "https://yourwebsite.com",
      siteName: "Cari Foto Mahasiswa ABM",
      locale: "id_ID",
      type: "website",
   },
   robots: {
      index: true,
      follow: true,
   },
};

export default function RootLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   return (
      <html lang="id" suppressHydrationWarning>
         <head>
            <meta
               name="viewport"
               content="width=device-width, initial-scale=1"
            />
            <meta name="theme-color" content="#ffffff" />
            <link rel="icon" href="/abm.png" />
         </head>
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
               <Toaster position="top-center" />
            </ThemeProvider>
         </body>
      </html>
   );
}
