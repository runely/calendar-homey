De IcalCalendar geeft Homey flow kaarten een trigger op kalender events

Instellingen

- Open settings (app configuratie)
    - En plak de ical link
    - Wijzig de datum- / tijdnotatie of gebruik de standaardinstelling (uw keuze)

Exchange Online ical link

1. Ga naar https://outlook.office.com/mail/inbox
2. klik op settings -> Show all outlook setting
3. Ga naa Kalender -> Gedeelde kalenders
4. Deel een kalender, klik op de ics link en selecteer copy
5. Plak de ical link in de settings van de Homey IcalCalendar app

Gmail ical url

1. Ga naar https://calendar.google.com/
2. Klik op de drie puntjes naar de kalender die je wilt delen. -> Klik op Settings en delen
3. Scroll helemaal naar onder toe
4. Copy de link van de Secret address in ical formaat
5. Plak de ical link in de settings van de Homey IcalCalender app

Apple iCloud url

1. Ga naar https://www.icloud.com/calendar/, of open de agenda app op een iOS of Mac
2. Klik on het icoontje naast de agenda naam in het linker gedeelte van het scherm
3. Vink de checkbox aan voor **Publieke Agenda**
4. Kopieer de link
5. Plake de link van de agenda in de Homey IcalCalender app
    a. Het moet de originele link zijn (Apple Calendar heeft hoofdlettergevoelige URL's)

Sync
- Events worden elke 15 minuten automatisch opgehaald
- De actie flow-kaart "Sync kalenders" kan ook worden gebruikt om een synchronisatie te activeren

- Alleen events die nog niet zijn gestart of events die zijn gestart maar niet zijn voltooid, worden opgehaald
- Terugkerende events waarvan de startdatum binnen 2 maanden of korter is, worden opgehaald

Triggers
- Event start
- Event start over
- Event begint vanaf de kalender
- Event stopt

Condities
- Specifiek event is bezig
- Specifiek event start over
- Specifiek event stopt over
- Een event is bezig
- Een event start over
- Een event stop over

Acties
- Sync kalenders

Algemene flow tokens (kunenn worden gebruikt in elke app en service)
- Volgende event naam
- Volgende event startdatum
- Volgende event start tijd
- Volgende event stopdatum
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
