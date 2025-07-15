IcalCalendar daje karty przepływu Homey do wyzwalania wydarzeń z twojego kalendarza

Konfiguracja

- Otwórz ustawienia (konfiguruj aplikację)
    - Wklej link ical i nadaj mu nazwę
    - Wybierz, czy chcesz automatyczną synchronizację kalendarza (domyślnie włączona) (jeśli wyłączona, synchronizacja musi być przeprowadzona za pomocą karty przepływu)
    - Wybierz interwał automatycznej synchronizacji kalendarza (domyślnie co 15 minut)
    - Zmień format daty/godziny lub użyj domyślnego (twoje wybór)
        - Wszystkie tokeny wspierane w "moment.format()" są również wspierane tutaj: https://momentjscom.readthedocs.io/en/latest/moment/04-displaying/01-format/
    - Wybierz, czy chcesz tagi następnego wydarzenia na kalendarz. Domyślnie wyłączone
- Aby otrzymywać powiadomienia o błędach synchronizacji, utwórz przepływ używając wyzwalacza "Wystąpił błąd synchronizacji"

Znajdź link ical Exchange Online

1. Przejdź do https://outlook.office.com/mail/inbox
2. Kliknij ustawienia -> Pokaż wszystkie ustawienia Outlooka
3. Przejdź do Kalendarz -> Udostępnione kalendarze
4. Opublikuj kalendarz, kliknij link ics i wybierz kopiuj
5. Wklej link ical w ustawieniach aplikacji Homey

Znajdź url ical Gmail

1. Przejdź do https://calendar.google.com/
2. Kliknij trzy kropki obok kalendarza, który chcesz udostępnić -> Kliknij Ustawienia i udostępnianie
3. Przewiń na sam dół
4. Skopiuj link z sekretnym adresem w formacie ical
5. Wklej link ical w ustawieniach aplikacji Homey

Znajdź url Apple iCloud

Pierwsze 2 standardowe kalendarze Apple iCloud ("Home" i "Work") nie są dostępne do udostępnienia przez link publiczny, ale tylko przez zaproszenie osobiste (e-mailem). Tylko "nowe" i "nie-domyślne" kalendarze z Apple iCloud działają przez link publiczny.

1. Przejdź do https://www.icloud.com/calendar/ lub otwórz aplikację Kalendarz na swoim urządzeniu iOS
2. Kliknij ikonę obok nazwy kalendarza w lewym panelu (nie "Home" ani "Work")
3. Zaznacz pole wyboru "Publiczny kalendarz"
4. Skopiuj link
5. Wklej link kalendarza w ustawieniach aplikacji Homey
    1. Musi to być oryginalny link (Apple Calendar ma URL-e czułe na wielkość liter)

Dodaj urządzenie IcalCalendar

Dodaj urządzenie "IcalCalendar", aby śledzić, ile kalendarzy masz skonfigurowanych, łączną liczbę wydarzeń dla wszystkich kalendarzy oraz ostatni znacznik czasu synchronizacji i liczbę wydarzeń na skonfigurowanym kalendarzu.

Strefa czasowa w twoim kalendarzu (*.ics)

Biblioteka używana w tej aplikacji do analizowania kalendarzy, node-ical, NIE używa właściwości X-WR-TIMEZONE do analizy stref czasowych. Zamiast tego używa sekcji BEGIN:VTIMEZONE do analizy stref czasowych!
Oznacza to, że jeśli twój dostawca kalendarza używa tylko właściwości X-WR-TIMEZONE, ta aplikacja założy, że twoje wydarzenia są zawsze w UTC!

Jeśli twoje wydarzenia są tworzone ze strefą czasową 'Dostosowana strefa czasowa' (zobaczysz to, otwierając plik .ics), wydarzenia są najprawdopodobniej tworzone z poprawną datą i godziną i nie powinny mieć zastosowanej strefy czasowej. Lokalna strefa czasowa NIE będzie stosowana do tych wydarzeń!

Synchronizacja
- Wydarzenia są pobierane automatycznie co 15 minut (domyślnie, można zmienić)
- Karta przepływu "Synchronizuj kalendarze" może być również używana do wyzwalania synchronizacji (musi być używana do synchronizacji kalendarzy, jeśli automatyczna synchronizacja jest wyłączona)

- Tylko wydarzenia, które jeszcze się nie zaczęły lub wydarzenia, które zaczęły się, ale nie zakończyły i mają datę rozpoczęcia w ciągu 2 miesięcy lub mniej, będą pobierane (to można nadpisać w ustawieniach)
- Wydarzenia cykliczne, gdzie data rozpoczęcia jest w ciągu 2 miesięcy lub mniej, będą pobierane (to można nadpisać w ustawieniach)

Więcej informacji i dziennik zmian można znaleźć na GitHubie
