import { useState } from "react";
import { motion } from "motion/react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { X } from "lucide-react";

interface MahasiswaData {
   name: string;
   image: string;
   program: string;
   batch: string;
   gender: string;
   status: string;
   rawNpk?: string;
}

export default function Modal({
   data,
   setOpen,
}: {
   data: MahasiswaData;
   setOpen: (open: boolean) => void;
}) {
   const [imageError, setImageError] = useState<boolean>(false);

   function toTitleCase(str: string) {
      return str
         .toLowerCase()
         .split(" ")
         .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
         .join(" ");
   }

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
         <div className="relative text-sm text-neutral-900">
            {/* Error Header */}
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               transition={{
                  duration: 0.7,
               }}
               className="fixed inset-0 bg-neutral-900/80 backdrop-blur-xl"
            />
            <motion.div
               initial={{ opacity: 0, scale: 0.95, y: 40 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 40 }}
               transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  duration: 0.4,
               }}
               className="relative rounded-xl rounded-tr-xl bg-white/95 p-3 shadow-lg"
            >
               <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <Status data={data} />
                  </div>
                  <div className="mb-2 flex items-center justify-end">
                     <div className="flex items-center gap-2">
                        <button
                           onClick={() => setOpen(false)}
                           className="text-neutral-400 hover:text-neutral-900"
                        >
                           <X className="m-1 size-4" />
                        </button>
                     </div>
                  </div>
               </div>

               <div className="mr-2 flex gap-4">
                  <div className="">
                     <Image
                        src={data.image}
                        alt={`${data.rawNpk}`}
                        width={150}
                        height={200}
                        className={cn(
                           "aspect-[3/4] h-full overflow-hidden rounded-lg border border-neutral-300 object-cover",
                           imageError && "hidden",
                        )}
                        onError={() => setImageError(true)}
                     />
                     <Image
                        src="/image.png"
                        alt={`${data.rawNpk}`}
                        width={150}
                        height={200}
                        className={cn(
                           "aspect-[3/4] h-full overflow-hidden rounded-lg border border-neutral-300 object-cover",
                           !imageError && "hidden",
                        )}
                     />
                  </div>
                  <div className="flex flex-1 flex-col justify-center gap-4">
                     <div>
                        <div className="text-sm tracking-wide text-neutral-500">
                           Nama Lengkap
                        </div>
                        <div className="text-2xl font-bold">
                           {toTitleCase(data.name)}
                        </div>
                     </div>
                     <div>
                        <div className="text-sm tracking-wide text-neutral-500">
                           Nomor Pokok Mahasiswa
                        </div>
                        <div className="text-2xl font-bold tracking-wide">
                           {data.rawNpk}
                        </div>
                     </div>
                     <div className="flex gap-8">
                        <div className="">
                           <div className="text-sm tracking-wide text-neutral-500">
                              Gender
                           </div>
                           <div className="text-2xl font-bold tracking-wide">
                              {toTitleCase(data.gender)}
                           </div>
                        </div>
                        <div className="">
                           <div className="text-sm tracking-wide text-neutral-500">
                              Program Studi
                           </div>
                           <div className="text-2xl font-bold tracking-wide">
                              {toTitleCase(data.program)}
                           </div>
                        </div>
                        <div className="">
                           <div className="text-sm tracking-wide text-neutral-500">
                              Angkatan
                           </div>
                           <div className="text-2xl font-bold tracking-wide">
                              {data.batch}
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </motion.div>
         </div>
      </div>
   );
}

const statusVariants = cva(
   "flex items-center gap-2 rounded px-2 py-1 text-xs font-semibold",
   {
      variants: {
         status: {
            AKTIF: "bg-green-600/20 text-green-700",
            LULUS: "bg-blue-600/20 text-blue-700",
            KELUAR: "bg-red-600/20 text-red-700",
         },
      },
      defaultVariants: {
         status: "AKTIF",
      },
   },
);

const dotVariants = cva("size-2 rounded-full", {
   variants: {
      status: {
         AKTIF: "bg-green-600",
         LULUS: "bg-blue-600",
         KELUAR: "bg-red-600",
      },
   },
   defaultVariants: {
      status: "AKTIF",
   },
});

function Status({
   data,
   className,
   ...props
}: { data: MahasiswaData } & React.HTMLAttributes<HTMLDivElement>) {
   const status =
      data.status === "LULUS"
         ? "LULUS"
         : data.status === "KELUAR"
           ? "KELUAR"
           : "AKTIF";
   const label =
      status === "LULUS"
         ? "Mahasiswa Lulus"
         : status === "KELUAR"
           ? "Mahasiswa Keluar"
           : "Mahasiswa Aktif";

   return (
      <div className={cn(statusVariants({ status }), className)} {...props}>
         <div className={dotVariants({ status })}></div>
         {label}
      </div>
   );
}
