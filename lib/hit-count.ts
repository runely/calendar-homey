import type { App } from "homey";
import type { Moment } from "moment";

import manifest from "../app.json";

import type { HitCount, HitCountVariant } from "../types/HitCount.type";
import type { AppTests, FlowArgs, FlowTrigger } from "../types/Homey.type";
import type { VariableManagement } from "../types/VariableMgmt.type";

import { getMoment } from "./moment-datetime";

const generateLastTriggered = (app: App | AppTests, variableMgmt: VariableManagement): string => {
  if (!variableMgmt.dateTimeFormat) {
    app.error("[ERROR] hit-count/generateLastTriggered: Variable management initialization failed!");
    throw new Error("Variable management initialization failed");
  }

  const now: Moment = getMoment({ timezone: app.homey.clock.getTimezone() });
  now.locale(app.homey.__("locale.moment"));
  return now.format(`${variableMgmt.dateTimeFormat.long} ${variableMgmt.dateTimeFormat.time}`);
};

const saveHitCountData = (app: App | AppTests, variableMgmt: VariableManagement, data: HitCount[]): void => {
  app.homey.settings.set(variableMgmt.hitCount.data, JSON.stringify(data));
};

export const getHitCountData = (app: App | AppTests, variableMgmt: VariableManagement): HitCount[] | undefined => {
  const temp: string | null = app.homey.settings.get(variableMgmt.hitCount.data);
  return !temp ? undefined : (JSON.parse(temp) as HitCount[]);
};

export const resetTodayHitCount = (app: App | AppTests, variableMgmt: VariableManagement): void => {
  const data: HitCount[] | undefined = getHitCountData(app, variableMgmt);

  if (!data) {
    app.log(
      "[WARN] resetTodayHitCount : Tried to reset hit count for today but hit count data hasn't been populated yet"
    );
    return;
  }

  app.log("resetTodayHitCount : Starting to reset today hit count");
  for (const trigger of data) {
    for (const variant of trigger.variants) {
      variant.today = 0;
    }
  }

  saveHitCountData(app, variableMgmt, data);
  app.log("resetTodayHitCount : Finished resetting today hit count");
};

export const setupHitCount = (app: App | AppTests, variableMgmt: VariableManagement): void => {
  let data: HitCount[] | undefined = getHitCountData(app, variableMgmt);
  const lang: string = app.homey.i18n.getLanguage() ?? "en";

  if (!data) {
    data = manifest.flow.triggers.map((trigger: FlowTrigger) => {
      return {
        id: trigger.id,
        name: trigger.titleFormatted?.[lang] ?? trigger.title[lang],
        variants: []
      };
    });

    saveHitCountData(app, variableMgmt, data);
    app.log(`setupHitCount: Hit count data generated for ${data.length} triggers`);
    return;
  }

  const triggersAdded: string[] = [];
  manifest.flow.triggers.forEach((trigger: FlowTrigger) => {
    if (!data.find((hitCount: HitCount) => hitCount.id === trigger.id)) {
      data.push({
        id: trigger.id,
        name: trigger.titleFormatted?.[lang] ?? trigger.title[lang],
        variants: []
      });

      triggersAdded.push(trigger.id);
    }
  });

  if (triggersAdded.length > 0) {
    saveHitCountData(app, variableMgmt, data);
    app.log(`setupHitCount: Added trigger(s) ${triggersAdded.join(",")} to hit count data`);
  }
};

export const updateHitCount = (
  app: App | AppTests,
  variableMgmt: VariableManagement,
  id: string,
  args: undefined | FlowArgs = undefined
): void => {
  const data: HitCount[] | undefined = getHitCountData(app, variableMgmt);

  if (!data) {
    app.log(
      `[WARN] updateHitCount : Tried to update hit count for '${id}', but hit count data hasn't been populated yet`
    );
    return;
  }

  const trigger: HitCount | undefined = data.find((t: HitCount) => t.id === id);
  if (!trigger) {
    app.log(`[WARN] updateHitCount : '${id}' doesnt exist as hit count data yet`);
    return;
  }

  if (args === undefined) {
    if (trigger.variants.length === 0) {
      trigger.variants.push({
        lastTriggered: generateLastTriggered(app, variableMgmt),
        today: 1,
        total: 1
      });
      app.log(`updateHitCount : Trigger variant added for '${id}' :`, trigger.variants[0]);

      saveHitCountData(app, variableMgmt, data);
      return;
    }

    trigger.variants[0].lastTriggered = generateLastTriggered(app, variableMgmt);
    trigger.variants[0].today++;
    trigger.variants[0].total++;
    app.log(`updateHitCount : Trigger variant for '${id}' updated`, trigger.variants[0]);

    saveHitCountData(app, variableMgmt, data);
    return;
  }

  const argKeys: string[] = Object.keys(args);
  const argValues: (string | number)[] = Object.values(args);
  let variant: HitCountVariant | undefined;

  if (argKeys.length === 1) {
    // NOTE: args === { calendar: string }
    const argKey: string = argKeys[0]; // NOTE: argKey can be 'calendar' || 'when' || 'type'
    variant = trigger.variants.find((v: HitCountVariant) => {
      const variantKey: string = Object.keys(v).filter((v: string) => v !== "total" && v !== "today")[0]; // NOTE: variantKey can be 'calendar' || 'when'
      if (variantKey !== argKey) {
        return false;
      }

      const variantValue: string | number = v[variantKey as keyof HitCountVariant] as string | number;
      return variantValue === argValues[0];
    });
  }

  if (argKeys.length === 2) {
    // NOTE: args === { when: number, type: string } || { type: string, when: number }
    const argKeyOne: string = argKeys[0];
    const argKeyTwo: string = argKeys[1];
    variant = trigger.variants.find((v: HitCountVariant) => {
      const variantKeys: string[] = Object.keys(v).filter(v => v !== "total" && v !== "today"); // NOTE: variantKeys can be [ 'calendar', 'lastTriggered' ] || [ 'when', 'type', 'lastTriggered' ] || [ 'type', 'when', 'lastTriggered' ]
      if (variantKeys.length < 2) {
        return false;
      }

      const variantKeyOne: string = variantKeys[0];
      const variantKeyTwo: string = variantKeys[1];
      const variantValueOne: string | number = v[variantKeyOne as keyof HitCountVariant] as string | number;
      const variantValueTwo: string | number = v[variantKeyTwo as keyof HitCountVariant] as string | number;
      if (
        variantKeyOne === argKeyOne &&
        variantValueOne === argValues[0] &&
        variantKeyTwo === argKeyTwo &&
        variantValueTwo === argValues[1]
      ) {
        return true;
      }

      return (
        variantKeyOne === argKeyTwo &&
        variantValueOne === argValues[1] &&
        variantKeyTwo === argKeyOne &&
        variantValueTwo === argValues[0]
      );
    });
  }

  if (!variant) {
    trigger.variants.push({
      ...args,
      lastTriggered: generateLastTriggered(app, variableMgmt),
      today: 1,
      total: 1
    });

    saveHitCountData(app, variableMgmt, data);
    app.log(`updateHitCount : Trigger variant added for '${id}' :`, trigger.variants[trigger.variants.length - 1]);

    return;
  }

  variant.lastTriggered = generateLastTriggered(app, variableMgmt);
  variant.today++;
  variant.total++;

  saveHitCountData(app, variableMgmt, data);
  app.log(`updateHitCount : Trigger variant for '${id}' updated`, variant);
};
