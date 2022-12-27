Der IcalCalender erweitert Homey um Flow-Karten, um Kalenderereignisse als Trigger zu nutzen

Setup

- Einstellungen öffnen (App konfigurieren)
    - Den ical-Link einfügen und gib ihm einen Namen
    - Ändern Sie das Datums- / Uhrzeitformat oder verwenden Sie die Standardeinstellung (Ihre Wahl)
        - Alle in **moment.format()** unterstützten Token werden auch hier unterstützt: https://momentjscom.readthedocs.io/en/latest/moment/04-displaying/01-format/
    - Wählen Sie, ob Sie „nächste Ereignis-Tags“ pro Kalender möchten. Standardeinstellung ist aus
- Um über Synchronisierungsfehler benachrichtigt zu werden, erstellen Sie einen Flow mit dem Trigger "Synchronisationsfehler aufgetreten"

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

Zeitzone in Ihrem Kalender (*.ics)

Die in dieser App zum Analysieren der Kalender verwendete Bibliothek node-ical verwendet NICHT die X-WR-TIMEZONE-Eigenschaft zum Analysieren von Zeitzonen. Stattdessen werden die Abschnitte BEGIN:VTIMEZONE verwendet, um Zeitzonen zu analysieren!
Das bedeutet, wenn Ihr Kalenderanbieter nur die X-WR-TIMEZONE-Eigenschaft verwendet, geht diese App davon aus, dass Ihre Ereignisse immer in UTC sind!

Sync
- Ereignisse werden alle 15 Minuten automatisch abgerufen
- Die Aktionskarte "Kalender synchronisieren" kann auch verwendet werden, um eine Synchronisierung auszulösen

- Es werden nur Ereignisse abgerufen, die noch nicht gestartet oder die gestartet, aber nicht beendet wurden und deren Startdatum innerhalb von 2 Monaten oder weniger liegt (dies kann in den Einstellungen geändert werden)
- Wiederkehrende Ereignisse, deren Startdatum innerhalb von 2 Monaten oder weniger liegt, werden abgerufen (dies kann in den Einstellungen geändert werden)

Weitere Informationen und ein Änderungsprotokoll finden Sie auf GitHub
