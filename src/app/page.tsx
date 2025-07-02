"use client";
import { useRef, useState } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import Modal from "./Modal";
import { AnimatePresence } from "motion/react";
import { toast } from "sonner";

export default function Home() {
   interface MahasiswaData {
      name: string;
      image: string;
      program: string;
      batch: string;
      gender: string;
      status: string;
      rawNpk: string;
   }

   const inputRefs = useRef<HTMLInputElement[]>([]);
   const submitButtonRef = useRef<HTMLButtonElement>(null);
   const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
   const [data, setData] = useState<MahasiswaData | null>(null);
   const [open, setOpen] = useState<boolean>(false);
   const values = ["A", "1", "2", "3", "4", "1", "1", "2", "3", "4", "5"];

   function handleChange(
      e: React.ChangeEvent<HTMLInputElement>,
      index: number,
   ) {
      const value = e.target.value;

      if (index === 0) {
         if (!/^[a-zA-Z]?$/.test(value)) {
            toast.warning("Warning", {
               description: "Input pertama hanya boleh huruf!",
            });
            e.target.value = "";
            return;
         }
         e.target.value = value
            .replace(/[^a-zA-Z]/g, "")
            .toUpperCase()
            .slice(0, 1);
      } else {
         if (!/^\d?$/.test(value)) {
            toast.warning("Warning", {
               description: "Input selanjutnya hanya boleh angka!",
            });
            e.target.value = "";
            return;
         }
         e.target.value = value.replace(/[^0-9]/g, "").slice(0, 1);
      }

      if (e.target.value.length === 1) {
         if (inputRefs.current[index + 1]) {
            inputRefs.current[index + 1].focus();
         } else {
            // Jika input terakhir, fokus ke tombol submit
            submitButtonRef.current?.focus();
         }
      }
   }

   function handleKeyDown(
      e: React.KeyboardEvent<HTMLInputElement>,
      index: number,
   ) {
      if (e.key === "Backspace" && e.currentTarget.value === "" && index > 0) {
         inputRefs.current[index - 1]?.focus();
      }
   }

   function handleFocus(index: number) {
      setFocusedIndex(index);
   }

   function handleBlur() {
      setFocusedIndex(null);
   }

   async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();

      // Validasi: pastikan semua input terisi
      const isAnyEmpty = inputRefs.current.some((input) => !input?.value);
      if (isAnyEmpty) {
         toast.error("Error", {
            description: "Semua kolom harus diisi!",
         });
         return;
      }

      const raw = inputRefs.current.map((input) => input?.value || "").join("");
      const npk = `${raw[0]}.${raw.slice(1, 5)}.${raw[5]}.${raw.slice(6, 11)}`;

      try {
         const fetchData = async () => {
            const res = await fetch(`/api/scrape?npk=${npk}`);
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Unknown error");
            return json;
         };

         toast.promise(fetchData(), {
            loading: "Loading...",
            success: (data: MahasiswaData) => {
               setData({ ...data, rawNpk: raw });
               setOpen(true);
               return "Data berhasil ditemukan!";
            },
            error: (err: Error) => err.message || "Error",
         });
      } catch (err: unknown) {
         toast.error("Error", {
            description:
               err instanceof Error ? err.message : "Terjadi kesalahan",
         });
      }
   }

   function handleReset() {
      setData(null);
      toast.info("Input direset");
      inputRefs.current.forEach((input) => {
         if (input) input.value = "";
      });
      inputRefs.current[0]?.focus(); // kembali ke awal
   }

   return (
      <div className="mx-auto flex h-dvh max-w-7xl items-center justify-center">
         <form
            id="formnpk"
            className="grid max-w-screen-sm gap-2"
            onSubmit={handleSubmit}
         >
            <div className="flex items-center justify-between gap-2 p-2">
               <span className="text-lg font-semibold">
                  Cari Foto Mahasiswa
               </span>
               <span className="text-sm opacity-40 transition-opacity">
                  ({"\u00A0"}
                  {values.map((char, idx) => {
                     const withSpace =
                        idx === 1 || idx === 5 || idx === 6 ? "\u00A0" : ""; // spasi di awal grup

                     // Ambil value dari input jika ada
                     const inputValue = inputRefs.current[idx]?.value || char;

                     return (
                        <span
                           key={idx}
                           className={cn(
                              "inline-block",
                              focusedIndex === idx && "animate-blink",
                           )}
                        >
                           {withSpace + inputValue}
                        </span>
                     );
                  })}
                  {"\u00A0"})
               </span>
            </div>

            <div className="flex items-center rounded-xl border border-neutral-300 bg-white p-2">
               <div className="flex w-full grow flex-col gap-2">
                  {/* Baris atas: input 0-4 */}
                  <div className="flex">
                     {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center">
                           {i > 0 && i === 1 && <Divider />}
                           <OtpInput
                              ref={(el) => {
                                 inputRefs.current[i] = el!;
                              }}
                              type={i === 0 ? "text" : "tel"}
                              inputMode={i === 0 ? "text" : "numeric"}
                              pattern={i === 0 ? "[A-Za-z]" : "[0-9]"}
                              onChange={(e) => handleChange(e, i)}
                              onKeyDown={(e) => handleKeyDown(e, i)}
                              onFocus={() => handleFocus(i)}
                              onBlur={handleBlur}
                              variant={
                                 i === 1
                                    ? "left"
                                    : i === 4
                                      ? "right"
                                      : i >= 2 && i <= 4
                                        ? "mid"
                                        : undefined
                              }
                           />
                        </div>
                     ))}
                  </div>
                  {/* Baris bawah: input 5-10 */}
                  <div className="flex">
                     {Array.from({ length: 6 }).map((_, idx) => {
                        const i = idx + 5;
                        return (
                           <div key={i} className="flex items-center">
                              {(i === 5 || i === 6) && <Divider />}
                              <OtpInput
                                 ref={(el) => {
                                    inputRefs.current[i] = el!;
                                 }}
                                 type="tel"
                                 inputMode="numeric"
                                 pattern="[0-9]"
                                 onChange={(e) => handleChange(e, i)}
                                 onKeyDown={(e) => handleKeyDown(e, i)}
                                 onFocus={() => handleFocus(i)}
                                 onBlur={handleBlur}
                                 variant={
                                    i === 6
                                       ? "left"
                                       : i === 10
                                         ? "right"
                                         : i >= 7 && i <= 9
                                           ? "mid"
                                           : undefined
                                 }
                              />
                           </div>
                        );
                     })}
                  </div>
               </div>
            </div>
            <div className="flex items-center justify-between p-2">
               <span className="text-sm opacity-40">stie malangkucecwara</span>
               <div className="flex gap-2">
                  <button
                     type="reset"
                     onClick={handleReset}
                     className="h-9 rounded-md border border-neutral-300 px-4 text-sm font-semibold text-neutral-900"
                  >
                     Reset
                  </button>
                  <button
                     type="submit"
                     ref={submitButtonRef}
                     className="h-9 rounded-md bg-neutral-900 px-4 text-sm font-semibold text-white"
                  >
                     Send
                  </button>
               </div>
            </div>
         </form>
         <AnimatePresence>
            {open && data ? <Modal setOpen={setOpen} data={data} /> : ""}
         </AnimatePresence>
      </div>
   );
}

const InputVariants = cva(
   "border-outline border size-11 text-center text-sm font-semibold text-neutral-800 transition-all focus:z-10 outline-none focus:ring-2 focus:ring-neutral-900 duration-700 ",
   {
      variants: {
         variant: {
            default: "rounded-md ",
            mid: "border-r-0",
            left: "rounded-l-md border-r-0",
            right: "rounded-r-md",
         },
      },
      defaultVariants: {
         variant: "default",
      },
   },
);

function OtpInput({
   className,
   variant,
   ...props
}: React.ComponentProps<"input"> & VariantProps<typeof InputVariants>) {
   return (
      <input
         required
         maxLength={1}
         minLength={1}
         className={cn(InputVariants({ variant, className }))}
         {...props}
      />
   );
}

function Divider({ className, ...props }: React.ComponentProps<"div">) {
   return (
      <div
         className={cn("mx-2 h-6 w-px bg-neutral-300", " ", className)}
         {...props}
      />
   );
}
