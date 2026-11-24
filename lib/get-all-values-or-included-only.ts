import type { App } from "homey";
import type { CalendarComponent } from "node-ical";
import type { AppTests } from "../types/Homey.type.js";

export const getAllValuesOrIncludedOnly = (
  app: App | AppTests,
  values: (CalendarComponent | undefined)[],
  includeOnlyPattern: string
): (CalendarComponent | undefined)[] => {
  if (includeOnlyPattern.length === 0) {
    app.log(
      `getAllValuesOrIncludedOnly: Include only pattern is not configured '${includeOnlyPattern}'. Returning all events`
    );
    return values;
  }

  return values.filter((value: CalendarComponent | undefined) => {
    if (value === undefined || value.type !== "VEVENT") {
      return true;
    }

    if (value.description === undefined) {
      app.log(
        `[WARN] getAllValuesOrIncludedOnly: Include only pattern is configured '${includeOnlyPattern}' but 'description' is not present on ${value.uid} and will be skipped`
      );
      return false;
    }

    if (typeof value.description === "string") {
      return value.description.includes(includeOnlyPattern);
    }

    return value.description.val.includes(includeOnlyPattern);
  });
};
