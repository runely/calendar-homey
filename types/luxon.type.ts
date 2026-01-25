import type { App } from "homey";
import type { DateWithTimeZone } from "node-ical";

import type { AppTests } from "./Homey.type";

export type GetDateTimeOptions = {
  app: App | AppTests;
  dateWithTimeZone: DateWithTimeZone;
  localTimeZone: string;
  fullDayEvent: boolean;
  keepOriginalZonedTime: boolean;
  quiet: boolean;
};
