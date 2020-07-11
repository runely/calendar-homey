'use strict';

const moment = require('moment');

const pad = (number, width, character) => {
    character = character || '0';
    number = number + '';
    return number.length >= width ? number : new Array(width - number.length + 1).join(character) + number;
}

module.exports = (date, doManualParsing = false, getFullDay = false) => {
    if (!doManualParsing) {
        let str = `${date.getFullYear()}${pad((date.getMonth() + 1), 2)}${pad(date.getDate(), 2)}`;
        if (!getFullDay) {
            str += `T${pad(date.getUTCHours(), 2)}${pad(date.getMinutes(), 2)}${pad(date.getSeconds(), 2)}`;
        }

        return str;
    }
    else {
        return moment(date).format('YYYYMMDDTHHmmss');
    }
}