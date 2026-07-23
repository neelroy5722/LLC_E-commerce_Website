import Image from "next/image";
import { Video as VideoIcon, Trash2, UploadCloud, Star } from "lucide-react";
import { prisma } from "@/lib/db";
import { deleteVideoAction, deletePhotoAction } from "@/app/admin/actions";
import { VideoUploader } from "@/components/admin/VideoUploader";
import { PhotoUploader } from "@/components/admin/PhotoUploader";
import { SortSelect } from "@/components/admin/SortSelect";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const VIDEO_SORTS: Record<string, Prisma.VideoOrderByWithRelationInput> = {
  order: { sortOrder: "asc" },
  title: { title: "asc" },
  newest: { createdAt: "desc" },
  oldest: { createdAt: "asc" },
};

export default async function AdminMedia({ searchParams }: { searchParams: { vsort?: string } }) {
  const vsort = searchParams.vsort && VIDEO_SORTS[searchParams.vsort] ? searchParams.vsort : "order";
  const [videos, heroPhotos] = await Promise.all([
    prisma.video.findMany({ orderBy: VIDEO_SORTS[vsort] }),
    prisma.photo.findMany({ where: { role: "hero" }, orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-1 sm:px-4">
      <div>
        <h1 className="font-sans text-2xl font-bold text-ink">Videos &amp; Photos</h1>
        <p className="text-sm text-muted">Upload assembly videos and the first-screen photos shown on the homepage.</p>
      </div>

      {/* First-screen photos */}
      <div className="card p-6">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-brand-sky" />
          <h2 className="font-sans text-lg font-bold text-ink">First-screen photos</h2>
        </div>
        <p className="mt-1 text-sm text-muted">
          Upload one or several images. They flow as a rotating carousel on the homepage hero.
          {heroPhotos.length === 0 && " Until you add photos, the default illustration is shown."}
        </p>

        <div className="mt-5">
          <PhotoUploader
            role="hero"
            label="Upload first-screen photos"
            hint="Select multiple files at once. Landscape images (JPG/PNG/WebP, 12MB each) work best."
          />
        </div>

        {heroPhotos.length > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {heroPhotos.map((p, i) => (
              <div key={p.id} className="group relative aspect-[560/460] overflow-hidden rounded-xl border border-brand-blue/[0.08] bg-panel">
                <Image src={p.url} alt={p.alt ?? "First-screen photo"} fill sizes="240px" className="object-cover" unoptimized />
                <span className="absolute left-1.5 top-1.5 rounded-full bg-black/55 px-2 py-0.5 text-[11px] text-white/80">
                  {i + 1}
                </span>
                <form action={deletePhotoAction} className="absolute right-1.5 top-1.5">
                  <input type="hidden" name="id" value={p.id} />
                  <button
                    type="submit"
                    aria-label="Delete photo"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white/80 opacity-0 transition-opacity hover:text-brand-red-600 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assembly videos */}
      <div className="space-y-4">
        <h2 className="font-sans text-lg font-bold text-ink">Assembly videos</h2>
        <VideoUploader />
        <div className="card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-blue/[0.08] px-6 py-4">
            <h3 className="font-medium text-ink">Published videos</h3>
            <SortSelect
              paramKey="vsort"
              defaultValue="order"
              options={[
                { value: "order", label: "Manual order" },
                { value: "title", label: "Title A–Z" },
                { value: "newest", label: "Newest" },
                { value: "oldest", label: "Oldest" },
              ]}
            />
          </div>
          <ul className="divide-y divide-brand-blue/[0.08]">
            {videos.length === 0 && <li className="px-6 py-8 text-center text-muted">No videos yet.</li>}
            {videos.map((v) => (
              <li key={v.id} className="flex items-center justify-between gap-4 px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-14 items-center justify-center rounded-lg bg-brand-blue text-white">
                    {v.provider === "file" ? <UploadCloud className="h-5 w-5" /> : <VideoIcon className="h-5 w-5" />}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {v.title}
                      <span className="ml-2 rounded-full bg-brand-blue/[0.06] px-2 py-0.5 text-[11px] text-muted">
                        {v.provider === "file" ? "Uploaded" : "Embed"}
                      </span>
                    </p>
                    <p className="max-w-md truncate text-xs text-muted">{v.url}</p>
                  </div>
                </div>
                <form action={deleteVideoAction}>
                  <input type="hidden" name="id" value={v.id} />
                  <button type="submit" className="text-muted hover:text-brand-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
