module.exports = (ics) => {
    // remove BEGIN:VCALENDAR->BEGIN:VEVENT and END:VCALENDAR
    if (ics.startsWith("BEGIN:VCALENDAR")) {
        const findString = "BEGIN:VEVENT"
        const startIndex = ics.indexOf(findString)
        const stripped = ics.substr(startIndex, (ics.length - startIndex)).replace("END:VCALENDAR\r\n", "").replace("END:VCALENDAR\r", "").replace("END:VCALENDAR\n", "");
        ics = stripped
    }

    //
    // ****************************************** TIMEZONE ******************************************
    //
    // replace "DTSTART;TZID=W. Europe Standard Time" and "DTSTART;VALUE=DATE"
    var dtStartTZID = "DTSTART;TZID=W. Europe Standard Time"
    var dtStartValue = "DTSTART;VALUE=DATE"
    do {
        ics = ics.replace(dtStartTZID, "DTSTART_TIMESTAMP")
        ics = ics.replace(dtStartValue, "DTSTART_DATE")
    } while (ics.includes(dtStartTZID) || ics.includes(dtStartValue))

    // replace "DTEND;TZID=W. Europe Standard Time" and "DTEND;VALUE=DATE"
    var dtEndTZID = "DTEND;TZID=W. Europe Standard Time"
    var dtEndValue = "DTEND;VALUE=DATE"
    do {
        ics = ics.replace(dtEndTZID, "DTEND_TIMESTAMP")
        ics = ics.replace(dtEndValue, "DTEND_DATE")
    } while (ics.includes(dtEndTZID) || ics.includes(dtEndValue))

    // replace "EXDATE;TZID=W. Europe Standard Time"
    var dtExdateTZID = "EXDATE;TZID=W. Europe Standard Time"
    do {
        ics = ics.replace(dtExdateTZID, "EXDATE")
    } while (ics.includes(dtExdateTZID))

    //
    // ****************************************** GENERAL ******************************************
    //
    // replace "RECURRENCE-ID;TZID=W. Europe Standard Time"
    var recurrenceId = "RECURRENCE-ID;TZID=W. Europe Standard Time"
    do {
        ics = ics.replace(recurrenceId, "RECURRENCE_ID")
    } while (ics.includes(recurrenceId))

    //
    // ****************************************** Exchange Online ******************************************
    //
    // replace 'X-MICROSOFT-CDO-APPT-SEQUENCE'
    var exoEvent = "X-MICROSOFT-CDO-APPT-SEQUENCE"
    do {
        ics = ics.replace(exoEvent, "EXO_APPT_SEQUENCE")
    } while (ics.includes(exoEvent))
    // replace 'X-MICROSOFT-CDO-BUSYSTATUS'
    exoEvent = "X-MICROSOFT-CDO-BUSYSTATUS"
    do {
        ics = ics.replace(exoEvent, "EXO_BUSYSTATUS")
    } while (ics.includes(exoEvent))
    // replace 'X-MICROSOFT-CDO-INTENDEDSTATUS'
    exoEvent = "X-MICROSOFT-CDO-INTENDEDSTATUS"
    do {
        ics = ics.replace(exoEvent, "EXO_INTENDEDSTATUS")
    } while (ics.includes(exoEvent))
    // replace 'X-MICROSOFT-CDO-ALLDAYEVENT'
    exoEvent = "X-MICROSOFT-CDO-ALLDAYEVENT"
    do {
        ics = ics.replace(exoEvent, "EXO_ALLDAYEVENT")
    } while (ics.includes(exoEvent))
    // replace 'X-MICROSOFT-CDO-IMPORTANCE'
    exoEvent = "X-MICROSOFT-CDO-IMPORTANCE"
    do {
        ics = ics.replace(exoEvent, "EXO_IMPORTANCE")
    } while (ics.includes(exoEvent))
    // replace 'X-MICROSOFT-CDO-INSTTYPE'
    exoEvent = "X-MICROSOFT-CDO-INSTTYPE"
    do {
        ics = ics.replace(exoEvent, "EXO_INSTTYPE")
    } while (ics.includes(exoEvent))
    // replace 'X-MICROSOFT-DONOTFORWARDMEETING'
    exoEvent = "X-MICROSOFT-DONOTFORWARDMEETING"
    do {
        ics = ics.replace(exoEvent, "EXO_DONOTFORWARDMEETING")
    } while (ics.includes(exoEvent))
    // replace 'X-MICROSOFT-DISALLOW-COUNTER'
    exoEvent = "X-MICROSOFT-DISALLOW-COUNTER"
    do {
        ics = ics.replace(exoEvent, "EXO_DISALLOW_COUNTER")
    } while (ics.includes(exoEvent))

    return ics;
}