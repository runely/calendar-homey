'use strict';

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
        let split = date.toLocaleString().split(' ');
        let str = '';

        // add date
        let dateSplit = split[0].split('-');
        str += dateSplit[0];
        str += pad(parseInt(dateSplit[1]), 2);
        str += pad(parseInt(dateSplit[2]), 2);

        if (!getFullDay) {
            // add date time split character
            str += 'T';

            // add time
            let timeSplit = split[1].split(':');
            str += pad(parseInt(timeSplit[0]), 2);
            str += pad(parseInt(timeSplit[1]), 2);
            str += pad(parseInt(timeSplit[2]), 2);
        }

        return str;
    }
}