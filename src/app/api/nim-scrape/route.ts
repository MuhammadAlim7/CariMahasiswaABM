import * as cheerio from "cheerio";
import { NextRequest, NextResponse } from "next/server";

// Cached scraping function
const getStudentData = async (npk: string) => {
   const NIM_URL = process.env.NIMSCRAPE_URL;
   const IMG_URL = process.env.PROFILE_IMG_BASE_URL;

   const targetUrl = `${NIM_URL}=${encodeURIComponent(npk)}`;

   const response = await fetch(targetUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
   });

   const html = await response.text();
   const $ = cheerio.load(html);

   const isNotFound = $("h5.p-1").text().toLowerCase().includes("not found");
   if (isNotFound) {
      throw new Error("Data tidak ditemukan");
   }

   const nama = $("h5.p-1").first().text().trim();
   let foto = $("img").first().attr("src") || "";
   if (foto && !foto.startsWith("http")) {
      foto = `${IMG_URL}/` + foto.replace(/^\/+/, "");
   }

   return {
      name: nama,
      image: foto,
      program: $("h6:contains('Program Studi')").next("p").text().trim(),
      batch: $("h6:contains('Angkatan')").next("p").text().trim(),
      gender: $("h6:contains('Jenis Kelamin')").next("p").text().trim(),
      status: $("h6:contains('Status')").next("p").text().trim(),
   };
};

export async function GET(req: NextRequest) {
   const { searchParams } = new URL(req.url);
   const npk = searchParams.get("npk");

   const authHeader = req.headers.get("authorization");
   const KEY = process.env.INTERNAL_API_TOKEN;

   if (!authHeader || authHeader !== `Bearer ${KEY}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
   }

   if (!npk) {
      return NextResponse.json({ error: "NPK is required" }, { status: 400 });
   }

   try {
      const result = await getStudentData(npk);

      return NextResponse.json(result);
   } catch (error) {
      if (error instanceof Error && error.message === "Data tidak ditemukan") {
         return NextResponse.json(
            { error: "Data tidak ditemukan" },
            { status: 404 },
         );
      }

      return NextResponse.json(
         {
            error: "Scraping failed",
            detail: error instanceof Error ? error.message : String(error),
         },
         { status: 500 },
      );
   }
}
