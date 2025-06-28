import * as cheerio from "cheerio";
import { unstable_cache } from "next/cache";

// Cached scraping function
const getCachedStudentData = unstable_cache(
   async (npk: string) => {
      console.log(`Scraping for NPK: ${npk}`);
      const targetUrl = `https://apps.stie-mce.ac.id/verifikasiktm.php?npk=${encodeURIComponent(npk)}`;

      const response = await fetch(targetUrl, {
         headers: { "User-Agent": "Mozilla/5.0" },
      });

      const html = await response.text();
      const $ = cheerio.load(html);

      // Deteksi data kosong
      const isNotFound = $("h5.p-1").text().toLowerCase().includes("not found");
      if (isNotFound) {
         throw new Error("Data tidak ditemukan");
      }

      // Ambil data
      const nama = $("h5.p-1").first().text().trim();
      let foto = $("img").first().attr("src") || "";
      if (foto && !foto.startsWith("http")) {
         foto = "https://apps.stie-mce.ac.id/" + foto.replace(/^\/+/, "");
      }

      return {
         name: nama,
         image: foto,
         program: $("h6:contains('Program Studi')").next("p").text().trim(),
         batch: $("h6:contains('Angkatan')").next("p").text().trim(),
         gender: $("h6:contains('Jenis Kelamin')").next("p").text().trim(),
         status: $("h6:contains('Status')").next("p").text().trim(),
         scrapedAt: new Date().toISOString(),
      };
   },
   ["student-data"], // cache key prefix
   {
      revalidate: 3600, // 1 jam
      tags: ["student-data"],
   },
);

export async function GET(req: { url: string | URL }) {
   const { searchParams } = new URL(req.url);
   const npk = searchParams.get("npk");

   if (!npk) {
      return Response.json({ error: "NPK is required" }, { status: 400 });
   }

   try {
      const result = await getCachedStudentData(npk);

      return Response.json({
         ...result,
         cached: true, // Next.js akan handle cache secara otomatis
      });
   } catch (error) {
      if (error instanceof Error && error.message === "Data tidak ditemukan") {
         return Response.json(
            { error: "Data tidak ditemukan" },
            { status: 404 },
         );
      }

      return Response.json(
         {
            error: "Scraping failed",
            detail:
               typeof error === "object" && error !== null && "message" in error
                  ? (error as { message: string }).message
                  : String(error),
         },
         { status: 500 },
      );
   }
}
