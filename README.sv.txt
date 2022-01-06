IcalCalendar tillhandahåller Homey flow-kors som kan utlösas på dina kalenderhändelser

Uppsättning

- Öppna inställningar (konfigurera app)
    Klistra in ical-länken
    - Ändra datum/tidsformat eller använd standardvärdena (ditt val)
    - Välj om du vill ha nästa avtalstagg per kalender eller inte. Standard är av

Så här hittar du ical-länken i Exchange Online

1. Gå till https://outlook.office.com/mail/inbox
Klicka på Inställningar -> Visa alla Outlook-inställningar
3. Gå till Kalender -> Delade kalendrar
4. Publicera en kalender, klicka på ics-länken och välj kopiera länk
Klistra in ical-länken i inställningarna i Homey-appen

Hur man hittar ical-länken i Gmail

1. Gå till https://calendar.google.com/
Klicka på de tre prickarna bredvid kalendern du vill använda -> Klicka på Inställningar och delning
Skrolla hela vägen till botten
4. Kopiera länken från fältet Hemlig adress i iCal-format
Klistra in ical-länken i inställningarna i Homey-appen

Hur man hittar ical-länken i Apple iCloud

1. Gå till https://www.icloud.com/calendar/ eller öppna kalendern på din iOS-enhet
2. Klicka på ikonen till höger om namnet på den kalender du vill använda
3. Markera "Extern kalender"
4. Kopiera länkarna
Klistra in länken i inställningarna i Homey-appen
    a. Det måste vara den ursprungliga länken (Apple Calendar är skiftlägeskänsligt i länkarna)

Synkronisera
Händelser hämtas automatiskt var 15:e minut
- Flow-kortet "Synkronisera kalendrar" kan också användas för att utlösa en synkronisering

Endast händelser som inte har påbörjats ännu, eller möten som har påbörjats men inte avslutats och som har ett startdatum inom 2 månader eller mindre kommer att hämtas (kan ändras i inställningarna)
- Återkommande händelser där startdatum är inom 2 månader eller mindre kommer att hämtas (kan ändras i inställningar)

Mer info och ändringslogg finns på GitHub