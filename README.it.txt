L'IcalCalendar offre le carte Homey Flow per attivare gli eventi del tuo calendario

Impostazioni

- Apri le impostazioni (configura l'app)
    - Incolla il link ical e dagli un nome
    - Scegli se vuoi la sincronizzazione automatica del calendario (di default è abilitata) (se disabilitata, la sincronizzazione deve essere effettuata tramite carta di flusso)
    - Scegli l'intervallo della sincronizzazione automatica del calendario (di default ogni 15 minuti)
    - Cambia il formato della data/ora o usa quello predefinito (a tua scelta)
        - Tutti i token supportati in "luxon.toFormat()" sono supportati anche qui: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
    - Scegli se vuoi i tag del prossimo evento per calendario. Il predefinito è disattivato
- Per essere avvisato di eventuali errori di sincronizzazione, crea un flusso utilizzando il trigger "Errore di sincronizzazione occorso"

Trova il link ical di Exchange Online

1. Vai su https://outlook.office.com/mail/inbox
2. Clicca su Impostazioni -> Mostra tutte le impostazioni di Outlook
3. Vai su Calendario -> Calendari condivisi
4. Pubblica un calendario, clicca sul link ics e scegli copia
5. Incolla il link ical nelle impostazioni dell'app Homey

Trova l'url ical di Gmail

1. Vai su https://calendar.google.com/
2. Clicca sui tre punti accanto al calendario che desideri condividere -> Clicca su Impostazioni e condivisione
3. Scorri fino in fondo
4. Copia il link dall'indirizzo segreto in formato ical
5. Incolla il link ical nelle impostazioni dell'app Homey

Trova l'url di Apple iCloud

I primi 2 calendari standard di Apple iCloud ("Home" e "Work") non sono disponibili per essere condivisi tramite un link pubblico, ma solo tramite invito personale (via email). Solo i calendari "nuovi" e "non predefiniti" di Apple iCloud funzionano tramite il link pubblico.

1. Vai su https://www.icloud.com/calendar/ o apri l'app Calendario sul tuo dispositivo iOS
2. Clicca sull'icona accanto al nome del calendario nel pannello a sinistra (non su "Home" o "Work")
3. Seleziona la casella per "Calendario pubblico"
4. Copia il link
5. Incolla il link del calendario nelle impostazioni dell'app Homey
    1. Deve essere il link originale (Apple Calendar ha URL case-sensitive)

Aggiungi dispositivo IcalCalendar

Aggiungi il dispositivo "IcalCalendar" per seguire quanti calendari hai configurato, il conteggio totale degli eventi per tutti i tuoi calendari e l'ultimo timestamp di sincronizzazione e il conteggio degli eventi per calendario configurato.

Fuso orario nel tuo calendario (*.ics)

La libreria utilizzata in questa app per analizzare i calendari, node-ical, NON utilizza la proprietà X-WR-TIMEZONE per analizzare i fusi orari. Invece, utilizza le sezioni BEGIN:VTIMEZONE per analizzare i fusi orari!
Ciò significa che se il tuo fornitore di calendari utilizza solo la proprietà X-WR-TIMEZONE, questa app assumerà che i tuoi eventi siano sempre in UTC!

Se i tuoi eventi sono creati con il fuso orario 'Zona oraria personalizzata' (lo vedrai aprendo il file .ics), gli eventi sono molto probabilmente creati con la data e l'ora corrette e non dovrebbero avere applicato un fuso orario. Pertanto, il fuso orario locale NON verrà applicato a questi eventi!

Sincronizzazione
- Gli eventi vengono recuperati automaticamente ogni 15 minuti (predefinito, può essere modificato)
- La carta di flusso "Sincronizza calendari" può essere utilizzata anche per attivare una sincronizzazione (deve essere usata per sincronizzare i calendari se la sincronizzazione automatica è disabilitata)

- Solo eventi non ancora iniziati o eventi iniziati ma non terminati e con data di inizio entro 2 mesi o meno verranno recuperati (questo può essere sovrascritto nelle impostazioni)
- Eventi ricorrenti con data di inizio entro 2 mesi o meno verranno recuperati (questo può essere sovrascritto nelle impostazioni)

Maggiori informazioni e changelog possono essere trovati su GitHub
