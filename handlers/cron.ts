import { Cron, type CronCallback, type CronOptions } from "croner";

/**
 * Create a cron scheduler
 *
 * @param cron - [second] minute hour day(month) month day(week)
 * @param callback - function to be executed
 * @param options - cron options
 * @returns {Cron} - The created job
 */
export const addJob = (cron: string, callback: CronCallback, options: CronOptions = {}): Cron => {
  return new Cron(cron, callback, options);
};

/**
 * Check if cron syntax is valid
 *
 * @param cron - [second] minute hour day(month) month day(week)
 * @returns {boolean} - true if cron syntax is valid, otherwise false
 */
export const isValidCron = (cron: string): boolean => {
  try {
    const crontab = new Cron(cron);
    return crontab.nextRun() instanceof Date;
  } catch {
    return false;
  }
};
