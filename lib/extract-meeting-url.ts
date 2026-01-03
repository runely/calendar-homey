import type { VEvent } from "node-ical";

export const extractMeetingUrl = (event: VEvent): string | undefined => {
  if (event.description === "") {
    return undefined;
  }

  const match: RegExpExecArray | null =
    /https?:\/\/teams.microsoft.com\/l\/meetup-join\/[^>]+|https?:\/\/\S[^\n]+/.exec(event.description);
  return match ? match[0] : undefined;
};
