import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Configurator } from "@/components/product/Configurator";
import { INCLUDED_PIECES } from "@/lib/site";
import { BedDouble, Shirt, Laptop, Archive, Lamp, Plug } from "lucide-react";

export const metadata: Metadata = {
  title: "Find Your Bed",
  description:
    "Find your Apt.Bed: choose Twin/Twin Long, Queen, or King, pick a Medium or High deck, and select a finish. Live price and preview for every combination.",
};

const PIECES = [
  ...INCLUDED_PIECES,
  { name: "Electrical", desc: "Electrical availability for all your devices." },
];
const pieceIcons = [BedDouble, Shirt, Laptop, Archive, Lamp, Plug];

export default function ProductPage() {
  return (
    <>
      {/* One unit, five pieces — at the top of the page */}
      <Section className="bg-night2">
        <SectionHeading
          eyebrow="One unit, five pieces"
          title="Everything a bedroom needs, in the footprint of a bed"
          description="Every Apt.Bed includes all five pieces in a single frame — plus electrical for all your devices."
        />
        <div className="mx-auto mt-12 grid max-w-4xl gap-x-10 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
          {PIECES.map((piece, i) => {
            const Icon = pieceIcons[i];
            return (
              <div key={piece.name} className="flex items-start gap-3.5 text-left">
                <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-red/10 text-brand-red-700">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-semibold text-ink">{piece.name}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{piece.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Configurator */}
      <Section className="bg-panel">
        <Configurator />
      </Section>
    </>
  );
}
