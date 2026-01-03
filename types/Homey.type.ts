import { FlowCard } from "homey";
import { Moment } from "moment";

export type EventAutoCompleteResult = FlowCard.ArgumentAutocompleteResults[0] & {
  start: Moment;
}

export type FlowTrigger = {
  id: string;
  titleFormatted?: { [key: string]: string };
  title: { [key: string]: string }
}

export type FlowArgs = {
  when?: number;
  type?: string;
  calendar?: string;
}

export type Token = {
  id: string;
  type: 'string' | 'number';
  title: string;
}