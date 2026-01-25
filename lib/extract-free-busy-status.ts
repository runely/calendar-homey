import type { VEvent } from "node-ical";

import type { BusyStatus } from "../types/IcalCalendar.type";

export const extractFreeBusyStatus = (event: VEvent): BusyStatus | undefined => {
  if ("MICROSOFT-CDO-BUSYSTATUS" in event) {
    return event["MICROSOFT-CDO-BUSYSTATUS"] as BusyStatus;
  }

  if ("X-MICROSOFT-CDO-BUSYSTATUS" in event) {
    return event["X-MICROSOFT-CDO-BUSYSTATUS"] as BusyStatus;
  }

  return undefined;
};
