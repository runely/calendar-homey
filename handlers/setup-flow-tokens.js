'use strict'

module.exports = async (app) => {
  for await (const { id, type } of app.variableMgmt.tokens) {
    app.variableMgmt.flowTokens.push(await app.homey.flow.createToken(id, { type, title: app.homey.__(`flowTokens.${id}`) }))
    app.log(`setupFlowTokens: Created flow token '${id}'`)
  }
}
