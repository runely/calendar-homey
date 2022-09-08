Der IcalCalender erweitert Homey um Flow-Karten, um Kalenderereignisse als Trigger zu nutzen

Setup

- Einstellungen öffnen (App konfigurieren)
    - Den ical-Link einfügen und gib ihm einen Namen
    - Ändern Sie das Datums- / Uhrzeitformat oder verwenden Sie die Standardeinstellung (Ihre Wahl)
        - Gültige Datumsformate (verwenden Sie / . oder - als Trennzeichen)
            - DD.MM.YY[YY]
            - MM.DD.YY[YY]
            - YY[YY].DD.MM
            - YY[YY].MM.DD
        - Gültige Datumsformate einschließlich Wochentag im Kurzformat (ddd) oder Langformat (dddd) (verwenden Sie / . , : - und/oder Leerzeichen als Trennzeichen zwischen Wochentag und Datumsformat)
            - ddd, DD.MM.YY[YY]
            - dddd. MM.DD.YY[YY]
            - ddd: YY[YY].DD.MM
            - dddd - YY[YY].MM.DD
    - Wählen Sie aus, ob Sie die nächsten Ereignistags pro Kalender möchten oder nicht. Standardeinstellung ist aus

Den Exchange Online ical-Link finden

1. Öffnen Sie https://outlook.office.com/mail/inbox
2. Klicken Sie auf Einstellungen -> Alle Outlook-Einstellungen anzeigen
3. Gehe zu Kalender -> Geteilte Kalender
4. Veröffentlichen Sie einen Kalender, klicken Sie auf den ics-Link und wählen Sie Kopie
5. Fügen Sie den ical-Link in die Einstellungen der Homey-App ein

Die Gmail ical URL finden

1. Öffnen Sie https://calendar.google.com/
2. Klicken Sie auf die drei Punkte neben dem Kalender, den Sie freigeben möchten -> Klicken Sie auf Einstellungen und Freigabe
3. Scrollen Sie ganz nach unten
4. Kopieren Sie den Link von der Privatadresse im ical-Format
5. Fügen Sie den ical-Link in die Einstellungen der Homey-App ein

Die Apple iCloud URL finden

1. Öffnen Sie https://www.icloud.com/calendar/, oder öffnen Sie die Kalender App auf Ihrem iOS Gerät
2. Klicken Sie rechts neben dem Kalendername auf das Symbol
3. Kreuzen Sie das Kontrollkästchen an bzw. aktivieren Sie den Schieber für **Öffentlicher Kalender**
4. Kopieren Sie den Link
5. Fügen Sie den Kalenderlink in die Einstellungen der Homey-App ein
    a. Es muss der Originallink sein (Apple Kalender hat Case Sensitive URLs)

Sync
- Ereignisse werden alle 15 Minuten automatisch abgerufen
- Die Aktionskarte "Kalender synchronisieren" kann auch verwendet werden, um eine Synchronisierung auszulösen

- Es werden nur Ereignisse abgerufen, die noch nicht gestartet oder die gestartet, aber nicht beendet wurden und deren Startdatum innerhalb von 2 Monaten oder weniger liegt (dies kann in den Einstellungen geändert werden)
- Wiederkehrende Ereignisse, deren Startdatum innerhalb von 2 Monaten oder weniger liegt, werden abgerufen (dies kann in den Einstellungen geändert werden)

Weitere Informationen und ein Änderungsprotokoll finden Sie auf GitHub
