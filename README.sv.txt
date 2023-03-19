IcalCalendar tillhandahåller Homey flow-kort som kan utlösas på dina kalenderhändelser

Uppsättning

- Öppna inställningar (konfigurera app)
    - Klistra in ical-länken och ge den ett namn
    - Ändra datum/tidsformat eller använd standardvärdena (ditt val)
        - Alla tokens som stöds i **moment.format()** stöds också här: https://momentjscom.readthedocs.io/en/latest/moment/04-displaying/01-format/
    - Välj om du vill ha nästa avtalstagg per kalender eller inte. Standard är av
- För att bli meddelad om eventuella synkroniseringsfel, skapa ett flow med triggern "Synkroniseringsfel uppstod"

Hur man hittar ical-länken i Exchange Online

1. Gå till https://outlook.office.com/mail/inbox
2. Klicka på Inställningar -> Visa alla Outlook-inställningar
3. Gå till Kalender -> Delade kalendrar
4. Publicera en kalender, klicka på ics-länken och välj kopiera länk
5. Klistra in ical-länken i inställningarna i Homey-appen

Hur man hittar ical-länken i Gmail

1. Gå till https://calendar.google.com/
2. Klicka på de tre prickarna bredvid kalendern du vill använda -> Klicka på Inställningar och delning
3. Skrolla hela vägen till botten
4. Kopiera länken från fältet Hemlig adress i iCal-format
5. Klistra in ical-länken i inställningarna i Homey-appen

Hur man hittar ical-länken i Apple iCloud

1. Gå till https://www.icloud.com/calendar/ eller öppna kalendern på din iOS-enhet
2. Klicka på ikonen till höger om namnet på den kalender du vill använda
3. Markera "Extern kalender"
4. Kopiera länken
5. Klistra in länken i inställningarna i Homey-appen
    a. Det måste vara den ursprungliga länken (Apple Calendar är skiftlägeskänsligt i länken)

Tidszon i din kalender (*.ics)

Biblioteket som används i den här appen för att analysera kalendrarna, node-ical, använder INTE egenskapen X-WR-TIMEZONE för att analysera tidszoner. Istället använder den BEGIN:VTIMEZONE-sektionerna för att analysera tidszoner!
Detta innebär att om din kalenderleverantör bara använder egenskapen X-WR-TIMEZONE, kommer denna app att anta att dina händelser alltid är i UTC!

Om dina händelser skapas med tidszonen "Anpassad tidszon" (du kommer att se detta när du öppnar .ics-filen), skapas händelserna med största sannolikhet med rätt datum och tid och bör inte ha någon tidszon tillämpad. Den lokala tidszonen kommer därför INTE att tillämpas på dessa evenemang!

Synkronisera
- Händelser hämtas automatiskt var 15:e minut
- Flow-kortet "Synkronisera kalendrar" kan också användas för att utlösa en synkronisering

- Endast händelser som inte har påbörjats ännu, eller möten som har påbörjats men inte avslutats och som har ett startdatum inom 2 månader eller mindre kommer att hämtas (kan ändras i inställningarna)
- Återkommande händelser där startdatum är inom 2 månader eller mindre kommer att hämtas (kan ändras i inställningar)

Mer info och ändringslogg finns på GitHub
