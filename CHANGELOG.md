# Hausbau-Cockpit 5.0

- Finanzierungsquellen haben jetzt ein frei wählbares Symbol (Sparschwein, Bank, Geldschein, Münzen, Haus) mit Live-Vorschau. Beim Umbenennen bleibt das Symbol erhalten, statt auf den Geldschein zurückzuspringen.
- Geldschein-Symbol neu gezeichnet: eckige Form im Seitenverhältnis eines echten Scheins, mit Euro-Zeichen statt Kreis.
- Lineal-Symbol neu gezeichnet: eckig, alle Striche gleich lang und mit gleichen Abständen zu beiden Rändern.
- Vier neue Symbole in der Gewerkeverwaltung: Zirkel (Architektur), Tür, Spaten/Schaufel (Erdarbeiten) und Geldschein (Finanzierungskosten).
- Türen haben damit ein eigenes Symbol und sind nicht mehr mit Fenstern zu verwechseln.
- Der Filter „Alle" ist aus der Chip-Leiste verschwunden. Die Ausgabenliste zeigt beim Öffnen immer alle Vorgänge.
- Sobald gefiltert wird, erscheint neben der Überschrift „Ausgaben" ein ✕. Ein Tipp darauf — oder auf die Überschrift — hebt die Filterung auf.
- Der Untertitel im Ausgaben-Reiter entfällt: Welcher Status gewählt ist, zeigt bereits der schwarze Chip. Nur beim Sprung über „Verbraucht" nennt er die Finanzierungsquelle, die sonst nirgends sichtbar wäre.
- Neuer Filter „Geplant" für Ausgaben ohne Termine — bisher waren diese nur unter „Alle" zu finden.
- Budgetposten sind jetzt alphabetisch sortiert und über ein eigenes Suchfeld filterbar.
- Die Filterleiste scrollt nicht mehr seitlich, sondern steht als festes Raster über zwei Zeilen. Der aktive Filter kann dadurch nicht mehr abgeschnitten werden.
- Die vier Status-Chips sind exakt gleich breit und stehen als 2×2-Raster bündig zu den Kacheln darunter.
- Filter-Chips etwas kompakter (kleinere Schrift) und mit leichtem Tipp-Feedback.
- Reihenfolge der Filter folgt jetzt dem Ablauf: Alle · Geplant · Beauftragt · Rechnung offen · Bezahlt.
- Dateinamen bleiben bei v41 für einfaches Ersetzen im Repository.

# Hausbau-Cockpit 4.9

- Im Finanzierungs-Bearbeiten-Fenster ist „Verbraucht" jetzt antippbar und springt direkt zu den bezahlten Ausgaben dieser Finanzierungsquelle.
- Suchfeld in der Ausgabenliste: durchsucht Bezeichnung, Firma, Gewerk und Bemerkung, kombinierbar mit den Status-Filtern.
- Finanzierungsquellen (Eigenkapital, KfW, Banktranchen) können jetzt beim Bearbeiten umbenannt werden, z. B. „Banktranche 1" → „ING Bank". Die neue Bezeichnung wird automatisch in Ausgaben, Farbverwaltung und Auswahlfeldern übernommen.
- Dateinamen bleiben bei v41 für einfaches Ersetzen im Repository.

# Hausbau-Cockpit 4.8

- Jede Finanzierungskachel öffnet nur die angeklickte Finanzierungsquelle.
- Für Eigenkapital, KfW und beide Banktranchen kann jeweils ein eigener Gesamtbetrag festgelegt und bearbeitet werden.
- Verbraucht wird automatisch aus bezahlten Ausgaben berechnet.
- Verfügbar und Fortschritt werden automatisch angezeigt.
- Dateinamen bleiben bei v41 für einfaches Ersetzen im Repository.

# Hausbau-Cockpit 4.7

- Budgetsummen-Kachel um „Verbraucht“ und „Verfügbar“ ergänzt.
- Verbraucht summiert automatisch alle Ausgaben, deren Gewerk einen Budgetposten besitzt.
- Verfügbar entspricht der Summe der Gewerkebudgets abzüglich dieser Ausgaben.
- Das manuell gesetzte Gesamtbudget auf der Startseite bleibt unabhängig.
- Dateinamen bleiben bei v41 für einfaches Ersetzen im Repository.

# Hausbau-Cockpit 4.6

- Neue Kachel oberhalb der Budgetliste mit der Summe aller Gewerkebudgets.
- Das manuell festgelegte Gesamtbudget auf der Übersicht bleibt davon vollständig getrennt.
- Die Summe aktualisiert sich automatisch bei Änderungen an Budgetposten.
- Dateinamen bleiben bei v41 für einfaches Ersetzen im Repository.

# Hausbau-Cockpit 4.5

- Gewerkeverwaltung aktualisiert Symbol und Farbe jetzt auch in der Listenansicht sofort.
- Das Lineal-Symbol wurde durch ein eindeutig erkennbares horizontales Lineal ersetzt.
- Dateinamen bleiben bei v41 für einfaches Ersetzen im Repository.

# Hausbau-Cockpit 4.4

- Symboländerungen in der zentralen Gewerkeverwaltung werden überall übernommen.
- Farbänderungen in der zentralen Gewerkeverwaltung werden überall übernommen.
- Bestehende individuelle Ausgabenfarben des Gewerks werden dabei auf die zentrale Farbe zurückgesetzt.
- Live-Vorschau für Symbol und Farbe ergänzt.
- Dateinamen bleiben unverändert.

# Hausbau-Cockpit 4.3

- Zentrale Gewerkeverwaltung für Ausgaben, Budget und Firmen.
- Gewerke können mit Bezeichnung, Symbol und Farbe verwaltet werden.
- Umbenennungen werden automatisch in Ausgaben, Firmen, Budgets, Farben und Symbolen synchronisiert.
- Budgetposten wählen nur noch aus der zentralen Gewerkeliste.
- Firmendatenbank erweitert um Firmenname, Ansprechpartner, Telefon, E-Mail und Gewerk.
- Dateinamen bleiben unverändert, damit das Update ersetzend hochgeladen werden kann.

# Hausbau-Cockpit 4.2

- Schlanke Firmen-/Handwerker-Datenbank mit Name, Gewerk und Kontakt.
- Firmenauswahl im Ausgabenformular wird automatisch nach Gewerk gefiltert.
- Neue Firmen können direkt aus dem Ausgabenformular angelegt werden.
- Bestehende Firmennamen aus älteren Ausgaben werden automatisch übernommen.
- Firmen lassen sich unter Mehr verwalten, bearbeiten und löschen.
- Bestehende Dateinamen bleiben unverändert, damit Updates direkt ersetzt werden können.

# Hausbau-Cockpit 4.1

- Finanzierungsarten gelten erst bei eingetragenem Bezahldatum als verbraucht.
- Der Gesamtfortschritt auf der Übersicht basiert jetzt ebenfalls nur auf bezahlten Ausgaben.
- Beauftragte und offene Rechnungen bleiben weiterhin in Ausgaben- und Budgetansichten sichtbar.

# Hausbau-Cockpit 4.0

- Zentrale Konfiguration für Farben, Kategorien und Symbole
- Neue Farben Türkis und Rot
- Kategorienfarben werden dauerhaft gespeichert
- Eine Farbänderung gilt für alle bestehenden und künftigen Ausgaben desselben Gewerks
- Einheitliche Gewerke-Symbole in Übersicht, Ausgaben, Budget und Formular
- Bereinigter PWA-Cache und versionierte App-Dateien
