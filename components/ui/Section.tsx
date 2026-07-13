import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A full-width vertical band with a centered container for its content. */
export function Section({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={cn("py-20 sm:py-28", className)}>
      <div className="container">{children}</div>
    </section>
  );
}

/** Centered eyebrow + title + optional description used to head a section. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-2xl text-center", className)}>
      {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
      <h2 className="display-hero mt-5 text-3xl sm:text-[2.6rem]">{title}</h2>
      {description ? (
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted">{description}</p>
      ) : null}
    </div>
  );
}
