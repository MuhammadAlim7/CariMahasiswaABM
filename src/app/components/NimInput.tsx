import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";

const InputVariants = cva(
   "border-outline border size-11 text-center text-sm font-semibold text-neutral-800 transition-all focus:z-10 outline-none focus:ring-2 focus:ring-foreground duration-150 ",
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

export function OtpInput({
   className,
   variant,
   ...props
}: React.ComponentProps<"input"> & VariantProps<typeof InputVariants>) {
   return (
      <input
         required
         maxLength={1}
         minLength={1}
         autoComplete="off"
         className={cn(InputVariants({ variant, className }))}
         {...props}
      />
   );
}

export function Divider({ className, ...props }: React.ComponentProps<"div">) {
   return (
      <div
         className={cn("bg-secondary mx-2 h-6 w-px", " ", className)}
         {...props}
      />
   );
}
