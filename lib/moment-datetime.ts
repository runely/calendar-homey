import type { Moment } from "moment";
import moment from "moment-timezone";

import type { MomentDateTimeOptions } from "../types/Options.type";

// TODO: Needs to be replaced with luxon
export const getMoment = (options: MomentDateTimeOptions = {}): Moment => {
  const { timezone, date, format } = options;
  if (timezone) {
    if (format) {
      return moment.tz(date || new Date().toISOString(), format, timezone);
    }

    return moment.tz(date || new Date().toISOString(), timezone);
  }

  if (format) {
    return moment(date || new Date().toISOString(), format);
  }

  return moment(date || new Date().toISOString());
};

// TODO: Needs to be replaced with luxon
export const getMomentNow = (timezone: string): { momentNowRegular: Moment; momentNowUtcOffset: Moment } => {
  const momentNowRegular: Moment = getMoment({ timezone });
  const momentNowUtcOffset: Moment = getMoment().add(momentNowRegular.utcOffset(), "minutes");

  return {
    momentNowRegular,
    momentNowUtcOffset
  };
};
