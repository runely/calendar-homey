import { DateTime, type DateTimeMaybeValid, type ZoneOptions } from "luxon";

import type { GetDateTimeOptions } from "../types/luxon.type";

export function getZonedDateTime(
  dateTime: DateTime<true> | DateTime<false>,
  timezone: string,
  options?: ZoneOptions
): DateTime<true> {
  if (!dateTime.isValid) {
    throw new Error(`getZonedDateTime: Invalid DateTime object. Cannot set zone. Reason: ${dateTime.invalidReason}`);
  }

  const zonedDateTime: DateTimeMaybeValid = dateTime.setZone(timezone, options);
  if (!zonedDateTime.isValid) {
    throw new Error(`getZonedDateTime: Failed to set zone '${timezone}'. Reason: ${zonedDateTime.invalidReason}`);
  }

  return zonedDateTime as DateTime<true>;
}

export function getDateTime(options: GetDateTimeOptions): DateTime<true> | null {
  try {
    const isoString: string = options.dateWithTimeZone.toISOString().slice(0, -5);

    if (options.fullDayEvent) {
      const fullDayCalDate: DateTimeMaybeValid = DateTime.fromJSDate(options.dateWithTimeZone, { zone: "utc" })
        .setZone(options.localTimeZone, { keepLocalTime: true })
        .startOf("day");
      if (!options.quiet) {
        options.app.log(
          `getDateTime: FULL-DAY - original dateWithTimeZone: '${options.dateWithTimeZone.toISOString()}' ::  dateWithTimezone: '${isoString}' (tz: '${options.dateWithTimeZone.tz}') => fullDayCalDate: '${fullDayCalDate.toISO()}' (tz: '${options.localTimeZone}')`
        );
      }

      return fullDayCalDate as DateTime<true>;
    }

    if (!options.dateWithTimeZone.tz) {
      const localTzCalDate: DateTimeMaybeValid = DateTime.fromFormat(isoString, "yyyy-MM-dd'T'HH:mm:ss", {
        zone: options.localTimeZone
      });
      if (!options.quiet) {
        options.app.log(
          `getDateTime: NON-TZ - original dateWithTimeZone: '${options.dateWithTimeZone.toISOString()}' ::  dateWithTimezone: '${isoString}' (tz: '${options.dateWithTimeZone.tz}') => localTzCalDate: '${localTzCalDate.toISO()}' (tz: '${options.localTimeZone}')`
        );
      }

      return localTzCalDate as DateTime<true>;
    }

    if (!options.keepOriginalZonedTime) {
      const calDate: DateTimeMaybeValid = DateTime.fromFormat(isoString, "yyyy-MM-dd'T'HH:mm:ss", {
        zone: options.dateWithTimeZone.tz
      });
      const localCalDate: DateTimeMaybeValid = calDate.setZone(options.localTimeZone);
      if (!options.quiet) {
        options.app.log(
          `getDateTime: TZ - original dateWithTimeZone: '${options.dateWithTimeZone.toISOString()}' :: dateWithTimezone: '${isoString}' (tz: '${options.dateWithTimeZone.tz}') => calDate: '${calDate}' => localDate: '${localCalDate.toISO()}' (tz: '${options.localTimeZone}')`
        );
      }

      return localCalDate as DateTime<true>;
    }

    const originalZonedCalDate: DateTimeMaybeValid = DateTime.fromJSDate(options.dateWithTimeZone, {
      zone: options.dateWithTimeZone.tz
    });
    const originalZonedLocalCalDate: DateTimeMaybeValid = originalZonedCalDate.setZone(options.localTimeZone);
    if (!options.quiet) {
      options.app.log(
        `getDateTime: TZ - original dateWithTimeZone: '${options.dateWithTimeZone.toISOString()}' :: dateWithTimezone: '${isoString}' (tz: '${options.dateWithTimeZone.tz}') => originalZonedCalDate: '${originalZonedCalDate}' => originalZonedLocalCalDate: '${originalZonedLocalCalDate.toISO()}' (tz: '${options.localTimeZone}')`
      );
    }

    return originalZonedLocalCalDate as DateTime<true>;
  } catch (error) {
    options.app.error(
      `[ERROR] - getDateTime - Failed to get DateTime from dateWithTimeZone: ${options.dateWithTimeZone}, LocalTimeZone: ${options.localTimeZone}, KeepOriginalZonedTime: ${options.keepOriginalZonedTime}, FullDayEvent: ${options.fullDayEvent} : `,
      error
    );

    return null;
  }
}
