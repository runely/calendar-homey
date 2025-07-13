/**
 * @typedef {Object} AppTests
 * @property {{(message?: any, ...optionalParams: any[]): void, (...data: any[]): void}} [error]
 * @property {(function(...[*]): void)} [logError]
 * @property {{(message?: any, ...optionalParams: any[]): void, (...data: any[]): void}} [log]
 * @property {(function(...[*]): void)} [warn]
 * @property {HomeyAppTests} [homey]
 * @property {import('./VariableMgmt.type').VariableManagement} [variableMgmt]
 */

/**
 * @typedef {Object} HomeyAppTests
 * @property {(prop: string) => string|import('jest').fn} [__]
 * @property {HomeyAppTestsFlow} [flow]
 * @property {HomeyAppTestsI18n} [i18n]
 * @property {HomeyAppTestsSettings} [settings]
 */

/**
 * @typedef {Object} HomeyAppTestsFlow
 * @property {(id: string) => HomeyAppTestsFlowTrigger}
 */

/**
 * @typedef {Object} HomeyAppTestsFlowTrigger
 * @property {(tokens: Object) => void} trigger
 */

/**
 * @typedef {Object} HomeyAppTestsI18n
 * @property {() => string} getLanguage
 */

/**
 * @typedef {Object} HomeyAppTestsSettings
 * @property {(path: string) => string|undefined} [get]
 * @property {(path: string, data: string) => void|import('jest').fn} [set]
 */
