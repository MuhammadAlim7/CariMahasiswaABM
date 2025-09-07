/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
   try {
      const { name, nim }: { name?: string; nim?: string } = await req.json();
      const BASE_URL = req.nextUrl.origin;
      const KEY = process.env.INTERNAL_API_TOKEN;
      console.log({ name, nim });

      let _nim = nim;

      // kalau cari berdasarkan nama
      if (name) {
         const res = await fetch(`${BASE_URL}/api/name-scrape?name=${name}`, {
            headers: { Authorization: `Bearer ${KEY}` },
            next: { revalidate: 3600 },
         });
         const json = await res.json();

         if (!res.ok) {
            return NextResponse.json(
               { error: json.error },
               { status: res.status },
            );
         }

         _nim = json.data?.[0]?.nim;
      }

      // ambil data berdasarkan NIM
      const res = await fetch(`${BASE_URL}/api/nim-scrape?nim=${_nim}`, {
         headers: { Authorization: `Bearer ${KEY}` },
         next: { revalidate: 3600 },
      });
      const json = await res.json();

      if (!res.ok)
         return NextResponse.json(
            { error: json.error },
            { status: res.status },
         );

      return NextResponse.json({ data: json.data[0] });

      // return NextResponse.json({ data: json.data[0] });
   } catch (error: any) {
      return NextResponse.json(
         { error: String(error), detail: error.message || String(error) },
         { status: 500 },
      );
   }
}
