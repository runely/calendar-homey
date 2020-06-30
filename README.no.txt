IcalCalendar gir Homey flytkort som kan utløses på kalenderavtalene dine

Oppsett

- Åpne innstillinger (konfigurer app) og lim inn ical-lenken

Hvordan finne Exchange Online ical-lenken

1. Gå til https://outlook.office.com/mail/inbox
2. Klikk på instillinger -> Vis alle Outlook-innstillinger
3. Gå til Kalender -> Delte kalendere
4. Publiser en kalender, klikk på ics-lenken og velg kopier kobling
5. Lim inn ical-lenken i innstillinger i Homey appen

Hvordan finne Gmail ical-lenken

1. Gå til https://calendar.google.com/
2. Klikk på de tre dottene ved siden av kalenderen du ønsker å dele -> Klikk Innstillinger og deling
3. Scroll helt ned til bunnen
4. Kopier lenken fra feltet Hemmelig adresse i iCal-format
5. Lim inn ical-lenken i innstillinger i Homey appen

Trigger "En avtale starter" (utløses når en avtale starter)
- Legg kortet til som en trigger i en flyt
- Tokens:
    - 'Avtaletittel'
    - 'Avtalebeskrivelse'
    - 'Avtalested'
    - 'Avtale varighet'
    - 'Avtale varighet (minutter)'
    - 'Kalendernavn'

Trigger "En avtale starter om" (utløses når en avtale starter om gitt tid)
- Legg kortet til som en trigger i en flyt
- Velg tid
- Tokens:
    - 'Avtaletittel'
    - 'Avtalebeskrivelse'
    - 'Avtalested'
    - 'Avtale varighet'
    - 'Avtale varighet (minutter)'
    - 'Kalendernavn'

Trigger "En avtale ender" (utløses når en avtale ender)
- Legg kortet til som en trigger i en flyt
- Tokens:
    - 'Avtaletittel'
    - 'Avtalebeskrivelse'
    - 'Avtalested'
    - 'Avtale varighet'
    - 'Avtale varighet (minutter)'
    - 'Kalendernavn'

Condition "Avtale pågår" (sjekker om valgt avtale pågår|pågår ikke akkurat nå)
- Legg kortet til som en condition i en flyt
- Velg avtale

Condition "Avtale starter innen" (sjekker om valgt avtale starter|starter ikke innenfor tiden angitt)
- Legg kortet til som en condition i en flyt
- Velg tid
- Velg avtale

Condition "Avtale stopper innen" (sjekker om valgt avtale stopper|stopper ikke innenfor tiden angitt)
- Legg kortet til som en condition i en flyt
- Velg tid
- Velg avtale

Condition "En avtale pågår" (sjekker om det finnes noen avtaler som pågår|pågår ikke akkuart nå)
- Legg kortet til som en condition i en flyt

Condition "En avtale starter innen" (sjekker om det finnes noen avtaler som starter|starter ikke innenfor tiden angitt)
- Legg kortet til som en condition i en flyt
- Velg tid

Condition "En avtale stopper innen" (sjekker om det finnes noen avtaler som stopper|stopper ikke innenfor tiden angitt)
- Legg kortet til som en condition i en flyt
- Velg tid

Action "Synkroniser kalenderene" (Henter ned nye .ics-filer for å oppdatere nåværende avtaler)
- Legg kortet til som en condition i en flyt

Globale flyt tokens (kan bli brukt i alle apper og servicer)
- Tittel neste avtale
- Starttidspunkt neste avtale
- Stopptidspunkt neste avtale
- Varighet neste avtale
- Varighet neste avtale (minutter)
- Neste avtale starter om (minutter)
- Neste avtale stopper om (minutter)
- Kalendernavn for neste avtale
- Dagens avtaler, tittel og tidspunkt
- Dagens avtaler (antall)

Kjente feil

- Searching events in condition card, returns no events when search query has a space followed with a character (Example: 'Test f')
- Søk i avtaler i condition kort returnerer ingen avtaler når søkekriteriet har et mellomrom etterfulgt av en bokstav (Eksempel: 'Test f')

ToDo-liste

- Legg til støtte for gjentagende avtaler