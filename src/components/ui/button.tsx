import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-xl border border-transparent text-sm font-semibold transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-px disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_4px_16px_rgb(0_178_179_/_0.28)] hover:bg-[#00cacb] hover:shadow-[0_7px_22px_rgb(0_178_179_/_0.36)]",
        outline:
          "border-border bg-transparent text-muted-foreground hover:border-[#315858] hover:bg-secondary/70 hover:text-foreground",
        secondary:
          "border-border bg-secondary text-secondary-foreground hover:border-[#315858] hover:bg-[#173030]",
        ghost:
          "bg-transparent text-muted-foreground hover:bg-primary/10 hover:text-[#00cacb]",
        destructive:
          "border-destructive/35 bg-destructive/10 text-destructive hover:border-destructive/55 hover:bg-destructive/20",
        link: "h-auto rounded-none p-0 text-primary shadow-none hover:text-[#00cacb] hover:underline hover:underline-offset-4",
      },
      size: {
        default: "h-10 gap-2 px-4",
        xs: "h-7 gap-1.5 rounded-lg px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-9 gap-1.5 rounded-lg px-3 text-[0.8125rem] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 gap-2.5 px-6 text-[0.9375rem]",
        icon: "size-10",
        "icon-xs": "size-7 rounded-lg [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-9 rounded-lg",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button };
