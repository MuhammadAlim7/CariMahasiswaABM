import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const FALLBACK_PATH = path.join(process.cwd(), "public", "image.png");

export async function GET(req: NextRequest) {
   const ENCODED_FILE = req.nextUrl.searchParams.get("file");

   if (!ENCODED_FILE) {
      return getFallbackResponse();
   }

   const REAL_FILE = Buffer.from(ENCODED_FILE, "base64").toString("utf-8");

   if (!REAL_FILE) {
      return getFallbackResponse();
   }

   const URL = `${process.env.PROFILE_IMG_URL}/${REAL_FILE}`;
   const response = await fetch(URL);

   if (!response.ok) {
      return getFallbackResponse("Image and fallback not found", 404);
   }

   const buffer = await response.arrayBuffer();

   return new NextResponse(buffer, {
      headers: {
         "Content-Type": response.headers.get("content-type") || "image/jpeg",
         "Cache-Control": "public, max-age=31536000, immutable",
      },
   });
}

function getFallbackResponse(
   message = "Fallback image not found",
   status = 404,
) {
   try {
      const fallbackBuffer = fs.readFileSync(FALLBACK_PATH);
      return new NextResponse(fallbackBuffer, {
         headers: {
            "Content-Type": "image/png",
            "Cache-Control": "public, max-age=31536000, immutable",
         },
      });
   } catch (error) {
      return NextResponse.json(
         { error: message, detail: error || String(error) },
         { status },
      );
   }
}
