/**
 * @typedef {object} HitCountVariant
 * @property {string} lastTriggered - Last triggered datetime formatted in chosen "long time" format from IcalCalendar settings
 * @property {number} today - Number of triggers today
 * @property {number} total - Total number of triggers (since setup or reset)
 */

/**
 * @typedef {HitCountVariant[]} HitCountVariants
 */

/**
 * @typedef {object} HitCount
 * @property {string} id - Trigger id
 * @property {string} name - Trigger.titleFormatted || Trigger.title
 * @property {HitCountVariants} variants
 */

/**
 * @typedef {HitCount[]} HitCountData
 */
