import type { App } from "homey";
import { icsFilter } from "ics-filter";
import { DateTime, Duration } from "luxon";

import { getFallbackUri } from "../lib/get-fallback-uri";

import type { FallbackUri } from "../types/IcalCalendar.type";
import type { SettingEventLimit } from "../types/VariableMgmt.type";

export const getFilteredIcsContent = async (app: App, url: string, eventLimit: SettingEventLimit): Promise<string> => {
  const icsContent: string = await getIcsContent(app, url);
  app.log(`getFilteredIcsContent: Raw ics content length: ${icsContent.length}`);

  const now: DateTime<true> = DateTime.now().startOf("day");

  const eventLimitEnd: DateTime<true> = DateTime.now()
    .endOf("day")
    .plus(Duration.fromObject({ [eventLimit.type]: eventLimit.value }));

  app.log(
    `getFilteredIcsContent: Filtering events starting from '${now.toFormat("dd.MM.yyyy HH:mm:ss")}' until '${eventLimitEnd.toFormat("dd.MM.yyyy HH:mm:ss")}'`
  );
  const filteredIcsContent: string = icsFilter(icsContent, now.toJSDate(), eventLimitEnd.toJSDate());
  app.log(`getFilteredIcsContent: Filtered ics content length: ${filteredIcsContent.length}`);

  return filteredIcsContent;
};

const getIcsContent = async (app: App, url: string): Promise<string> => {
  try {
    return await getIcsContentByUrl(app, url);
  } catch {
    const fallbackUri: FallbackUri = getFallbackUri(app, url);

    app.log(`[WARN] getIcsContent: Getting events with fallback uri: '${fallbackUri}'`);
    return await getIcsContentByUrl(app, fallbackUri.fallbackUri);
  }
};

const getIcsContentByUrl = async (app: App, url: string): Promise<string> => {
  const response: Response = await fetch(url, {
    method: "GET"
  });

  if (!response.ok) {
    const errorMessage: string = await response.text();
    app.error(
      `[ERROR] - getIcsContentByUrl: Failed to fetch ICS content. Status: ${response.status}, StatusText: '${response.statusText}'. ErrorMessage: ${errorMessage}`
    );
    throw new Error(`Failed to fetch ICS content. Status: ${response.status}, StatusText: '${response.statusText}'`);
  }

  return response.text();
};
