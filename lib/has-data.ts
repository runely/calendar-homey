export function hasData<T>(data: T) {
  if (data === undefined || data === null) {
    return false;
  }

  if (typeof data === "string" && data.trim() === "") {
    return false;
  }

  if (Array.isArray(data) && data.length === 0) {
    return false;
  }

  return !(typeof data === "object" && Object.keys(data).length === 0);
}
