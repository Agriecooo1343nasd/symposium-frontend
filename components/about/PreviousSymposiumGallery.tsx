"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { GalleryImage, PreviousPresentation } from "@/lib/store";
import { useFileViewerOptional } from "@/components/file-viewer";

// ─── Lightbox ────────────────────────────────────────────────────────────────

function Lightbox({
    images,
    index,
    onClose,
    onPrev,
    onNext,
}: {
    images: GalleryImage[];
    index: number;
    onClose: () => void;
    onPrev: () => void;
    onNext: () => void;
}) {
    const img = images[index];
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={onClose}
        >
            {/* Close */}
            <button
                className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                onClick={onClose}
                aria-label="Close lightbox"
            >
                <X className="h-5 w-5" />
            </button>

            {/* Prev */}
            <button
                className="absolute left-4 text-white/80 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-30"
                onClick={(e) => { e.stopPropagation(); onPrev(); }}
                disabled={index === 0}
                aria-label="Previous image"
            >
                <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Image */}
            <div className="max-w-5xl max-h-[80vh] mx-16" onClick={(e) => e.stopPropagation()}>
                <img
                    src={img.src}
                    alt={img.caption}
                    className="max-h-[70vh] w-auto mx-auto rounded-xl object-contain shadow-2xl"
                />
                <div className="text-center mt-4 text-white/80 text-sm max-w-2xl mx-auto">
                    <p className="font-medium text-white">{img.caption}</p>
                    <p className="text-xs text-white/50 mt-1">{img.event} · {img.year}</p>
                </div>
                <div className="text-center mt-2 text-white/40 text-xs">
                    {index + 1} / {images.length}
                </div>
            </div>

            {/* Next */}
            <button
                className="absolute right-4 text-white/80 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-30"
                onClick={(e) => { e.stopPropagation(); onNext(); }}
                disabled={index === images.length - 1}
                aria-label="Next image"
            >
                <ChevronRight className="h-6 w-6" />
            </button>
        </div>
    );
}

function PresentationFileCard({ presentation: p }: { presentation: PreviousPresentation }) {
    const viewer = useFileViewerOptional();
    const canView = Boolean(p.fileUrl && p.fileUrl !== "#" && viewer);

    return (
        <button
            type="button"
            disabled={!canView}
            onClick={() => viewer?.openFile({ src: p.fileUrl, fileName: p.fileName })}
            className={cn(
                "group flex items-start gap-3 rounded-xl border border-border bg-card p-4 hover-lift hover:border-accent/50 transition-colors text-left w-full",
                !canView && "opacity-60 cursor-not-allowed",
            )}
        >
            <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                <FileText className="h-5 w-5 text-accent" />
            </div>
            <div className="min-w-0 flex-1">
                <div className="font-serif font-bold text-sm leading-snug line-clamp-2 group-hover:text-accent transition-colors">
                    {p.title}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{p.presenter}</div>
                <div className="text-[10px] text-muted-foreground/70 mt-1 font-mono truncate">{p.fileName}</div>
            </div>
            <Download className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors flex-shrink-0 mt-0.5" />
        </button>
    );
}

// ─── Gallery grid ─────────────────────────────────────────────────────────────

export function PreviousSymposiumGallery({
    images,
    presentations,
}: {
    images: GalleryImage[];
    presentations: PreviousPresentation[];
}) {
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [showAll, setShowAll] = useState(false);

    const visible = showAll ? images : images.slice(0, 8);

    const open = (i: number) => setLightboxIndex(i);
    const close = () => setLightboxIndex(null);
    const prev = () => setLightboxIndex((n) => (n !== null && n > 0 ? n - 1 : n));
    const next = () => setLightboxIndex((n) => (n !== null && n < images.length - 1 ? n + 1 : n));

    // keyboard nav
    const handleKey = (e: React.KeyboardEvent) => {
        if (lightboxIndex === null) return;
        if (e.key === "ArrowLeft") prev();
        if (e.key === "ArrowRight") next();
        if (e.key === "Escape") close();
    };

    return (
        <div onKeyDown={handleKey} tabIndex={-1} className="outline-none">
            {/* Photo Grid */}
            <div className="mb-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {visible.map((img, i) => (
                        <button
                            key={img.id}
                            onClick={() => open(i)}
                            className={cn(
                                "group relative rounded-xl overflow-hidden bg-secondary aspect-[4/3] hover-lift focus:outline-none focus:ring-2 focus:ring-accent",
                                // first photo spans 2 cols
                                i === 0 && "sm:col-span-2 sm:row-span-2 aspect-square"
                            )}
                            aria-label={`View photo: ${img.caption}`}
                        >
                            <img
                                src={img.src}
                                alt={img.caption}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                loading="lazy"
                            />
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            {/* Caption on hover */}
                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                <p className="text-white text-xs line-clamp-2 leading-tight">{img.caption}</p>
                            </div>
                        </button>
                    ))}
                </div>

                {images.length > 8 && (
                    <div className="text-center mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setShowAll((v) => !v)}
                            size="sm"
                        >
                            {showAll ? "Show less" : `View all ${images.length} photos`}
                        </Button>
                    </div>
                )}
            </div>

            {/* Presentations list */}
            {presentations.length > 0 && (
                <div>
                    <h3 className="font-serif text-xl font-bold mb-4">
                        Presentation slides from the 2nd NAS
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                        {presentations.map((p) => (
                            <PresentationFileCard key={p.id} presentation={p} />
                        ))}
                    </div>
                </div>
            )}

            {/* Lightbox */}
            {lightboxIndex !== null && (
                <Lightbox
                    images={images}
                    index={lightboxIndex}
                    onClose={close}
                    onPrev={prev}
                    onNext={next}
                />
            )}
        </div>
    );
}
