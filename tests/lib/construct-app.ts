import type { AppTests } from "../../types/Homey.type";

export const constructedApp: AppTests = {
  error: console.error,
  log: console.log,
  homey: {
    __: (prop: string): string => prop,
    clock: {
      getTimezone: (): string => "Europe/Oslo"
    },
    flow: {
      getTriggerCard: (_id: string): jest.Mock => jest.fn()
    },
    i18n: {
      getLanguage: (): string => "en"
    },
    settings: {
      get: (path: string): string => path,
      set: (path: string, data: string): void => {
        console.log(path, "-", data);
      }
    }
  }
};
