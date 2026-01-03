import type { Moment } from "moment";
import type { VEvent } from "node-ical";

import type { VariableManagementLocalJsonEvent } from "../types/VariableMgmt.type";

import { getMoment } from "./moment-datetime.js";

/*const durationUnits: { name: string, abbr: string }[] = [
  {
    name: 'weeks',
    abbr: 'W'
  },
  {
    name: 'days',
    abbr: 'D'
  },
  {
    name: 'hours',
    abbr: 'H'
  },
  {
    name: 'minutes',
    abbr: 'M'
  },
  {
    name: 'seconds',
    abbr: 'S'
  }
];

const getDurationUnit = (str, unit) => {
  const regex = new RegExp(`\\d+${unit}`, 'g')
  return str.search(regex) >= 0 ? Number.parseInt(str.substring(str.search(regex), str.indexOf(unit)), 10) : 0
}*/

/**
 * @typedef {import('moment').Moment} Moment
 */

/**
 * @param {Moment|import('node-ical').DateWithTimeZone} date
 * @param {string} [timezone]
 *
 * @returns {Moment}
 */
/*const getMoment = (date, timezone) => {
  if (timezone) {
    return moment({ timezone, date })
  }
  return moment({ date })
}*/

export const findRegularEventEnd = (event: VEvent, timezone?: string): Moment => {
  console.log("findRegularEventEnd: Not yet implemented, returning end date as end date", event.end, timezone);
  return getMoment({ date: event.end.toISOString(), timezone });
  /*if (event.end) {
    return event.skipTZ ? getMoment(event.end) : getMoment(event.end, timezone)
  }
  if (event.dateType && event.dateType === 'date' && (!event.duration || typeof event.duration !== 'string')) {
    return event.skipTZ ? getMoment(event.start).add(1, 'day') : getMoment(event.start, timezone).add(1, 'day')
  }
  if (event.dateType && event.dateType === 'date-time') {
    return event.skipTZ ? getMoment(event.start) : getMoment(event.start, timezone)
  }

  let end = event.skipTZ ? getMoment(event.start) : getMoment(event.start, timezone)
  durationUnits.forEach((unit) => {
    const durationUnit = getDurationUnit(event.duration, unit.abbr)
    end = event.duration.startsWith('-') ? end.subtract(durationUnit, unit.name) : end.add(durationUnit, unit.name)
  })
  return end*/
};

export const findRegularLocalEventEnd = (event: VariableManagementLocalJsonEvent, timezone?: string): Moment => {
  console.log("findRegularLocalEventEnd: Not yet implemented, returning end date as end date", event.end, timezone);
  return getMoment({ date: event.end, timezone });
};
