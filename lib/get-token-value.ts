export const getTokenValue = (value: undefined | string): string => {
  if (
    !value ||
    value === "" ||
    value === " " ||
    value === "\n" ||
    value === "\\n" ||
    value === "\n " ||
    value === "\\n " ||
    value === "\r" ||
    value === "\\r" ||
    value === "\r " ||
    value === "\\r " ||
    value === "\r\n" ||
    value === "\\r\\n" ||
    value === "\r\n " ||
    value === "\\r\\n " ||
    value === "\n\r" ||
    value === "\\n\\r" ||
    value === "\n\r " ||
    value === "\\n\\r "
  ) {
    return "";
  }

  return value;
};
