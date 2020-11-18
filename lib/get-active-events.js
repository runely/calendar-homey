'use strict';

const moment = require('moment');

module.exports = (data, eventLimit) => {
    let now = moment();
    let eventLimitStart = moment().startOf('day');
    let eventLimitEnd = moment().endOf('day').add(parseInt(eventLimit.value), eventLimit.type);
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
            // getting the set of start dates between eventLimitStart and eventLimitEnd
            //      Include dates which falls on until date: true||false
            let dates = event.rrule.between(eventLimitStart.toDate(), eventLimitEnd.toDate(), true);

            // the "dates" array contains the set of dates within our desired date range range that are valid
            // for the recurrence rule.  *However*, it's possible for us to have a specific recurrence that
            // had its date changed from outside the range to inside the range.  One way to handle this is
            // to add *all* recurrence override entries into the set of dates that we check, and then later
            // filter out any recurrences that don't actually belong within our range.
            if (event.recurrences != undefined) {
                for (var r in event.recurrences) {
                    // only add dates that weren't already in the range we added from the rrule so that 
                    // we don't double-add those events.
                    const rDate = new Date(r);
                    if (moment(rDate).isBetween(eventLimitStart, eventLimitEnd) === true) {
                        const existAlready = dates.filter(date => date === rDate);
                        if (!existAlready) {
                            dates.push(rDate);
                        }
                    }
                }
            }

            dates.map(date => {
                let newEvent = { ...event };
                let duration = parseInt(moment(event.end).format('x')) - parseInt(moment(event.start).format('x'));
                let addEvent = true;
                let offsetThis = date.getTimezoneOffset();
                // hacky wacky shitty thing that works and takes dst into account. Thanks to Mats!
                let start = moment(new Date(date.setHours(date.getHours() - ((event.start.getTimezoneOffset() - offsetThis) / 60))));

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

                    if (end.isBefore(now) || start.isAfter(eventLimitEnd)) {
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

            // only add event if end hasn't happend yet AND start is between eventLimitStart and eventLimitEnd
            if (now.diff(end, 'seconds') < 0 && moment(event.start).isBetween(eventLimitStart, eventLimitEnd) === true) {
                events.push({ ...event, start: moment(event.start), end });
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
