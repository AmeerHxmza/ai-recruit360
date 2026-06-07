import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 active:scale-[0.98] aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "rounded-xl text-white shadow-sm hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,82,255,0.35)] hover:brightness-110",
        destructive:
          "rounded-xl bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20",
        outline:
          "rounded-xl border border-border bg-background shadow-xs hover:bg-muted/60 hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-sm",
        secondary:
          "rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "rounded-lg hover:bg-muted/60 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline rounded",
        accent: "rounded-xl text-white shadow-sm hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,82,255,0.35)]",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 rounded-lg gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-12 rounded-xl px-7 text-base has-[>svg]:px-5",
        icon: "size-9 rounded-lg",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-lg",
        "icon-lg": "size-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  style,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  // Apply gradient background for default and accent variants
  const gradientStyle =
    variant === "default" || variant === "accent"
      ? { background: "linear-gradient(to right, #0052FF, #4D7CFF)", ...style }
      : style;

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      style={gradientStyle}
      {...props}
    />
  )
}

export { Button, buttonVariants }
