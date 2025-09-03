/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
   const { searchParams } = new URL(request.url);
   const name = searchParams.get("name")?.trim();

   const authHeader = request.headers.get("authorization");
   const KEY = process.env.INTERNAL_API_TOKEN;

   if (!authHeader || authHeader !== `Bearer ${KEY}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
   }

   const NAME_URL = process.env.NAMESCRAPE_URL;
   const QUERY_URL = process.env.QUERY_NAMESCRAPE;

   if (!name) {
      return NextResponse.json(
         { error: "Parameter 'name' diperlukan." },
         { status: 400 },
      );
   }

   const query = `${QUERY_URL} ${name}`;
   const targetUrl = `${NAME_URL}/${encodeURIComponent(query)}`;

   let browser;

   try {
      const isVercel = !!process.env.VERCEL_ENV;

      let puppeteer: any;
      let launchOptions: any = {
         headless: true,
      };

      if (isVercel) {
         const chromium = (await import("@sparticuz/chromium")).default;
         puppeteer = await import("puppeteer-core");
         launchOptions = {
            ...launchOptions,
            args: chromium.args,
            executablePath: await chromium.executablePath(),
         };
      } else {
         puppeteer = await import("puppeteer");
      }

      browser = await puppeteer.launch(launchOptions);
      const page = await browser.newPage();
      await page.goto(targetUrl, { waitUntil: "networkidle2" });

      const html = await page.content();
      const $ = cheerio.load(html);

      const results: {
         nama: string;
         nim: string;
         perguruan_tinggi: string;
         program_studi: string;
      }[] = [];

      $("table tbody tr").each((_, row) => {
         const tds = $(row).find("td");
         const nama = $(tds[0]).text().trim();
         const nim = $(tds[1]).text().trim();
         const perguruan_tinggi = $(tds[2]).text().trim();
         const program_studi = $(tds[3]).text().trim();

         results.push({ nama, nim, perguruan_tinggi, program_studi });
      });

      console.log({
         query,
         count: results.length,
         data: results,
      });

      if (results.length === 0) {
         return NextResponse.json(
            { error: "Data tidak ditemukan" },
            { status: 404 },
         );
      }

      return NextResponse.json({
         query,
         count: results.length,
         data: results,
      });
   } catch (error: any) {
      console.error("Scraping Error:", error);
      return NextResponse.json(
         {
            error: "Scraping gagal",
            detail: error.message || String(error),
         },
         { status: 500 },
      );
   } finally {
      if (browser) {
         await browser.close();
      }
   }
}
