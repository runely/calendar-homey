'use strict';

const moment = require('moment');

module.exports = data => {
    let now = moment();
    let recurenceEnd = moment().add(2, 'months');
    let events = [];
    
    for (let k in data) {
        if (!data.hasOwnProperty(k)) {
            continue;
        }
        if (data[k].type !== 'VEVENT') {
            continue;
        }

        let event = data[k];

        // recurring event
        if (typeof event.rrule !== 'undefined') {
            // getting the set of start dates between now and recurenceEnd
            //      Include dates which falls on until date: true||false
            let dates = event.rrule.between(now.toDate(), recurenceEnd.toDate(), true);

            // the "dates" array contains the set of dates within our desired date range range that are valid
            // for the recurrence rule.  *However*, it's possible for us to have a specific recurrence that
            // had its date changed from outside the range to inside the range.  One way to handle this is
            // to add *all* recurrence override entries into the set of dates that we check, and then later
            // filter out any recurrences that don't actually belong within our range.
            if (event.recurrences != undefined) {
                for (var r in event.recurrences) {
                    // only add dates that weren't already in the range we added from the rrule so that 
                    // we don't double-add those events.
                    if (moment(new Date(r)).isBetween(now, recurenceEnd) != true) {
                        dates.push(new Date(r));
                    }
                }
            }

            dates.map(date => {
                let newEvent = { ...event };
                let duration = parseInt(moment(event.end).format('x')) - parseInt(moment(event.start).format('x'));
                let addEvent = true;
                let start = moment(date);

                // use just the date of the recurrence to look up overrides and exceptions (i.e. chop off time information)
                let dateLookupKey = date.toISOString().substring(0, 10);

                // for each date that we're checking, it's possible that there is a recurrence override for that one day.
                if ((newEvent.recurrences != undefined) && (newEvent.recurrences[dateLookupKey] != undefined)) {
                    // we found an override, so for this recurrence, use a potentially different title, start date, and duration.
                    newEvent = newEvent.recurrences[dateLookupKey];
                    start = moment(newEvent.start);
                    duration = parseInt(moment(newEvent.end).format('x')) - parseInt(moment(start).format('x'));
                }
                // if there's no recurrence override, check for an exception date. Exception dates represent exceptions to the rule.
                else if ((newEvent.exdate != undefined) && (newEvent.exdate[dateLookupKey] != undefined)) {
                    // this date is an exception date, which means we should skip it in the recurrence pattern.
                    addEvent = false;
                }

                if (addEvent) {
                    let end = moment(parseInt(start.format('x')) + duration, 'x');

                    if (end.isBefore(now) || start.isAfter(recurenceEnd)) {
                        addEvent = false;
                    }

                    if (addEvent) {
                        newEvent.start = start;
                        newEvent.end = end;
                        newEvent.uid = `${newEvent.uid}_${start.toDate().toISOString().substring(0, 10)}`;

                        events.push(newEvent);
                    }
                }
            });
        }
        else {
            // regular event
            let end = moment(event.end);

            if (now.diff(end, 'seconds') < 0) {
                events.push({ ...event, start: moment(event.start), end: moment(event.end) });
            }
        }
    }

    // remove unnecessary objects from events
    events = events.map(event => {
        delete event.rrule;
        if (event.exdate != undefined) {
            delete event.exdate;
        }
        delete event.recurrences;

        return event;
    });

    return events;
}