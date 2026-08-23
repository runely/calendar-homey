El IcalCalendar ofrece tarjetas de flujo de Homey para activar eventos en tu calendario

Configuración

- Abre la configuración (configura la aplicación)
    - Pega el enlace ical y dale un nombre
    - Elige si quieres la sincronización automática del calendario (por defecto está habilitada) (si está deshabilitada, la sincronización debe realizarse mediante una tarjeta de flujo)
    - Elige el intervalo de la sincronización automática del calendario (por defecto cada 15 minutos)
    - Cambia el formato de fecha/hora o usa el predeterminado (a tu elección)
        - Todos los tokens soportados en "luxon.toFormat()" también están soportados aquí: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
    - Elige si quieres etiquetas de próximo evento por calendario. El predeterminado es desactivado
- Para ser notificado de errores de sincronización, crea un flujo usando el disparador "Error de sincronización ocurrido"

Encuentra el enlace ical de Exchange Online

1. Ve a https://outlook.office.com/mail/inbox
2. Haz clic en Configuración -> Mostrar todas las configuraciones de Outlook
3. Ve a Calendario -> Calendarios compartidos
4. Publica un calendario, haz clic en el enlace ics y elige copiar
5. Pega el enlace ical en la configuración de la aplicación Homey

Encuentra la url ical de Gmail

1. Ve a https://calendar.google.com/
2. Haz clic en los tres puntos junto al calendario que deseas compartir -> Haz clic en Configuración y compartición
3. Desplázate hasta el final
4. Copia el enlace de la dirección secreta en formato ical
5. Pega el enlace ical en la configuración de la aplicación Homey

Encuentra la url de Apple iCloud

Los primeros 2 calendarios estándar de Apple iCloud ("Home" y "Work") no están disponibles para ser compartidos mediante un enlace público, sino solo mediante invitación personal (por correo electrónico). Solo los calendarios "nuevos" y "no predeterminados" de Apple iCloud funcionan a través del enlace público.

1. Ve a https://www.icloud.com/calendar/ o abre la aplicación Calendario en tu dispositivo iOS
2. Haz clic en el ícono junto al nombre del calendario en el panel izquierdo (no en "Home" o "Work")
3. Marca la casilla para "Calendario público"
4. Copia el enlace
5. Pega el enlace del calendario en la configuración de la aplicación Homey
    1. Debe ser el enlace original (Apple Calendar tiene URLs sensibles a mayúsculas y minúsculas)

Añadir dispositivo IcalCalendar

Añade el dispositivo "IcalCalendar" para seguir cuántos calendarios has configurado, el conteo total de eventos para todos tus calendarios y la última marca de tiempo de sincronización y conteo de eventos por calendario configurado.

Zona horaria en tu calendario (*.ics)

La biblioteca utilizada en esta aplicación para analizar los calendarios, node-ical, NO usa la propiedad X-WR-TIMEZONE para analizar las zonas horarias. En su lugar, usa las secciones BEGIN:VTIMEZONE para analizar las zonas horarias!
Esto significa que si tu proveedor de calendarios solo usa la propiedad X-WR-TIMEZONE, esta aplicación asumirá que tus eventos siempre están en UTC!

Si tus eventos se crean con la zona horaria 'Zona horaria personalizada' (lo verás al abrir el archivo .ics), es probable que los eventos se creen con la fecha y hora correcta y no se les aplique una zona horaria. Por lo tanto, la zona horaria local NO se aplicará a estos eventos!

Sincronización
- Los eventos se obtienen automáticamente cada 15 minutos (por defecto, se puede cambiar)
- La tarjeta de flujo "Sincronizar calendarios" también se puede usar para activar una sincronización (debe usarse para sincronizar calendarios si la sincronización automática está deshabilitada)

- Solo se recuperarán eventos que aún no hayan comenzado o eventos que hayan comenzado pero no terminado y tengan una fecha de inicio dentro de 2 meses o menos (esto se puede anular en la configuración)
- Los eventos recurrentes con una fecha de inicio dentro de 2 meses o menos se recuperarán (esto se puede anular en la configuración)

Más información y el registro de cambios se pueden encontrar en GitHub
