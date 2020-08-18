'use strict';

module.exports = (value, type) => {
    let hour = 60;
    let day = 1440; // (60 * 24)
    let week = 10080; // (60 * 24 * 7)

    // set type to default be Minutes
    if (type == undefined) {
        type = '1';
    }

    if (type === '1') {
        // minutes
        let result = value;
        return result;
    }
    else if (type === '2') {
        // hours
        let result = (value * hour);
        return result;
    }
    else if (type === '3') {
        // days
        let result = (value * day);
        return result;
    }
    else if (type === '4') {
        // weeks
        let result = (value * week);
        return result;
    }
}