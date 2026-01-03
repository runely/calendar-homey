import type { Cron } from "croner";

export type Jobs = {
  /**
   * The job to trigger events
   */
  trigger?: Cron;
  /**
   * The job to update calendars
   */
  update?: Cron;
};
