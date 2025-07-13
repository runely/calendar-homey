'use strict'

/**
 * @param {import('homey').App|import('../types/AppTests.type').AppTests} app - App class init by Homey
 */
module.exports = async (app) => {
  for await (const { id, type } of app.variableMgmt.tokens) {
    try {
      const token = await app.homey.flow.createToken(id, { type, title: app.homey.__(`flowTokens.${id}`), value: null })
      if (token) {
        app.variableMgmt.flowTokens.push(id)
        app.log(`setupFlowTokens: Created flow token '${id}'`)
      } else {
        app.warn(`setupFlowTokens: Flow token '${id}' not created`)
      }
    } catch (ex) {
      app.logError(`setupFlowTokens: Failed to create flow token '${id}'`, ex)
    }
  }
}
