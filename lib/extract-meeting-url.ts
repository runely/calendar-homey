export const extractMeetingUrl = (description: string): string | undefined => {
  if (description.trim() === "") {
    return undefined;
  }

  const match: RegExpExecArray | null =
    /https?:\/\/teams.microsoft.com\/l\/meetup-join\/[^>]+|https?:\/\/\S[^\n]+/.exec(description);
  return match ? match[0] : undefined;
};
