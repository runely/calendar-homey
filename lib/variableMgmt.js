module.exports = {
    CRONTASK: {
        ID: {
            UPDATE_CALENDAR: 'no.runely.calendar.cron_updateCalendar',
            TRIGGER_EVENTS: 'no.runely.calendar.cron_triggerEvents'
        },
        SCHEDULE: {
            UPDATE_CALENDAR: '*/15 * * * *', // run every full 15 minutes
            TRIGGER_EVENTS: '*/1 * * * *' // run every full minute
        }
    },
    SETTING: {
        ICAL_URI: 'uri',
        ICAL_URI_LOAD_FAILURE: 'uri_failed'
    },
    INTERVAL: {}
};