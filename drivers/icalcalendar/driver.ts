import { Driver } from 'homey';

export class MyDriver extends Driver {
  /**
   * onInit is called when the driver is initialized.
   */
  async onInit (): Promise<void> {
    this.log(`Driver v${this.homey.manifest.version} is running on firmware ${this.homey.version} with Timezone: '${this.homey.clock.getTimezone()}'`);
  }

  /**
   * onPairListDevices is called when a user is adding a device
   * and the 'list_devices' view is called.
   * This should return an array with the data of devices that are available for pairing.
   */
  async onPairListDevices (): Promise<Array<{ name: string, data: { id: string } }>> {
    return [
      {
        name: 'IcalCalendar',
        data: {
          id: 'icalcalendar'
        }
      }
    ];
  }
}
