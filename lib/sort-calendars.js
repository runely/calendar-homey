'use strict';

const sortEvents = require('./sort-events');

module.exports = calendars => {
  return calendars.map(calendar => {
    return { ...calendar, events: sortEvents(calendar.events) };
  });
};