/* eslint-disable @typescript-eslint/no-explicit-any */
import * as cheerio from "cheerio";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
   const { searchParams } = new URL(req.url);
   const nim = searchParams.get("nim")?.trim()?.toUpperCase();
   const authHeader = req.headers.get("authorization");
   const KEY = process.env.INTERNAL_API_TOKEN;

   const validToken = `Bearer ${KEY}`;

   if (authHeader !== validToken) {
      return NextResponse.json(
         {
            error: "Unauthorized",
            code: 401,
         },
         { status: 401 },
      );
   }

   const NIM_URL = process.env.NIMSCRAPE_URL;

   if (!nim) {
      return NextResponse.json(
         { error: "Parameter 'name' diperlukan.", code: 400 },
         { status: 400 },
      );
   }

   try {
      function formatnim(nim: string) {
         return `${nim[0]}.${nim.slice(1, 5)}.${nim[5]}.${nim.slice(6, 11)}`;
      }

      const targetUrl = `${NIM_URL}=${encodeURIComponent(formatnim(nim))}`;

      const res = await fetch(targetUrl, {
         headers: { "User-Agent": "Mozilla/5.0" },
      });

      const html = await res.text();
      const $ = cheerio.load(html);

      const result: {
         name: string;
         image: string;
         nim: string;
         nama_prodi: string;
         batch: string;
         gender: string;
         status: string;
      }[] = [];

      const name = $("h5.p-1").first().text().trim();
      const image = $("img").first().attr("src")?.split("/").pop() || "";
      const nama_prodi = $("h6:contains('Program Studi')")
         .next("p")
         .text()
         .trim();
      const batch = $("h6:contains('Angkatan')").next("p").text().trim();
      const gender = $("h6:contains('Jenis Kelamin')").next("p").text().trim();
      const status = $("h6:contains('Status')").next("p").text().trim();

      result.push({ name, image, nim, nama_prodi, batch, gender, status });

      const notFound = result.every(
         (item) =>
            item.name === "not found" &&
            item.nama_prodi === "not found" &&
            item.batch === "not found" &&
            item.gender === "not found" &&
            item.status === "not found",
      );

      if (!result || result.length === 0 || notFound) {
         return NextResponse.json(
            { nim: nim, error: "Data tidak ditemukan", code: 404 },
            { status: 404 },
         );
      }

      return NextResponse.json(
         {
            nim,
            count: result.length,
            data: result,
            code: 200,
         },
         {
            status: 200,
            headers: {
               "Cache-Control": "public, max-age=3600, must-revalidate",
            },
         },
      );
   } catch (error: any) {
      return NextResponse.json(
         {
            nim: nim,
            error: "Scraping gagal",
            detail: error.message || String(error),
            code: 500,
         },
         { status: 500 },
      );
   }
}
