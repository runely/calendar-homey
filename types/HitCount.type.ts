export type HitCountVariant = {
  /** Last triggered datetime formatted in chosen "long time" format from IcalCalendar settings */
  lastTriggered: string;
  /** Number of triggers today */
  today: number;
  /** Total number of triggers (since setup or reset) */
  total: number;

  /** Flow trigger argument */
  when?: number;
  /** Flow trigger argument */
  type?: string;
  /** Flow trigger argument */
  calendar?: string;
}

export type HitCount = {
  /** Trigger id */
  id: string;
  /** Trigger.titleFormatted || Trigger.title */
  name: string;
  variants: HitCountVariant[];
}