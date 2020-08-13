Der IcalCalender erweitert Homey um Flow-Karten, um Kalenderereignisse als Trigger zu nutzen

Setup

- Einstellungen öffnen (App konfigurieren) und den ical-Link einfügen

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

- Nur noch nicht begonnene Ereignisse oder Ereignisse, die begonnen, aber noch nicht beendet wurden, werden abgerufen
- Wiederkehrende Ereignisse, deren Startdatum innerhalb von 2 Monaten oder weniger liegt, werden abgerufen

Trigger
- Ereignis beginnt
- Ereignis beginnt in
- Ereignis endet

Bedingungen
- Ereignis ist laufend
- Ereignis beginnt innerhalb
- Ereignis endet innerhalb
- Irgendein Ereignis ist laufend
- Irgendein Ereignis beginnt innerhalb
- Irgendein Ereignis endet innerhalb

Aktionen
- Kalender synchronisieren

Globale Flow-Token (können in jeder Anwendung und jedem Dienst verwendet werden)
- Nächster Ereignistitel
- Beginn des nächsten Ereignisses
- Ende des nächsten Ereignisses
- Nächste Ereignisdauer
- Nächste Ereignisdauer (Minuten)
- Nächstes Ereignis beginnt in (Minuten)
- Nächstes Ereignis endet in (Minuten)
- Kalenderbezeichnung des nächsten Ereignisses
- Heutige Ereignisse, Titel und Zeit
- Heutige Ereignisse (Anzahl)
- Morgige Ereignisse, Titel und Zeit
- Morgige Ereignisse (Anzahl)
- Heutige Ereignisse pro Kalender
- Morgige Ereignisse pro Kalender
