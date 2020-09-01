'use strict';

const Homey = require('homey');

module.exports = (app) => {
    let dateFormat = Homey.ManagerSettings.get(app.variableMgmt.setting.dateFormat) || Homey.__('settings.datetime.date.default');
    let timeFormat = Homey.ManagerSettings.get(app.variableMgmt.setting.timeFormat) || Homey.__('settings.datetime.time.default');
    let dateSplitter = (
        dateFormat.indexOf('.') > -1 ? '.' : (
            dateFormat.indexOf('/') > -1 ? '/' : (
                dateFormat.indexOf('-') > -1 ? '-' : '.'
            )
        )
    );
    let timeSplitter = (
        timeFormat.indexOf(':') > -1 ? ':' : (
            timeFormat.indexOf('.') > -1 ? '.' : ':'
        )
    );
    let dateFormatSplit = dateFormat.split(/[./-]/);

    return {
        date: {
            short: `${dateFormatSplit[0]}${dateSplitter}${dateFormatSplit[1]}`,
            long: dateFormat,
            splitter: dateSplitter
        },
        time: {
            time: timeFormat,
            splitter: timeSplitter
        }
    };
}