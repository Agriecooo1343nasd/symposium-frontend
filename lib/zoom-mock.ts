export type ZoomMeeting = {
  id: string;
  title: string;
  meetingId: string;
  joinUrl: string;
  passcode: string;
  hostKey: string;
  status: "scheduled" | "live" | "ended";
  runOfShowItemId?: string;
  createdAt: string;
};

function randomId(len = 10) {
  return Math.random().toString(36).slice(2, 2 + len);
}

export function createZoomMeeting(title: string, runOfShowItemId?: string): ZoomMeeting {
  const meetingId = `${Math.floor(100000000 + Math.random() * 900000000)}`;
  const passcode = String(Math.floor(100000 + Math.random() * 900000));
  return {
    id: `zm-${randomId(8)}`,
    title,
    meetingId,
    joinUrl: `https://zoom.us/j/${meetingId}?pwd=${passcode}`,
    passcode,
    hostKey: randomId(6).toUpperCase(),
    status: "scheduled",
    runOfShowItemId,
    createdAt: new Date().toISOString(),
  };
}
