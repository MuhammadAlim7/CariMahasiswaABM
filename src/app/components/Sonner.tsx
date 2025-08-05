"use client";

import {
   CircleAlert,
   CircleCheck,
   CircleX,
   Info,
   LoaderCircle,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster, ToasterProps } from "sonner";

const Sonner = ({ ...props }: ToasterProps) => {
   const { theme = "system" } = useTheme();

   return (
      <Toaster
         theme={theme as ToasterProps["theme"]}
         toastOptions={{
            duration: 4000,
            unstyled: false,
            style: {
               background: "var(--color-background)",
               boxShadow: "none",
               borderWidth: "1px",
               borderColor: "var(--color-outline)",
               borderStyle: "solid",
               borderRadius: "12px",
               padding: "12px 16px 12px 16px",
            },
         }}
         icons={{
            success: (
               <CircleCheck size={18} strokeWidth={1.5} absoluteStrokeWidth />
            ),
            info: <Info size={18} strokeWidth={1.5} absoluteStrokeWidth />,
            warning: (
               <CircleAlert size={18} strokeWidth={1.5} absoluteStrokeWidth />
            ),
            error: <CircleX size={18} strokeWidth={1.5} absoluteStrokeWidth />,
            loading: (
               <LoaderCircle
                  size={18}
                  strokeWidth={1.5}
                  absoluteStrokeWidth
                  className="animate-spin"
               />
            ),
         }}
         {...props}
      />
   );
};

export { Sonner };
