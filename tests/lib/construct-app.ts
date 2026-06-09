import type {
  AppTests,
  HomeyAppTestsFlowToken,
  HomeyAppTestsFlowTriggerCard,
  TokenValue
} from "../../types/Homey.type";

export const constructedApp: AppTests = {
  error: console.error,
  log: console.log,
  homey: {
    __: (prop: string): string => prop,
    clock: {
      getTimezone: (): string => "Europe/Oslo"
    },
    flow: {
      getToken: (_id: string): HomeyAppTestsFlowToken => {
        return {
          // biome-ignore lint/suspicious/noExplicitAny: Can be anything
          setValue: async (_value: TokenValue): Promise<any> => {
            return Promise.resolve();
          }
        };
      },
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
