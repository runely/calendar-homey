'use strict';

const Homey = require('homey');

module.exports = app => {
  const dateFormat = Homey.ManagerSettings.get(app.variableMgmt.setting.dateFormat) || Homey.__('settings.datetime.date.default');
  const timeFormat = Homey.ManagerSettings.get(app.variableMgmt.setting.timeFormat) || Homey.__('settings.datetime.time.default');
  const dateSplit = dateFormat.split(' ');
  const dateNormalReadable = (dateSplit.length > 1 ? dateSplit[1] : dateSplit[0]);
  const dateFormatSplit = dateNormalReadable.split(/[./-]/);

  let dateSplitter;
  if (dateNormalReadable.includes('.')) {
    dateSplitter = '.';
  } else if (dateNormalReadable.includes('/')) {
    dateSplitter = '/';
  } else if (dateNormalReadable.includes('-')) {
    dateSplitter = '-';
  } else {
    dateSplitter = '.';
  }

  let timeSplitter;
  if (timeFormat.includes(':')) {
    timeSplitter = ':';
  } else if (timeFormat.includes('.')) {
    timeSplitter = '.';
  } else {
    timeSplitter = ':';
  }

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
};
