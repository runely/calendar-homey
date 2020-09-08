'use strict';

module.exports = (value, type) => {
    let hour = 60;
    let day = 1440; // (60 * 24)
    let week = 10080; // (60 * 24 * 7)

    // set type to default be Minutes
    if (type == undefined) {
        type = '1';
    }

    if (type === '1') return value; // minutes
    else if (type === '2') return (value * hour); // hours
    else if (type === '3') return (value * day); // days
    else if (type === '4') return (value * week); // weeks
}