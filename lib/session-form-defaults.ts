import type { VenueRoomDto } from "@/lib/api/dto";
import { SUB_THEMES, type Session } from "@/lib/mock-data";
import { getRooms } from "@/lib/platform-settings";
import { uid } from "@/lib/store";

export function buildEmptySession(day: 1 | 2 = 1, apiRooms?: VenueRoomDto[]): Session {
  const fallbackRooms = getRooms();
  const firstApi = apiRooms?.[0];
  const firstFallback = fallbackRooms[0];

  return {
    id: uid("ss"),
    day,
    start: "09:00",
    end: "10:00",
    title: "",
    type: "Plenary",
    room: firstApi?.name ?? firstFallback?.name ?? "TBD",
    subTheme: SUB_THEMES[0],
    speakers: [],
    description: "",
    longDescription: "",
    learningObjectives: [""],
    capacity: firstApi?.capacity ?? firstFallback?.capacity ?? 100,
    visibility: "public",
  };
}
