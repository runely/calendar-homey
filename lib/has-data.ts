import { DateTime } from "luxon";

import type { HasDataType } from "../types/IcalCalendar.type";

export const hasData = (data: HasDataType): boolean => {
  if (data === undefined || data === null) {
    return false;
  }

  if (typeof data === "string") {
    return true;
  }

  if (Array.isArray(data)) {
    return data.length > 0;
  }

  if (data instanceof Date) {
    return true;
  }

  if (DateTime.isDateTime(data)) {
    return true;
  }

  if (typeof data === "object") {
    return Object.keys(data).length > 0;
  }

  return ["boolean", "number"].includes(typeof data);
};
