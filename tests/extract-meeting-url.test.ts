import { extractMeetingUrl } from "../lib/extract-meeting-url.js";

type MeetingTest = {
  name: string;
  description: string;
  url: string;
};

const meetingTests: MeetingTest[] = [
  {
    name: "MicrosoftTeams",
    description:
      "Hello!\n\nHeres the meeting url you asked for.\n________________________________________________________________________________\nMicrosoft Teams meeting\nJoin from computer, mobile app or room device\nClick here to join<https://teams.microsoft.com/l/meetup-join/19%3ameeting_12345678909876543212345678909876543212345678909%40thread.v2/0?context=%4c%33gas%22%3a%3456789012-1234-1234-1234-13f7b567788c9%22%2c%22Oid%22%3a%6554321678-1234-5678-9012-123456789012%22%7d>\nMøte-ID: 111 111 111 111\nPassord: 5bygmt\nLast nedTeams<https://www.microsoft.com/en-us/microsoft-teams/download-app> | Join on the web<https://www.microsoft.com/microsoft-teams/join-a-meeting>\nFinn ut mer<https://aka.ms/JoinTeamsMeeting> | Møtealternativer<https://teams.microsoft.com/meetingOptions/?organizerId=12345678-1234-1234-1234-123456789098&tenantId=12345678-1234-1234-1234-123456789098&threadId=45_meeting_dfgkYmMertQtYytreMi00MTertgLThiYmItZGZtghydfgfgJiMWQ4@thread.v2&messageId=0&language=nb-NO>\n________________________________________________________________________________\n\n",
    url: "https://teams.microsoft.com/l/meetup-join/19%3ameeting_12345678909876543212345678909876543212345678909%40thread.v2/0?context=%4c%33gas%22%3a%3456789012-1234-1234-1234-13f7b567788c9%22%2c%22Oid%22%3a%6554321678-1234-5678-9012-123456789012%22%7d"
  },
  {
    name: "AppleFaceTime",
    description:
      "----( Videoanrop )----\n[FaceTime]\nhttps://facetime.apple.com/join#v=1&p=12345678909+1234567890&k=1234567890987654321234567890987654321234567\n---===---",
    url: "https://facetime.apple.com/join#v=1&p=12345678909+1234567890&k=1234567890987654321234567890987654321234567"
  },
  {
    name: "GoogleMeet",
    description: "----( Video meeting )----\nhttp://meet.google.com/123-4567-890\n---===---",
    url: "http://meet.google.com/123-4567-890"
  },
  {
    name: "Zoom",
    description:
      "----( Videogesprek )----\nhttps://us06web.zoom.us/j/1234567890?pwd=12345678909876543212345\n---===---",
    url: "https://us06web.zoom.us/j/1234567890?pwd=12345678909876543212345"
  }
];

describe("'undefined' is returned when", () => {
  test("an empty string is passed in", () => {
    const result: string | undefined = extractMeetingUrl("");
    expect(result).toBeUndefined();
  });

  test("'undefined' is passed in", () => {
    const result: string | undefined = extractMeetingUrl(undefined);
    expect(result).toBeUndefined();
  });

  test("a string without a meeting url is passed in", () => {
    const result: string | undefined = extractMeetingUrl("Welcome to the meeting. There is no link here.");
    expect(result).toBeUndefined();
  });
});

describe("meeting url found when", () => {
  meetingTests.forEach(({ name, description, url }: MeetingTest) => {
    test(`string with ${name} url is present`, () => {
      const result: string | undefined = extractMeetingUrl(description);
      expect(result).toBe(url);
    });
  });
});
