/**
 * @typedef {import('./Jobs.type').Jobs} Jobs
 */

/**
 * @typedef {import('./VariableMgmt.type').VariableManagement} VariableMgmt
 */

/**
 * @typedef {import('homey').App & {
 *   getTimezone: () => string,
 *   warn: (...[*]) => void,
 *   logError: (...[*]) => void,
 *   isGettingEvents: boolean,
 *   variableMgmt: VariableMgmt,
 *   jobs: Jobs
 *   getEvents: (optionalFlag?: boolean) => void|string[]
 * }} ExtHomeyApp
 */
