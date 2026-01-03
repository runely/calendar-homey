export const convertToMinutes = (value: number, type: undefined | '1' | '2' | '3' | '4'): number => {
  // set type to default be Minutes
  if (type === undefined) {
    type = '1';
  }

  // minutes
  if (type === '1') {
    return value;
  }

  // hours
  if (type === '2') {
    return value * 60;
  }

  // days
  if (type === '3') {
    return value * 1440; // (60 * 24)
  }

  // weeks
  if (type === '4') {
    return value * 10080; // (60 * 24 * 7)
  }

  return value;
}
