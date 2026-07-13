import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { prisma } from "@/lib/db";
import { Play } from "lucide-react";

export const metadata: Metadata = {
  title: "Assembly Videos",
  description:
    "Step-by-step assembly videos for the Apt.Bed, managed from the admin panel.",
};

// Videos are admin-managed, so render on demand from the database.
export const dynamic = "force-dynamic";

export default async function AssemblyPage() {
  const videos = await prisma.video.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <>
      <PageHeader
        eyebrow="Support"
        title="Assembly videos"
        description="Follow along at your own pace. Your Apt.Bed ships with printed instructions and these step-by-step videos."
      />
      <div className="container py-14">
        {videos.length === 0 ? (
          <div className="card p-10 text-center">
            <Badge tone="neutral">Coming soon</Badge>
            <p className="mt-3 text-sm text-muted">
              Assembly videos will be published here shortly — they&apos;re uploaded and
              managed from the admin panel.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((v, i) => (
              <div key={v.id} className="group card overflow-hidden">
                <div className="relative aspect-video bg-black">
                  {v.provider === "file" ? (
                    <video
                      src={v.url}
                      title={v.title}
                      controls
                      preload="metadata"
                      className="absolute inset-0 h-full w-full object-contain"
                    />
                  ) : (
                    <iframe
                      src={v.url}
                      title={v.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 h-full w-full"
                    />
                  )}
                  <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-brand-red px-2.5 py-1 text-xs font-medium text-white">
                    <Play className="h-3 w-3 fill-current" /> Step {i + 1}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-medium text-ink">{v.title}</h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
