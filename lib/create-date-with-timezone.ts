import type { DateWithTimeZone } from "node-ical";

export const createDateWithTimeZone = (date: Date, timezone: string | undefined): DateWithTimeZone => {
  return Object.defineProperty(date, "tz", {
    value: timezone,
    enumerable: false,
    configurable: true,
    writable: false
  }) as DateWithTimeZone;
};
