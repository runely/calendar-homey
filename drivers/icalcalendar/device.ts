import { Device } from "homey";
import { DateTime } from "luxon";

import { getZonedDateTime } from "../../lib/luxon-fns";
import { varMgmt } from "../../lib/variable-management.js";

import type { CalendarMetaData, IcalSettingEntry } from "../../types/IcalCalendar.type";
import type { VariableManagement } from "../../types/VariableMgmt.type";

const calendarsCount: string = "meter_calendars_count_ical";
const totalEventCount: string = "meter_total_event_count_ical";
const eventCountPerCalendar: string = "meter_event_count_calendar_ical";
const lastSuccessfulSync: string = "last_successfull_sync_ical";

let intervalHandle: NodeJS.Timeout | null = null;
let variableMgmt: VariableManagement | null = null;

class MyDevice extends Device {
  /**
   * onInit is called when the device is initialized.
   */
  async onInit(): Promise<void> {
    this.log(
      `Device v${this.homey.manifest.version} is running on firmware ${this.homey.version} with Timezone: '${this.homey.clock.getTimezone()}'`
    );

    variableMgmt = varMgmt;

    // fill sensors with initial data
    await this.updateCalendarsCount();
    await this.updateCalendarsMetadata();

    intervalHandle = this.homey.setInterval(async (): Promise<void> => {
      // update sensors with new data every 5 minutes
      await this.updateCalendarsCount();
      await this.updateCalendarsMetadata();
    }, 300000);

    this.homey.on("unload", (): void => {
      this.log("MyDevice has been unloaded");

      this.homey.clearInterval(intervalHandle);
    });
  }

  async onUninit(): Promise<void> {
    this.log("MyDevice has been uninited");

    this.homey.clearInterval(intervalHandle);
  }

  async updateCalendarsCount(): Promise<void> {
    if (!variableMgmt) {
      this.error("[ERROR] updateCalendarsCount - variableMgmt is not initialized");
      return;
    }

    const calendarsConfigured: IcalSettingEntry[] = this.homey.settings.get(
      variableMgmt.setting.icalUris
    ) as IcalSettingEntry[];

    if (!calendarsConfigured || calendarsConfigured.length === 0) {
      this.log("[WARN] updateCalendarsCount - No calendars configured yet");
      return;
    }

    if (this.hasCapability(calendarsCount)) {
      await this.updateCapabilityValue(calendarsCount, calendarsConfigured.length);
    } else {
      this.log("[WARN] updateCalendarsCount -", calendarsCount, "capability doesn't exist yet....");
    }

    for await (const calendar of calendarsConfigured) {
      const lastSuccessfulSyncLoop: string = `${lastSuccessfulSync}.${calendar.name}`;
      const eventCountPerCalendarLoop: string = `${eventCountPerCalendar}.${calendar.name}`;

      if (!this.hasCapability(lastSuccessfulSyncLoop)) {
        await this.newCapability(
          lastSuccessfulSyncLoop,
          `${this.homey.__("device.lastSuccessfulSync")} ${calendar.name}`
        );
      }

      if (!this.hasCapability(eventCountPerCalendarLoop)) {
        await this.newCapability(
          eventCountPerCalendarLoop,
          `${this.homey.__("device.eventCountCalendar")} ${calendar.name}`
        );
      }
    }

    const currentCalendarCapabilities: string[] = this.getCapabilities()
      .filter(
        (capability: string) => capability.includes(lastSuccessfulSync) || capability.includes(eventCountPerCalendar)
      )
      .map((capability: string) =>
        capability.replace(`${lastSuccessfulSync}.`, "").replace(`${eventCountPerCalendar}.`, "")
      );
    const currentCalendarNames: Set<string> = new Set(currentCalendarCapabilities);
    if (currentCalendarNames.size === 0) {
      this.log("[WARN] updateCalendarsCount - No calendar capabilities found", this.getCapabilities());
      return;
    }

    for await (const calendarName of currentCalendarNames) {
      if (!calendarsConfigured.find((calendar: IcalSettingEntry) => calendar.name === calendarName)) {
        this.log(
          "[WARN] updateCalendarsCount -",
          calendarName,
          "is no longer a configured calendar but has still registered capabilities. Removing capabilities for this calendar"
        );
        try {
          await this.removeCapability(`${lastSuccessfulSync}.${calendarName}`);
          await this.removeCapability(`${eventCountPerCalendar}.${calendarName}`);
        } catch (ex) {
          this.error(
            "[ERROR] updateCalendarsCount - Failed to remove capabilities for calendar no longer configured:",
            ex
          );
        }
      }
    }
  }

