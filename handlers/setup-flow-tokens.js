'use strict'

module.exports = async app => {
  for await (const { id, type } of app.variableMgmt.tokens) {
    const token = await app.homey.flow.createToken(id, { type, title: app.homey.__(`flowTokens.${id}`) })
    app.variableMgmt.flowTokens.push(token)
    app.log('triggers: flowToken', id, 'created')
  }
}
