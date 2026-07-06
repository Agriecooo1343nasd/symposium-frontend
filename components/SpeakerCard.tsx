import type { Speaker } from "@/lib/mock-data";
import { cn, speakerInitials, speakerPhotoSrc } from "@/lib/utils";

export function SpeakerCard({ speaker }: { speaker: Speaker }) {
  const photo = speakerPhotoSrc(speaker.photo);
  const sessions = Array.isArray(speaker.sessions) ? speaker.sessions : [];

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-card border border-border hover-lift">
      <div className="aspect-[4/5] overflow-hidden bg-secondary relative">
        {photo ? (
          <img
            src={photo}
            alt={speaker.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center bg-gradient-to-br from-navy/90 to-navy/60 text-white"
            aria-hidden
          >
            <span className="font-serif text-4xl font-bold opacity-90">{speakerInitials(speaker.name)}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/30 to-transparent opacity-80" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <div className="flex items-center gap-2 text-xs opacity-90 mb-1">
          <span>{speaker.flag}</span>
          <span>{speaker.country}</span>
        </div>
        <h3 className="font-serif font-bold text-lg leading-tight">{speaker.name}</h3>
        <p className="text-xs opacity-90 mt-0.5">{speaker.title}</p>
        <p className="text-xs opacity-75">{speaker.org}</p>
        {sessions.length > 0 && (
          <div className="overflow-hidden max-h-0 group-hover:max-h-32 transition-all duration-300 mt-2">
            <p className="text-xs text-gold font-semibold pt-2 border-t border-white/20">
              {sessions.join(" · ")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
