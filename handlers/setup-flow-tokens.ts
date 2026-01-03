import { App, FlowToken } from "homey";

import { VariableManagement } from "../types/VariableMgmt.type";

export const setupFlowTokens = async (app: App, variableMgmt: VariableManagement): Promise<void> => {
  for await (const { id, type } of variableMgmt.tokens) {
    try {
      const token: FlowToken = await app.homey.flow.createToken(id, { type, title: app.homey.__(`flowTokens.${id}`), value: null });
      if (!token) {
        app.log(`[WARN] setupFlowTokens: Flow token '${id}' not created`);
        return;
      }

      variableMgmt.flowTokens.push(id);
      app.log(`setupFlowTokens: Created flow token '${id}'`);
    } catch (ex) {
      app.error(`[ERROR] setupFlowTokens: Failed to create flow token '${id}'`, ex);
    }
  }
}
