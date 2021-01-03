'use strict';

module.exports = (calendars, name) => {
  return calendars.filter(calendar => (calendar.name.toLowerCase().includes(name.toLowerCase())));
};