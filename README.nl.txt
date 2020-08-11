De icalCalendar geeft Homey flow kaarten een trigger op kalender events

Instellingen

- Open settings (app configuratie) en plak de ical link

Exchange Online ical link

1. Ga naar https://outlook.office.com/mail/inbox
2. klik op settings -> Show all outlook setting
3. Ga naa Kalender -> Gedeelde kalenders
4. Deel een kalender, klik op de ics link en selecteer copy
5. Plak de ical link in de settings van de Homey icalCalendar app

Gmail ical url

1. Ga naar https://calendar.google.com/
2. Klik op de drie puntjes naar de kalender die je wilt delen. -> Klik op Settings en delen
3. Scroll helemaal naar onder toe
4. Copy de link van de Secret address in ical formaat
5. Plak de ical link in de settings van de Homey icalCalender app

Apple iCloud url

1. Ga naar https://www.icloud.com/calendar/, of open de agenda app op een iOS of Mac
2. Klik on het icoontje naast de agenda naam in het linker gedeelte van het scherm
3. Vink de checkbox aan voor **Publieke Agenda**
4. Kopieer de link
5. Plake de link van de agenda in de Homey icalCalender app
    a. Het moet de originele link zijn (Apple Calendar heeft hoofdlettergevoelige URL's)

Sync
- Gebeurtenissen worden automatisch elke 15 minuten opgehaald
- De actiestroomkaart "Sync kalenders" kan ook worden gebruikt om een synchronisatie te activeren

- Alleen evenementen die nog niet zijn gestart of evenementen die zijn gestart maar niet zijn voltooid, worden opgehaald
- Terugkerende evenementen waarvan de startdatum binnen 2 maanden of korter is, worden opgehaald

Triggers
- Event start
- Event start over
- Event stopt

Condities
- Event is bezig
- Event start over
- Event stopt over
- Een event is bezig
- Een event start over
- Een event stop over

Acties
- Sync kalenders

Algemene flow tokens (kunenn worden gebruikt in elke app en service)
- Volgende event naam
- Volgende event start tijd
- Volgende event stop tijd
- Volgende event looptijd
- Volgende event looptijd (minuten)
- Volgende event start over (minuten)
- Volgende event stopt in (minuten)
- Kalender naan van het volgende event
- Vandaag event, naam en tijd
- Vandaag event (aantal)
- Events morgen, titel en tijd
- Events morgen (aantal)
- Events vandaag per kalender
- Events morgen per kalender
