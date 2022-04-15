'use strict'

const Homey = require('homey')

module.exports = async app => {
  for await (const { id, type } of app.variableMgmt.tokens) {
    const token = await app.homey.flow.createToken(id, { type, title: Homey.__(`flowTokens.${id}`) }) // TODO: Is this correct? Use a title before it exists? :O
    app.variableMgmt.flowTokens.push(token)
    app.log('triggers: flowToken', id, 'created')
  }
}