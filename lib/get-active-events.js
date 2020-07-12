'use strict';

const moment = require('moment');
const { RRule, RRuleSet, rrulestr } = require('rrule');
const getDateTimeString = require('./date-to-stamp');

module.exports = events => {
    let now = moment();
    let mockUntilDateTime = '21000101T000000Z';
    let recurringUntilDateTime = moment().add(2, 'months');
    let newEvents = [];
    
    events.map(event => {
        let stop = moment(event.DTEND_TIMESTAMP || event.DTEND_DATE);

        if (event.RRULE) {
            let recurringStr = `DTSTART:${event.DTSTART_TIMESTAMP || event.DTSTART_DATE}\nRRULE:${event.RRULE}`
            if (!recurringStr.includes('UNTIL')) {
                recurringStr += `;UNTIL=${mockUntilDateTime}`;
            }
            if (event.RDATE) {
                let rDateStr = '';
                event.RDATE.map(date => rDateStr += (rDateStr === '' ? `\nRDATE:${date}` : `,${date}`));
                recurringStr += rDateStr;
            }
            if (event.EXRULE) {
                recurringStr += `\nEXRULE:${event.EXRULE}`;
            }
            if (event.EXDATE) {
                let exDateStr = '';
                event.EXDATE.map(date => exDateStr += (exDateStr === '' ? `\nEXDATE:${date}` : `,${date}`));
                recurringStr += exDateStr;
            }
            let recurringRule = rrulestr(recurringStr);
            let recurringDates = recurringRule.between(now.toDate(), recurringUntilDateTime.toDate());
            let recurringEventId = 1;
            recurringDates.map(date => {
                if (event.DTSTART_TIMESTAMP) {
                    let startString = getDateTimeString(date);
                    let stopString = getDateTimeString(moment(date).set('hour', stop.get('hours')).set('minute', stop.get('minutes')).set('second', stop.get('seconds')).toDate(), true);
                    //console.log(`get-active-events: Recurring event '${event.SUMMARY}' -- '${startString}' -- '${stopString}'`);
                    let newEvent = { ...event, DTSTART_TIMESTAMP: startString, DTEND_TIMESTAMP: stopString, UID: (event.UID + '_rr' + recurringEventId++) };
                    delete newEvent.EXDATE;
                    newEvents.push(newEvent);
                }
                else if (event.DTSTART_DATE) {
                    let startString = getDateTimeString(date, false, true);
                    let stopString = getDateTimeString(moment(date).add(1, 'day').toDate(), false, true);
                    //console.log(`get-active-events: Recurring event '${event.SUMMARY}' -- '${startString}' -- '${stopString}'`);
                    let newEvent = { ...event, DTSTART_DATE: startString, DTEND_DATE: stopString, UID: (event.UID + '_rr' + recurringEventId++) };
                    delete newEvent.EXDATE;
                    newEvents.push(newEvent);
                }
                else {
                    console.log("get-active-events: Huh?????", event);
                }
            });
        }
        else {
            if (now.diff(stop, 'seconds') < 0) {
                //console.log(`get-active-events: Event '${event.SUMMARY}' -- '${event.DTSTART_TIMESTAMP || event.DTSTART_DATE}' -- '${event.DTEND_TIMESTAMP || event.DTEND_DATE}'`);
                newEvents.push(event);
            }
        }
    });

    return newEvents;
}