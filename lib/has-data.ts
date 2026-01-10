import type { HasDataType } from "../types/IcalCalendar.type";

export function hasData(data: HasDataType): boolean {
  if (data === undefined || data === null) {
    return false;
  }

  if (typeof data === "string") {
    return true;
  }

  if (Array.isArray(data)) {
    return data.length > 0;
  }

  if (typeof data === "object") {
    return Object.keys(data).length > 0;
  }

  return ["boolean", "number"].includes(typeof data);
}
