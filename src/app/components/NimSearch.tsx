"use client";
import { useRef, useState } from "react";
import { OtpInput, Divider } from "./NimInput";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Forward, IdCard, RefreshCw, User } from "lucide-react";
import { AnimatePresence, motion, useAnimate } from "motion/react";
import Modal from "./Modal";

export default function NimSearch() {
   interface MahasiswaData {
      name: string;
      image: string;
      program: string;
      batch: string;
      gender: string;
      status: string;
      rawNpk: string;
   }

   const inputNimRefs = useRef<HTMLInputElement[]>([]);
   const inputNameRef = useRef<HTMLInputElement>(null);
   const submitButtonRef = useRef<HTMLButtonElement>(null);
   const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
   const [inputTypeName, setInputTypeName] = useState<boolean>(false);
   const [scope, animate] = useAnimate();
   const [data, setData] = useState<MahasiswaData | null>(null);
   const values = ["A", "1", "2", "3", "4", "1", "1", "2", "3", "4", "5"];

   function handleChangeNim(
      e: React.ChangeEvent<HTMLInputElement>,
      index: number,
   ) {
      const value = e.target.value;

      if (index === 0) {
         if (!/^[a-zA-Z]?$/.test(value)) {
            e.target.setCustomValidity(
               "isi dengan awalan huruf nomor pokokmu!",
            );
            e.target.reportValidity();
            e.target.value = "";
            return;
         }
         e.target.value = value
            .replace(/[^a-zA-Z]/g, "")
            .toUpperCase()
            .slice(0, 1);
         e.target.setCustomValidity("");
      } else {
         if (!/^\d?$/.test(value)) {
            e.target.setCustomValidity("isi dengan nomor pokokmu!");
            e.target.reportValidity();
            e.target.value = "";
            return;
         }
         e.target.value = value.replace(/[^0-9]/g, "").slice(0, 1);
         e.target.setCustomValidity("");
      }

      if (e.target.value.length === 1) {
         if (inputNimRefs.current[index + 1]) {
            inputNimRefs.current[index + 1].focus();
         } else {
            // Jika input terakhir, fokus ke tombol submit
            submitButtonRef.current?.focus();
         }
      }
   }

   function handleChangeName(e: React.ChangeEvent<HTMLInputElement>) {
      const value = e.target.value;

      if (!/^[a-zA-Z\s]*$/.test(value)) {
         e.target.setCustomValidity("Nama Lengkap");
         e.target.reportValidity();
         e.target.value = "";
         return;
      }

      e.target.setCustomValidity("");
   }

   function handleKeyDown(
      e: React.KeyboardEvent<HTMLInputElement>,
      index: number,
   ) {
      if (e.key === "Backspace" && e.currentTarget.value === "" && index > 0) {
         inputNimRefs.current[index - 1]?.focus();
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
      const inputNim = inputNimRefs.current.some((input) => !input?.value);
      const inputName = !inputNameRef.current?.value;
      const isEmpty = inputTypeName ? inputName : inputNim;
      const submitButton = await submitButtonRef.current;
      const KEY = process.env.NEXT_PUBLIC_INTERNAL_API_TOKEN;

      function formatNpk(nim: string) {
         return `${nim[0]}.${nim.slice(1, 5)}.${nim[5]}.${nim.slice(6, 11)}`;
      }

      if (isEmpty) {
         toast.error("Semua kolom harus diisi!");
         return;
      }

      const toastId = toast.loading("Loading...");

      try {
         if (submitButton) submitButton.disabled = true;
         // console.log("Button disabled");

         let raw, npk;

         if (inputTypeName) {
            // mode: cari berdasarkan nama
            const name = inputNameRef.current?.value;

            const fetchNimFromName = async () => {
               const res = await fetch(`/api/name-scrape?name=${name}`, {
                  headers: {
                     Authorization: `Bearer ${KEY}`,
                  },
               });
               const json = await res.json();
               if (!res.ok) throw new Error(json.error || "Unknown error");
               return json;
            };

            // console.log("load 01");
            const result = await fetchNimFromName();

            console.table(result?.data);

            const nim = result.data?.[0]?.nim;
            if (!nim) {
               // console.log("load step 01 - failed", "NIM tidak ditemukan");
               throw new Error("NIM tidak ditemukan");
            }
            // console.log("load 01 success");

            raw = nim;
            npk = formatNpk(raw);
         } else {
            // mode: input manual nim
            raw = inputNimRefs.current
               .map((input) => input?.value || "")
               .join("");
            npk = formatNpk(raw);
         }

         // fetch data berdasarkan NPK
         const fetchDataByNpk = async () => {
            const res = await fetch(`/api/nim-scrape?npk=${npk}`, {
               headers: {
                  Authorization: `Bearer ${KEY}`,
               },
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Unknown error");
            return json;
         };

         const data = await fetchDataByNpk();
         setData({ ...data, rawNpk: raw });
         toast.success("Data berhasil ditemukan!", { id: toastId });

         if (submitButton) submitButton.disabled = false;
         // console.log("Button enabled");
      } catch (err: unknown) {
         const errorMessage =
            err instanceof Error ? err.message : "Terjadi kesalahan";
         toast.error(errorMessage, {
            id: toastId,
            description: "Coba ulang dan periksa nama lengkap mu",
         });

         if (submitButton) submitButton.disabled = false;
         // console.log("Button enabled");
      }
   }

   async function handleReset() {
      await setData(null);
      toast.warning("Input direset", { id: "reset" });
      animate("svg", { rotate: [0, 180] });
      inputNimRefs.current.forEach((input) => {
         if (input) input.value = "";
      });
      // inputNimRefs.current[0]?.focus(); // kembali ke awal
   }

   async function handleClose() {
      toast("Tutup Data?", {
         id: "close",
         classNames: {
            toast: "flex ",
            actionButton: "!ml-0",
         },
         action: {
            label: "Tutup",
            onClick: () => {
               setData(null);
               inputNimRefs.current.forEach((input) => {
                  if (input) input.value = "";
               });
            },
         },
         cancel: { label: "Batal", onClick: () => {} },
         actionButtonStyle: {
            background: "var(--color-red-600)",
            color: "var(--background)",
            borderRadius: "6px",
         },
         duration: Infinity,
      });
   }

   return (
      <>
         <form id="formnpk" onSubmit={handleSubmit}>
            <motion.div layout className="flex flex-col p-2">
               <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">
                     Cari Mahasiswa ABM
                  </span>
                  <span className="text-secondary text-sm transition-opacity">
                     ({"\u00A0"}
                     {!inputTypeName &&
                        values.map((char, idx) => {
                           const withSpace =
                              idx === 1 || idx === 5 || idx === 6
                                 ? "\u00A0"
                                 : "";
                           const inputValue =
                              inputNimRefs.current[idx]?.value || char;

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
                     {inputTypeName && "Nama Lengkap"}
                     {"\u00A0"})
                  </span>
               </div>
            </motion.div>

            <motion.div
               layout
               className="border-secondary bg-background flex w-80 justify-center overflow-hidden rounded-xl border p-2"
            >
               <AnimatePresence>
                  {inputTypeName ? (
                     <motion.input
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                           duration: 0.8,
                           delay: 0.25,
                           ease: [0, 0.71, 0.2, 1.01],
                        }}
                        ref={inputNameRef}
                        type="text"
                        name="name"
                        required
                        pattern="^[A-Za-z\s]+$"
                        title="Name lengkap dengan spasi"
                        onChange={(e) => handleChangeName(e)}
                        autoComplete="off"
                        className="border-outline focus:ring-foreground h-11 w-full rounded-md border text-center text-sm font-semibold text-neutral-800 uppercase transition-all duration-150 outline-none focus:z-10 focus:ring-2"
                     />
                  ) : (
                     <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                           duration: 0.8,
                           delay: 0.25,
                           ease: [0, 0.71, 0.2, 1.01],
                        }}
                        layout
                        className="flex flex-col gap-2"
                     >
                        <div className="flex">
                           {Array.from({ length: 5 }).map((_, i) => (
                              <div key={i} className="flex items-center">
                                 {i > 0 && i === 1 && <Divider />}
                                 <OtpInput
                                    ref={(el) => {
                                       inputNimRefs.current[i] = el!;
                                    }}
                                    name={`OtpInput${i}`}
                                    type={i === 0 ? "text" : "tel"}
                                    inputMode={i === 0 ? "text" : "numeric"}
                                    pattern={i === 0 ? "[A-Za-z]" : "[0-9]"}
                                    onChange={(e) => handleChangeNim(e, i)}
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

                        <div className="flex">
                           {Array.from({ length: 6 }).map((_, idx) => {
                              const i = idx + 5;
                              return (
                                 <div key={i} className="flex items-center">
                                    {(i === 5 || i === 6) && <Divider />}
                                    <OtpInput
                                       ref={(el) => {
                                          inputNimRefs.current[i] = el!;
                                       }}
                                       type="tel"
                                       name={`OtpInput${i}`}
                                       inputMode="numeric"
                                       pattern="[0-9]"
                                       onChange={(e) => handleChangeNim(e, i)}
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
                     </motion.div>
                  )}
               </AnimatePresence>
            </motion.div>
            <motion.div
               layout
               className="flex items-center justify-between gap-x-2 p-2"
            >
               <span className="text-secondary text-sm">
                  stie malangkucecwara
               </span>
               <div className="flex gap-1">
                  <ButtonWithTooltip
                     type="button"
                     tooltipName={`${!inputTypeName ? "Nama" : "Nim"}`}
                     title={`cari ${!inputTypeName ? "nama" : "nim"}`}
                     onClick={() => {
                        setInputTypeName(!inputTypeName);
                     }}
                     className="border-secondary text-foreground rounded-md border p-2 text-sm font-semibold"
                  >
                     {!inputTypeName ? (
                        <User className="size-5" />
                     ) : (
                        <IdCard className="size-5" />
                     )}
                  </ButtonWithTooltip>
                  <ButtonWithTooltip
                     type="reset"
                     tooltipName="Reset"
                     title="Reset"
                     onClick={handleReset}
                     ref={scope}
                     className="border-secondary text-foreground rounded-md border p-2 text-sm font-semibold"
                  >
                     <RefreshCw className="size-5" />
                  </ButtonWithTooltip>
                  <ButtonWithTooltip
                     type="submit"
                     tooltipName="Cari"
                     title="cari"
                     ref={submitButtonRef}
                     className="bg-foreground text-background rounded-md p-2 text-sm font-semibold"
                     disabled={false}
                  >
                     <Forward className="size-5" />
                  </ButtonWithTooltip>
               </div>
            </motion.div>
         </form>
         <AnimatePresence>
            {data !== null && <Modal data={data} handleClose={handleClose} />}
         </AnimatePresence>
      </>
   );
}
interface ButtonWithTooltipProps {
   tooltipName: string;
   children: React.ReactNode;
}

const ButtonWithTooltip = ({
   tooltipName,
   children,
   className,
   ...props
}: React.ComponentProps<"button"> & ButtonWithTooltipProps) => {
   const [isHovered, setIsHovered] = useState(false);

   return (
      <button
         className={cn("relative", className)}
         onMouseEnter={() => setIsHovered(true)}
         onMouseLeave={() => setIsHovered(false)}
         {...props}
      >
         <AnimatePresence>
            {isHovered && (
               <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0 }}
                  className="bg-foreground text-background absolute top-full left-1/2 mt-1 mb-2 -translate-x-1/2 transform rounded-md px-2 py-1 text-xs font-medium shadow-sm"
               >
                  {tooltipName}
               </motion.div>
            )}
         </AnimatePresence>
         {children}
      </button>
   );
};
