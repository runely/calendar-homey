IcalCalendar gir Homey flytkort som kan utløses på kalenderavtalene dine

Oppsett

- Åpne innstillinger (konfigurer app)
    - Lim inn ical-lenken og gi den et navn
    - Velg om du ønsker automatisk kalendersynkronisering (standardinnstillingen er aktivert) (hvis deaktivert, må synkronisering gjøres via flytkort)
    - Velg intervallet for automatisk kalendersynkronisering (standardinnstillingen er hvert 15. minutt)
    - Endre dato-/tidsformat eller bruk standardverdiene (ditt valg)
        - Alle tokens som er supportert i "moment.format()" supporteres her også: https://momentjscom.readthedocs.io/en/latest/moment/04-displaying/01-format/
    - Velg om du vil ha neste avtaletagger per kalender eller ikke. Standard er av
- For å bli varslet om eventuelle synkroniseringsfeil, opprett en flyt med triggeren "Synkroniseringsfeil oppstått"

Hvordan finne Exchange Online ical-lenken

1. Gå til https://outlook.office.com/mail/inbox
2. Klikk på instillinger -> Vis alle Outlook-innstillinger
3. Gå til Kalender -> Delte kalendere
4. Publiser en kalender, klikk på ics-lenken og velg kopier kobling
5. Lim inn ical-lenken i innstillinger i Homey-appen

Hvordan finne Gmail ical-lenken

1. Gå til https://calendar.google.com/
2. Klikk på de tre dottene ved siden av kalenderen du ønsker å dele -> Klikk Innstillinger og deling
3. Scroll helt ned til bunnen
4. Kopier lenken fra feltet Hemmelig adresse i iCal-format
5. Lim inn ical-lenken i innstillinger i Homey-appen

Hvordan finne Apple iCloud-lenken

De to første standard Apple iCloud-kalenderene ("Hjem" og "Arbeid") er ikke tilgjengelige for deling via en offentlig lenke, men kun ved personlig invitasjon (via e-post). Bare "nye" og "ikke-standard"-kalendere fra Apple iCloud fungerer gjennom den offentlige lenken.

1. Gå til https://www.icloud.com/calendar/, eller åpne Kalenderen på din iOS-enhet
2. Klikk på ikonet til høyre for navnet på kalenderen du vil legge inn (ikke "Hjem" eller "Arbeid")
3. Huk av "Ekstern kalender"
4. Kopier koblingen
5. Lim inn lenken i innstillingene i Homey-appen
    1. Det må være den orginale lenken (Apple Kalender skiller på store og små bokstaver i lenkene)

Legg til IcalCalendar-enhten

Legg til "IcalCalendar"-enheten for å følge med på hvor mange kalendere du har konfigurert, totalt antall hendelser for alle kalenderne dine, og siste synkroniseringstidspunkt og antall hendelser per konfigurerte kalender.

Tidssone for din kalender (*.ics)

Biblioteket som er brukt i denne appen for å parse dine kalendere, node-ical, bruker ikke attributten X-WR-TIMEZONE for å parse tidssoner. Istedenfor så brukes BEGIN:VTIMEZONE seksjonene for å parse tidssoner.
Dette betyr at dersom leverandøren av din kalender bare bruker attributten X-WR-TIMEZONE, vil denne appen alltid gå utifra at dine kalenderoppføringer er i UTC!

Hvis hendelsene dine er opprettet med tidssonen "Customized Time Zone" (du vil se dette når du åpner .ics-filen), er hendelsene mest sannsynlig opprettet med riktig dato og klokkeslett og bør ikke ha en tidssone lagt til. Den lokale tidssonen vil derfor IKKE bli brukt på disse hendelsene!

Sync
- Avtaler hentes automatisk hvert 15. minutt (standard, kan endres)
- Action kortet "Synkroniser kalenderene" kan også brukes til å utløse en synkronisering (må brukes for å synkronisere kalendere hvis automatisk synkronisering er deaktivert)

- Kun avtaler som ikke er startet ennå, eller avtaler som er startet men ikke fullført, og som har startdato innenfor 2 måneder eller mindre vil bli hentet (kan endres i innstillinger)
- Gjentagende avtaler der startdato er innenfor 2 måneder eller mindre vil bli hentet (kan endres i innstillinger)

Mer info og changelog finnes på GitHub
