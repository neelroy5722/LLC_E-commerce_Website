/** Standard hero band for secondary pages (legal, support, shipping). */
export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="border-b border-brand-blue/[0.07] bg-night2">
      <div className="container py-16 sm:py-20">
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <h1 className="display-hero mt-5 text-4xl sm:text-5xl">{title}</h1>
        {description ? (
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{description}</p>
        ) : null}
      </div>
    </section>
  );
}
