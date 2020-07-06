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
    ical = ical.replace(/X-MICROSOFT-CDO-APPT-SEQUENCE/g, "EXO_APPT_SEQUENCE");

    // replace 'X-MICROSOFT-CDO-BUSYSTATUS'
    ical = ical.replace(/X-MICROSOFT-CDO-BUSYSTATUS/g, "EXO_BUSYSTATUS");

    // replace 'X-MICROSOFT-CDO-INTENDEDSTATUS'
    ical = ical.replace(/X-MICROSOFT-CDO-INTENDEDSTATUS/g, "EXO_INTENDEDSTATUS");

    // replace 'X-MICROSOFT-CDO-ALLDAYEVENT'
    ical = ical.replace(/X-MICROSOFT-CDO-ALLDAYEVENT/g, "EXO_ALLDAYEVENT");

    // replace 'X-MICROSOFT-CDO-IMPORTANCE'
    ical = ical.replace(/X-MICROSOFT-CDO-IMPORTANCE/g, "EXO_IMPORTANCE");

    // replace 'X-MICROSOFT-CDO-INSTTYPE'
    ical = ical.replace(/X-MICROSOFT-CDO-INSTTYPE/g, "EXO_INSTTYPE");

    // replace 'X-MICROSOFT-DONOTFORWARDMEETING'
    ical = ical.replace(/X-MICROSOFT-DONOTFORWARDMEETING/g, "EXO_DONOTFORWARDMEETING");

    // replace 'X-MICROSOFT-DISALLOW-COUNTER'
    ical = ical.replace(/X-MICROSOFT-DISALLOW-COUNTER/g, "EXO_DISALLOW_COUNTER");

    return ical;
}