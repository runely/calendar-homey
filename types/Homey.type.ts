import type { FlowCard } from "homey";
import type { DateTime } from "luxon";

export type AppTests = {
  // biome-ignore lint/suspicious/noExplicitAny: Can be anything
  error: (...args: any[]) => void;
  // biome-ignore lint/suspicious/noExplicitAny: Can be anything
  log: (...args: any[]) => void;
  homey: HomeyAppTests;
};

export type EventAutoCompleteResult = FlowCard.ArgumentAutocompleteResults[0] & {
  start: DateTime<true>;
};

export type FlowTrigger = {
  id: string;
  titleFormatted?: { [key: string]: string };
  title: { [key: string]: string };
};

export type FlowArgs = {
  when?: number;
  type?: string;
  calendar?: string;
};

type HomeyAppTests = {
  __: (prop: string) => string;
  clock: HomeyAppTestsClock;
  flow: HomeyAppTestsFlow;
  i18n: HomeyAppTestsI18n;
  settings: HomeyAppTestsSettings;
};

type HomeyAppTestsClock = {
  getTimezone: () => string;
};

type HomeyAppTestsFlow = {
  getTriggerCard: (id: string) => HomeyAppTestsFlowTriggerCard;
};

export type HomeyAppTestsFlowTriggerCard = {
  // biome-ignore lint/suspicious/noExplicitAny: Can be anything
  trigger: (tokens?: object | undefined, state?: object | undefined) => Promise<any>;
};

type HomeyAppTestsI18n = {
  getLanguage: () => string;
};

type HomeyAppTestsSettings = {
  get: (path: string) => string | undefined;
  set: ((path: string, data: string) => void) | jest.Mock;
};

export type Token = {
  id: string;
  type: "string" | "number";
  title: string;
};
