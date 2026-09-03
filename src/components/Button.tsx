import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";

type CommonProps = {
  children: ReactNode;
  variant?: "solid" | "outline" | "ghost";
};

type AsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type AsAnchor = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

const base =
  "group relative inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[0.8rem] font-medium tracking-[0.01em] transition-all duration-300 ease-out focus-visible:outline-2 focus-visible:outline-offset-4 disabled:cursor-not-allowed disabled:opacity-40";

const variants = {
  solid:
    "bg-carmine text-paper shadow-[0_1px_2px_rgba(37,20,22,0.08),0_8px_20px_-8px_rgba(156,43,63,0.55)] hover:bg-carmine-deep hover:shadow-[0_1px_2px_rgba(37,20,22,0.08),0_14px_28px_-10px_rgba(156,43,63,0.6)] hover:-translate-y-px active:translate-y-0",
  outline:
    "border border-ink/15 text-ink hover:border-carmine/50 hover:text-carmine",
  ghost: "text-ink-soft hover:text-carmine",
};

export function Button(props: AsButton | AsAnchor) {
  const { children, variant = "solid", className, ...rest } = props;
  const classes = [base, variants[variant], className].filter(Boolean).join(" ");

  if ("href" in rest && rest.href) {
    const { href, ...anchorRest } = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a href={href} className={classes} {...anchorRest}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
