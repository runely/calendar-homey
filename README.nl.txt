De IcalCalendar geeft Homey flow kaarten een trigger op kalender events

Instellingen

- Open settings (app configuratie)
    - En plak de ical link en geef het een naam
    - Wijzig de datum- / tijdnotatie of gebruik de standaardinstelling (uw keuze)
        - Alle tokens die worden ondersteund in **moment.format()** worden ook hier ondersteund: https://momentjscom.readthedocs.io/en/latest/moment/04-displaying/01-format/
    - Kies of u de volgende event-tags per kalender wilt hebben. Standaard is uitgeschakeld
- Als u op de hoogte wilt worden gehouden van eventuele synchronisatiefouten, maakt u een stroom met behulp van de trigger "Synchronisatiefout opgetreden"

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
   Het moet de originele link zijn (Apple Calendar heeft hoofdlettergevoelige URL's)

Voeg de entiteit IcalCalendar toe

Voeg de entiteit "IcalCalendar" toe om bij te houden hoeveel agenda's u heeft geconfigureerd, het totale aantal evenementen voor al uw agenda's en de laatste synchronisatietijd en het aantal evenementen per geconfigureerde agenda.

Tijdzone in je agenda (*.ics)

De bibliotheek die in deze app wordt gebruikt om de agenda's te analyseren, node-ical, gebruikt NIET de X-WR-TIMEZONE eigenschap om tijdzones te indentificeren. In plaats daarvan, voor de tijdzondes, gebruikt het de BEGIN:VTIMEZONE-secties!
Dit betekent dat als uw agendaprovider alleen de eigenschap X-WR-TIMEZONE gebruikt, deze app ervan uitgaat dat uw afspraken altijd in UTC zijn!

Als uw evenementen zijn gemaakt met de tijdzone 'Aangepaste tijdzone' (u ziet dit bij het openen van het .ics-bestand), zijn de evenementen hoogstwaarschijnlijk gemaakt met de juiste datum/tijd en zou er geen tijdzone moeten worden toegepast. De lokale tijdzone wordt daarom NIET toegepast op deze evenementen!

Sync
- Events worden elke 15 minuten automatisch opgehaald
- De actie flow-kaart "Sync kalenders" kan ook worden gebruikt om een synchronisatie te activeren

- Alleen events die nog niet zijn gestart of events die zijn gestart maar niet zijn voltooid en hebben een start datum binnen 2 maanden of korter worden opgehaald. (Dit kan worden aangepast in de settings)
- Terugkerende events waarvan de startdatum binnen 2 maanden of korter is, worden opgehaald. (Dit kan worden aangepast in de settings)

Meer info en changelog zijn te vinden op GitHub
