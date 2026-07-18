import { ButtonHTMLAttributes, forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: "primary" | "secondary";
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, asChild = false, variant = "primary", ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex h-12 items-center justify-center whitespace-nowrap border px-5 text-[13px] font-medium uppercase tracking-[0.16em] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:translate-y-px",
          variant === "primary"
            ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-[color:var(--bg)]"
            : "border-[color:var(--hairline)] bg-transparent text-[color:var(--text)] hover:bg-[color:var(--accent-soft)]",
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
export type { ButtonProps };
