IcalCalendar gir Homey flytkort som kan utløses på kalenderavtalene dine

Oppsett

- Åpne innstillinger (konfigurer app)
    - Lim inn ical-lenken
    - Endre dato-/tidsformat eller bruk standardverdiene (ditt valg)
    - Velg om du vil ha neste avtaletagger per kalender eller ikke. Standard er av

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

1. Gå til https://www.icloud.com/calendar/, eller åpne Kalenderen på din iOS-enhet
2. Klikk på ikonet til høyre for navnet på kalenderen du vil legge inn
3. Huk av "Ekstern kalender"
4. Kopier koblingen
5. Lim inn lenken i innstillingene i Homey-appen
    a. Det må være den orginale lenken (Apple Kalender skiller på store og små bokstaver i lenkene)

Sync
- Avtaler hentes automatisk hvert 15. minutt
- Action kortet "Synkroniser kalenderene" kan også brukes til å utløse en synkronisering

- Kun avtaler som ikke er startet ennå, eller avtaler som er startet men ikke fullført, vil bli hentet
- Gjentagende avtaler der startdato er innenfor 2 måneder eller mindre vil bli hentet

Triggers
- En avtale starter
- En avtale starter om
- En avtale starter fra kalender
- En avtale slutter
- En avtale slutter om

Conditions
- Spesifikk avtale pågår
- Spesifikk avtale starter innen
- Spesifikk avtale slutter innen
- En avtale pågår
- En avtale starter innen
- En avtale slutter innen

Actions
- Synkroniser kalenderene

Globale flyt tagger (kan bli brukt i alle apper og servicer)
- Tittel neste avtale
- Startdato neste avtale
- Starttidspunkt neste avtale
- Sluttdato neste avtale
- Sluttidspunkt neste avtale
- Varighet neste avtale
- Varighet neste avtale (minutter)
- Neste avtale starter om (minutter)
- Neste avtale slutter om (minutter)
- Kalendernavn for neste avtale
- Dagens avtaler, tittel og tidspunkt
- Dagens avtaler (antall)
- Morgendagens avtaler, tittel og tidspunkt
- Morgendagens avtaler (antall)
- Dagens avtaler pr kalender
- Morgendagens avtaler pr kalender

Neste avtaletagger per kalender (kan aktiveres i innstillinger)
- Tittel neste avtale i %calendarname%
- Startdato neste avtale i %calendarname%
- Starttidspunkt neste avtale i %calendarname%
- Sluttdato neste avtale i %calendarname%
- Sluttidspunkt neste avtale i %calendarname%