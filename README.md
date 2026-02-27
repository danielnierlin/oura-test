# Oura Dashboard

Kleine Web-App, die Herzfrequenz- und HRV-Daten aus der Oura API lädt und als Graphen darstellt.

## Features

- Abruf von **Herzfrequenz** über `v2/usercollection/heartrate`
- Abruf der täglichen **HRV (average_hrv)** über `v2/usercollection/daily_sleep`
- Visualisierung mit Chart.js (Linien- und Balkendiagramm)
- Demo-Modus ohne API-Zugang

## Start

Da es eine statische App ist, reicht ein einfacher Webserver:

```bash
python3 -m http.server 4173
```

Danach im Browser öffnen:

- `http://localhost:4173`

## Nutzung

1. Oura Personal Access Token eingeben.
2. Start- und Enddatum setzen.
3. Auf **Daten laden** klicken.

> Hinweis: Der Token wird nur im Browser verwendet und nicht gespeichert.
