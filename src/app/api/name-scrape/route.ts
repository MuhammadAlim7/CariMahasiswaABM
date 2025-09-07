/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import Base64 from "crypto-js/enc-base64";
import Pkcs7 from "crypto-js/pad-pkcs7";
import AES from "crypto-js/aes";
import Utf8 from "crypto-js/enc-utf8";

export async function GET(req: NextRequest) {
   const { searchParams } = new URL(req.url);
   const name = searchParams.get("name")?.trim().toUpperCase();
   const authHeader = req.headers.get("authorization");
   const KEY = process.env.INTERNAL_API_TOKEN;
   const ORIGIN = process.env.NAMESCRAPE_URL;

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

   const AES_KEY = Base64.parse(process.env.AES_SECRET_KEY!);
   const AES_IV = Base64.parse(process.env.AES_IV!);

   const API_URL = process.env.NAMESCRAPE_API_URL;
   const QUERY_URL = process.env.QUERY_NAMESCRAPE;

   if (!name) {
      return NextResponse.json(
         { error: "Parameter 'name' diperlukan.", code: 400 },
         { status: 400 },
      );
   }

   const query = `${QUERY_URL} ${name}`;
   const targetUrl = `${API_URL}/${encodeURIComponent(query)}`;

   const headers: Record<string, string> = {};

   if (ORIGIN) {
      headers["Origin"] = ORIGIN;
      headers["Referer"] = `${ORIGIN}/`;
   }

   try {
      const result: {
         id: string;
         nama: string;
         nim: string;
         nama_pt: string;
         sinkatan_pt: string;
         nama_prodi: string;
      }[] = [];

      const res = await fetch(targetUrl, {
         method: "GET",
         headers,
      });

      const data = await res.json();

      function decryptData(encryptedData: any) {
         const decrypted = AES.decrypt(encryptedData, AES_KEY, {
            iv: AES_IV,
            padding: Pkcs7,
         });

         return decrypted.toString(Utf8);
      }

      // console.log(JSON.parse(decryptData(data)));

      const parsed = JSON.parse(decryptData(data));
      result.push(...(parsed?.mahasiswa ?? []));

      if (!result || result.length === 0) {
         return NextResponse.json(
            { query: query, error: "Data tidak ditemukan", code: 404 },
            { status: 404 },
         );
      }

      return NextResponse.json(
         {
            query: query,
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
            query: query,
            error: "Scraping gagal",
            detail: error.message || String(error),
            code: 500,
         },
         { status: 500 },
      );
   }
}
