IcalCalendar giver Homey flow-kort til at udløse dine kalenderevents

Opsætning

- Åbn indstillinger (konfigurer appen)
    - Indsæt ical-linket og giv det et navn
    - Vælg om du vil have automatisk kalender-synkronisering (som standard er aktiveret) (hvis deaktiveret, skal synkroniseringen ske via flow-kort)
    - Vælg intervallet for den automatiske kalender-synkronisering (som standard hvert 15. minut)
    - Ændr dato/klokkeslætsformatet eller brug standardformatet (dit valg)
        - Alle tokens understøttet i "luxon.toFormat()" understøttes også her: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
    - Vælg om du vil have næste event-tags pr. kalender. Standard er slået fra
- For at blive notificeret om synkroniseringsfejl, skal du oprette et flow ved hjælp af triggeren "Synkroniseringsfejl opstod"

Find Exchange Online ical-link

1. Gå til https://outlook.office.com/mail/inbox
2. Klik på indstillinger -> Vis alle Outlook-indstillinger
3. Gå til Kalender -> Delte kalendere
4. Publicer en kalender, klik på ics-linket og vælg kopi
5. Indsæt ical-linket i indstillingerne for Homey-appen

Find Gmail ical-url

1. Gå til https://calendar.google.com/
2. Klik på de tre prikker ved siden af den kalender, du ønsker at dele -> Klik på Indstillinger og deling
3. Rul hele vejen ned til bunden
4. Kopier linket fra Hemmelig adresse i ical-format
5. Indsæt ical-linket i indstillingerne for Homey-appen

Find Apple iCloud-url

De første 2 standard Apple iCloud-kalendere ("Home" og "Work") er ikke tilgængelige for deling via et offentligt link, men kun ved personlig invitation (via e-mail). Kun "nye" og "ikke-standard" kalendere fra Apple iCloud fungerer via det offentlige link.

1. Gå til https://www.icloud.com/calendar/ eller åbn Kalender-appen på din iOS-enhed
2. Klik på ikonet ved siden af kalendernavnet i venstre panel (ikke "Home" eller "Work")
3. Marker afkrydsningsfeltet for "Offentlig kalender"
4. Kopier linket
5. Indsæt kalenderlinket i Homey-appens indstillinger
    1. Det skal være det originale link (Apple Kalender har case-sensitiv URLs)

Tilføj enhed IcalCalendar

Tilføj "IcalCalendar" enheden for at følge med i, hvor mange kalendere du har konfigureret, det samlede antal begivenheder for alle dine kalendere og den sidste synkroniseringstidspunkt og begivenhedstælling pr. konfigureret kalender.

Tidszone i din kalender (*.ics)

Biblioteket, der bruges i denne app til at analysere kalendere, node-ical, bruger IKKE X-WR-TIMEZONE-egenskaben til at analysere tidszoner. I stedet bruger det BEGIN:VTIMEZONE-sektioner til at analysere tidszoner!
Dette betyder, at hvis din kalenderudbyder kun bruger X-WR-TIMEZONE-egenskaben, vil denne app antage, at dine begivenheder altid er i UTC!

Hvis dine begivenheder er oprettet med tidszonen 'Tilpasset tidszone' (du vil se dette, når du åbner .ics-filen), er begivenhederne sandsynligvis oprettet med den korrekte dato og klokkeslæt og skal ikke have en tidszone anvendt. Den lokale tidszone vil derfor IKKE blive anvendt på disse begivenheder!

Synkronisering
- Begivenheder hentes automatisk hver 15. minut (standard, kan ændres)
- Flow-kortet "Synkroniser kalendere" kan også bruges til at udløse en synkronisering (skal bruges til at synkronisere kalendere, hvis automatisk synkronisering er deaktiveret)

- Kun begivenheder, der ikke er startet endnu, eller begivenheder, der er startet men ikke afsluttet og har startdato inden for 2 måneder eller mindre, vil blive hentet (dette kan overskrives i indstillingerne)
- Gentagne begivenheder, hvor startdatoen er inden for 2 måneder eller mindre, vil blive hentet (dette kan overskrives i indstillingerne)

Mere info og ændringslog findes på GitHub
