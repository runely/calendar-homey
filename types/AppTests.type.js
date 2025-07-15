/**
 * @typedef {object} AppTests
 * @property {{(message?: any, ...optionalParams: any[]): void, (...data: any[]): void}} [error]
 * @property {(function(...[*]): void)} [logError]
 * @property {{(message?: any, ...optionalParams: any[]): void, (...data: any[]): void}} [log]
 * @property {(function(...[*]): void)} [warn]
 * @property {HomeyAppTests} [homey]
 * @property {import('./VariableMgmt.type').VariableManagement} [variableMgmt]
 */

/**
 * @typedef {object} HomeyAppTests
 * @property {(prop: string) => string|import('@types/jest').fn} [__]
 * @property {HomeyAppTestsFlow} [flow]
 * @property {HomeyAppTestsI18n} [i18n]
 * @property {HomeyAppTestsSettings} [settings]
 */

/**
 * @typedef {object} HomeyAppTestsFlow
 * @property {(id: string) => HomeyAppTestsFlowTrigger}
 */

/**
 * @typedef {object} HomeyAppTestsFlowTrigger
 * @property {(tokens: Object) => void} trigger
 */

/**
 * @typedef {object} HomeyAppTestsI18n
 * @property {() => string} getLanguage
 */

/**
 * @typedef {object} HomeyAppTestsSettings
 * @property {(path: string) => string|undefined} [get]
 * @property {(path: string, data: string) => void|import('@types/jest').fn} [set]
 */
