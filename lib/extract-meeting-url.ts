export const extractMeetingUrl = (description: string | undefined): string | undefined => {
  if (!description || description.trim() === "") {
    return undefined;
  }

  const match: RegExpExecArray | null =
    /https?:\/\/teams.microsoft.com\/l\/meetup-join\/[^>]+|https?:\/\/\S[^\n]+/.exec(description);
  return match ? match[0] : undefined;
};
