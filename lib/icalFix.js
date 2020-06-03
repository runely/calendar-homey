'use strict';

module.exports = (ical) => {
    // remove BEGIN:VCALENDAR->BEGIN:VEVENT and END:VCALENDAR
    if (ical.startsWith("BEGIN:VCALENDAR")) {
        const findString = "BEGIN:VEVENT";
        const startIndex = ical.indexOf(findString);
        const stripped = ical.substr(startIndex, (ical.length - startIndex)).replace("END:VCALENDAR\r\n", "").replace("END:VCALENDAR\r", "").replace("END:VCALENDAR\n", "");
        ical = stripped;
    }

    //
    // ****************************************** TIMEZONE ******************************************
    //

    // replace "DTSTART;TZID=*"
    ical = ical.replace(/(DTSTART;TZID=.+?:)/g, "DTSTART_TIMESTAMP:");

    // replace "DTSTART;VALUE=DATE"
    ical = ical.replace(/DTSTART;VALUE=DATE/g, "DTSTART_DATE");

    // replace "DTEND;TZID=.+:"
    ical = ical.replace(/(DTEND;TZID=.+?:)/g, "DTEND_TIMESTAMP:");

    // replace "DTEND;VALUE=DATE"
    ical = ical.replace(/(DTEND;VALUE=DATE)/g, "DTEND_DATE");

    // replace "EXDATE;TZID=.+:"
    ical = ical.replace(/(EXDATE;TZID=.+?:)/g, "EXDATE:");

    // replace DTSTART:
    ical = ical.replace(/(DTSTART:)/g, "DTSTART_TIMESTAMP:");

    // replace DTEND:
    ical = ical.replace(/(DTEND:)/g, "DTEND_TIMESTAMP:");

    // replace "RECURRENCE-ID;TZID=.+:"
    ical = ical.replace(/(RECURRENCE-ID;TZID=.+?:)/g, "RECURRENCE_ID:");

    //
    // ****************************************** Exchange Online ******************************************
    //
    
    // replace 'X-MICROSOFT-CDO-APPT-SEQUENCE'
    var exoEvent = "X-MICROSOFT-CDO-APPT-SEQUENCE";
    do {
        ical = ical.replace(exoEvent, "EXO_APPT_SEQUENCE");
    } while (ical.includes(exoEvent))

    // replace 'X-MICROSOFT-CDO-BUSYSTATUS'
    exoEvent = "X-MICROSOFT-CDO-BUSYSTATUS";
    do {
        ical = ical.replace(exoEvent, "EXO_BUSYSTATUS");
    } while (ical.includes(exoEvent))

    // replace 'X-MICROSOFT-CDO-INTENDEDSTATUS'
    exoEvent = "X-MICROSOFT-CDO-INTENDEDSTATUS";
    do {
        ical = ical.replace(exoEvent, "EXO_INTENDEDSTATUS");
    } while (ical.includes(exoEvent))

    // replace 'X-MICROSOFT-CDO-ALLDAYEVENT'
    exoEvent = "X-MICROSOFT-CDO-ALLDAYEVENT";
    do {
        ical = ical.replace(exoEvent, "EXO_ALLDAYEVENT");
    } while (ical.includes(exoEvent))

    // replace 'X-MICROSOFT-CDO-IMPORTANCE'
    exoEvent = "X-MICROSOFT-CDO-IMPORTANCE";
    do {
        ical = ical.replace(exoEvent, "EXO_IMPORTANCE");
    } while (ical.includes(exoEvent))

    // replace 'X-MICROSOFT-CDO-INSTTYPE'
    exoEvent = "X-MICROSOFT-CDO-INSTTYPE";
    do {
        ical = ical.replace(exoEvent, "EXO_INSTTYPE");
    } while (ical.includes(exoEvent))

    // replace 'X-MICROSOFT-DONOTFORWARDMEETING'
    exoEvent = "X-MICROSOFT-DONOTFORWARDMEETING";
    do {
        ical = ical.replace(exoEvent, "EXO_DONOTFORWARDMEETING");
    } while (ical.includes(exoEvent))

    // replace 'X-MICROSOFT-DISALLOW-COUNTER'
    exoEvent = "X-MICROSOFT-DISALLOW-COUNTER";
    do {
        ical = ical.replace(exoEvent, "EXO_DISALLOW_COUNTER");
    } while (ical.includes(exoEvent))

    return ical;
}