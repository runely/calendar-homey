Le IcalCalendar donne des cartes de flux Homey à déclencher suivant vos événements de calendrier

Installation

- Ouvrir les paramètres (configurer l'application)
    - Collez le lien ical et donnez-lui un nom
    - Modifiez le format de date/heure ou utilisez la valeur par défaut (votre choix)
        - Tous les jetons pris en charge dans "moment.format()" sont également pris en charge ici: https://momentjscom.readthedocs.io/en/latest/moment/04-displaying/01-format/
    - Choisissez si vous voulez ou non les prochains tags d'événement par calendrier. La valeur par défaut est désactivée
- Pour être averti d'éventuelles erreurs de synchronisation, créez un flux à l'aide du déclencheur "Une erreur de synchronisation s'est produite"

Rechercher le lien ical Exchange Online

1. Accédez à https://outlook.office.com/mail/inbox
2. Cliquez sur paramètres -> Afficher tous les paramètres Outlook
3. Allez dans Calendrier -> Calendriers partagés
4. Publiez un calendrier, cliquez sur le lien ics et choisissez copier
5. Collez le lien ical dans les paramètres de l'application Homey

Trouver l'url de Gmail

1. Allez sur https://calendar.google.com/
2. Cliquez sur les trois points à côté du calendrier que vous souhaitez partager -> Cliquez sur Paramètres et partage
3. Faites défiler l'écran jusqu'en bas
4. Copiez le lien de l'adresse Secret au format ical
5. Collez le lien ical dans les paramètres de l'application Homey.

Trouver l'url Apple iCloud

1. Allez sur https://www.icloud.com/calendar/, ou ouvrez l'application Calendrier sur votre appareil iOS.
2. Cliquez sur l'icône située à côté du nom du calendrier dans le volet de gauche.
3. Cochez la case "Calendrier public".
4. Copiez le lien
5. Collez le lien du calendrier dans les paramètres de l'application Homey
    a. Il doit s'agir du lien original (Apple Calendar a des urls sensibles à la casse).

Ajouter l'entité IcalCalendar

Ajoutez l'entité "IcalCalendar" pour suivre le nombre de calendriers que vous avez configurés, le nombre total d'événements pour tous vos calendriers, ainsi que l'heure de la dernière synchronisation et le nombre d'événements par calendrier configuré.

Fuseau horaire dans votre calendrier (*.ics)

La bibliothèque utilisée dans cette application pour analyser les calendriers, node-ical, n'utilise PAS la propriété X-WR-TIMEZONE pour analyser les fuseaux horaires. Au lieu de cela, elle utilise les sections BEGIN:VTIMEZONE pour analyser les fuseaux horaires !
Cela signifie que si votre fournisseur de calendrier n'utilise que la propriété X-WR-TIMEZONE, cette application supposera que vos événements sont toujours en UTC !

Si vos événements sont créés avec le fuseau horaire "Customized Time Zone" (vous le verrez lorsque vous ouvrirez le fichier .ics), les événements sont très probablement créés avec la bonne date et ne devraient pas avoir de fuseau horaire appliqué. Le fuseau horaire local ne sera donc PAS appliqué à ces événements !

Synchronisation
- Les événements sont récupérés automatiquement toutes les 15 minutes
- La carte de flux d'actions "Synchroniser les calendriers" peut également être utilisée pour déclencher une synchronisation.

- Seuls les événements qui n'ont pas encore commencé ou les événements commencés mais non terminés et dont la date de début est inférieure ou égale à 2 mois seront récupérés (cette option peut être modifiée dans les paramètres).
- Les événements récurrents dont la date de début est inférieure ou égale à 2 mois seront récupérés (ceci peut être modifié dans les paramètres).

Plus d'informations et le journal des modifications peuvent être trouvés sur GitHub
