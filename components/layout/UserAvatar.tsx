"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, isUsableImageSrc, speakerInitials } from "@/lib/utils";

type Props = {
  name: string;
  imageUrl?: string | null;
  className?: string;
  fallbackClassName?: string;
};

export function UserAvatar({ name, imageUrl, className, fallbackClassName }: Props) {
  const src = isUsableImageSrc(imageUrl) ? imageUrl!.trim() : undefined;
  const initials = speakerInitials(name || "?");

  return (
    <Avatar className={cn("shrink-0", className)}>
      {src ? <AvatarImage src={src} alt={name} className="object-cover" /> : null}
      <AvatarFallback className={cn("font-serif font-bold", fallbackClassName)}>{initials}</AvatarFallback>
    </Avatar>
  );
}