  async updateCalendarsMetadata(): Promise<void> {
    if (!variableMgmt) {
      this.error("[ERROR] updateCalendarsCount - variableMgmt is not initialized");
      return;
    }

    const calendarsMetadataStr: string | null = this.homey.settings.get(variableMgmt.storage.calendarsMetadata);
    const calendarsMetadata: CalendarMetaData[] | undefined = calendarsMetadataStr
      ? JSON.parse(calendarsMetadataStr)
      : undefined;

    if (!calendarsMetadata) {
      this.log("[WARN] updateCalendarsMetadata - Calendar meta data not configured yet");
      return;
    }

    for await (const calendar of calendarsMetadata) {
      const lastSuccessfulSyncLoop: string = `${lastSuccessfulSync}.${calendar.name}`;
      const eventCountPerCalendarLoop: string = `${eventCountPerCalendar}.${calendar.name}`;

      if (this.hasCapability(eventCountPerCalendarLoop)) {
        await this.updateCapabilityValue(eventCountPerCalendarLoop, calendar.eventCount);
      } else {
        this.log("[WARN] updateCalendarsMetadata -", eventCountPerCalendarLoop, "capability doesnt exist yet....");
      }

      if (this.hasCapability(lastSuccessfulSyncLoop)) {
        await this.updateCapabilityValue(
          lastSuccessfulSyncLoop,
          getZonedDateTime(
            DateTime.fromISO(calendar.lastSuccessfullSync?.toISO() || "01.01.1970 00:00:00"),
            this.homey.clock.getTimezone()
          ).toFormat("dd.MM.yyyy HH:mm:ss")
        );
      } else {
        this.log("[WARN] updateCalendarsMetadata -", lastSuccessfulSyncLoop, "capability doesnt exist yet....");
      }
    }

    if (!this.hasCapability(totalEventCount)) {
      this.log("[WARN] updateCalendarsMetadata -", totalEventCount, "capability doesnt exist yet....");
      return;
    }

    const eventCount: number = calendarsMetadata.reduce((prev: number, acc: CalendarMetaData) => {
      prev += acc.eventCount;
      return prev;
    }, 0);
    await this.updateCapabilityValue(totalEventCount, eventCount);
  }

  async updateCapabilityValue(id: string, value: number | string): Promise<void> {
    try {
      await this.setCapabilityValue(id, value);
      this.log("updateCapabilityValue: - Capability", id, "updated to", value);
    } catch (error) {
      this.error("[ERROR] setCapabilityValue - Failed to set", id, "to", value, "->", error);
    }
  }

  async newCapability(id: string, title: string): Promise<void> {
    try {
      await this.addCapability(id);
      this.log("newCapability: - Capability", id, "created");

      await this.setCapabilityOptions(id, { title });
      this.log("newCapability: - Capability", id, "title changed to", title);
    } catch (error) {
      this.error("[ERROR] newCapability - Failed to add", id, "and/or set title to", title, "->", error);
    }
  }

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded(): Promise<void> {
    this.log("MyDevice has been added");
  }

  /**
   * onSettings is called when the user updates the device's settings.
   */
  // @ts-expect-error: Can be anything
  async onSettings({ oldSettings, newSettings, changedKeys }): Promise<void> {
    this.log(
      "MyDevice settings where changed. Changed keys:",
      changedKeys,
      "New settings:",
      newSettings,
      "Old settings:",
      oldSettings
    );
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used to synchronize the name to the device.
   */
  async onRenamed(name: string): Promise<void> {
    this.log("MyDevice was renamed to", name);
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted(): Promise<void> {
    this.log("MyDevice has been deleted");

    this.homey.clearInterval(intervalHandle);
  }
}

module.exports = MyDevice;
