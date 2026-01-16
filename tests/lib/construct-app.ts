import type { AppTests, HomeyAppTestsFlowTriggerCard } from "../../types/Homey.type";

export const constructedApp: AppTests = {
  error: console.error,
  log: console.log,
  homey: {
    __: (prop: string): string => prop,
    clock: {
      getTimezone: (): string => "Europe/Oslo"
    },
    flow: {
      getTriggerCard: (_id: string): HomeyAppTestsFlowTriggerCard => {
        return {
          // biome-ignore lint/suspicious/noExplicitAny: Can be anything
          trigger: async (_tokens?: object, _state?: object): Promise<any> => {
            return Promise.resolve();
          }
        };
      }
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
