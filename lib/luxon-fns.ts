import type { App } from "homey";
import { DateTime, type DateTimeMaybeValid, type ZoneOptions } from "luxon";

import type { AppTests } from "../types/Homey.type";

export const getZonedDateTime = (
  dateTime: DateTime<true> | DateTime<false>,
  timezone: string,
  options?: ZoneOptions
): DateTime<true> => {
  if (!dateTime.isValid) {
    throw new Error(`getZonedDateTime: Invalid DateTime object. Cannot set zone. Reason: ${dateTime.invalidReason}`);
  }

  const zonedDateTime: DateTimeMaybeValid = dateTime.setZone(timezone, options);
  if (!zonedDateTime.isValid) {
    throw new Error(`getZonedDateTime: Failed to set zone '${timezone}'. Reason: ${zonedDateTime.invalidReason}`);
  }

  return zonedDateTime as DateTime<true>;
};

export const getDateTime = (
  app: App | AppTests,
  date: Date,
  timezone: string | undefined,
  localTimezone: string,
  fullDayEvent: boolean,
  quiet: boolean
): DateTime<true> | null => {
  try {
    if (fullDayEvent) {
      /*
        - FullDayRegular: node-ical gir tilbake start i UTC ferdig konvertert. Lokal tiddsone må settes på etterpå uten konvertering
        - FullDayRecurring: node-ical gir tilbake instance (fra between) i UTC ferdig konvertert. Lokal tiddsone må settes på etterpå uten konvertering
      */
      const fullDayDateTime: DateTimeMaybeValid = DateTime.fromJSDate(date, { zone: "utc" }).setZone(localTimezone, {
        keepLocalTime: true
      });
      if (!fullDayDateTime.isValid) {
        app.error(
          `[ERROR] - getDateTime: FULL-DAY :: Invalid DateTime generated :: Date: '${date}' :: Timezone: 'utc' :: LocalTimezone: '${localTimezone}' :: FullDayEvent: ${fullDayEvent} -> Reason: ${fullDayDateTime.invalidReason}`
        );
        return null;
      }

      if (!quiet) {
        app.log(
          `getDateTime: FULL-DAY :: Date: '${date}' :: Timezone: 'utc' :: LocalTimezone: '${localTimezone}' => fullDayDateTime: '${fullDayDateTime.toISO()}' (tz: '${fullDayDateTime.zoneName}')`
        );
      }

      return fullDayDateTime as DateTime<true>;
    }

    /*
      "Exchange" / "iCloud" / "Probably any other calendar provider" that stores TZID on the DTSTART - which means that the value in DTSTART is already stored in that timezone
      - Regular: node-ical gir tilbake start i UTC og fromJSDate må bruke tz fra event.start. Lokal tidssone settes på etterpå (setZone)
      - Recurring: node-ical gir tilbake instance (fra between) i UTC og fromJSDate må bruke tz fra event.start (IKKE fra instance da den er undefined). Lokal tidssone kan så settes på etterpå (setZone)

      Google Calendar / Probably any other calendar provider that stores UTC on the DTSTART - which means that the value in DTSTART is in UTC
      - Regular: node-ical gir tilbake start i UTC og fromJSDate må bruke lokal tz HVIS event.start.tz er undefined eller er UTC/Etc. Lokal tidssone settes på etterpå (setZone)
      - Recurring: node-ical gir tilbake instance (fra between) i UTC og fromJSDate må bruke lokal tz HVIS event.start.tz er undefined eller er UTC/Etc. Lokal tidssone kan settes på etterpå (setZone). Er det samme som ble brukt ved konvertering er det ingen endring
    */

    const usedTimezone: string = timezone || "utc";
    const dateTime: DateTimeMaybeValid = DateTime.fromJSDate(date, { zone: usedTimezone }).setZone(localTimezone);
    if (!dateTime.isValid) {
      app.error(
        `[ERROR] - getDateTime: Invalid DateTime generated :: Date: '${date}' :: Timezone: '${usedTimezone}' :: LocalTimezone: '${localTimezone}' :: FullDayEvent: ${fullDayEvent} -> Reason: ${dateTime.invalidReason}`
      );
      return null;
    }

    if (!quiet) {
      app.log(
        `getDateTime: Date: '${date}' :: Timezone: '${usedTimezone}' :: LocalTimezone: '${localTimezone}' :: FullDayEvent: ${fullDayEvent} => dateTime: '${dateTime.toISO()}' (tz: '${dateTime.zoneName}')`
      );
    }

    return dateTime as DateTime<true>;
  } catch (error) {
    app.error(
      `[ERROR] - getDateTime: Failed to get DateTime. Date: ${date} :: Timezone: '${timezone}' :: LocalTimezone: ${localTimezone} :: FullDayEvent: ${fullDayEvent} ->`,
      error
    );

    return null;
  }
};

export const getLocalEventDateTime = (
  app: App | AppTests,
  date: Date,
  timezone: string | undefined,
  localTimezone: string,
  applyTimezone: boolean,
  quiet: boolean
): DateTime<true> | null => {
  try {
    const zonedCalDate: DateTimeMaybeValid = DateTime.fromJSDate(date, {
      zone: timezone
    }).setZone(localTimezone, { keepLocalTime: !applyTimezone });
    if (!quiet) {
      app.log(
        `getLocalEventDateTime: Date: '${date}' :: Timezone: '${timezone}' :: LocalTimezone: '${localTimezone}' :: ApplyTimezone: ${applyTimezone} => dateTime: '${zonedCalDate.toISO()}' (tz: '${zonedCalDate.zoneName}')`
      );
    }

    return zonedCalDate as DateTime<true>;
  } catch (error) {
    app.error(
      `[ERROR] - getLocalEventDateTime: Failed to get DateTime. Date: ${date} :: Timezone: '${timezone}' :: LocalTimezone: ${localTimezone} :: ApplyTimezone: ${applyTimezone} ->`,
      error
    );

    return null;
  }
};
