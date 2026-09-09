# Andreas Sollie Steffensen – Personal Website

Personlig portfolio og profilside med prosjekter og fagoversikter fra NTNU.
Publisert på [GitHub Pages](https://andsolste.github.io/website/).

## Teknologi og struktur

Statisk HTML, CSS og vanilla JavaScript. Ingen rammeverk eller build-system.

- `index.html` og `about.html`: forside og personlig profil.
- `assets/`: felles design, navigasjon, søk og favicon.
- `fag/`: emneoversikter og fagressurser.
- `projects/`: prosjektoversikt og prosjektsider.
- `404.html`: feilmelding med navigasjon tilbake til nettstedet.

## Lokal kjøring

HTML kan åpnes direkte, men globalt søk trenger en HTTP-server for å hente indeksen.
Kjør fra repositoryets rot:

```sh
python -m http.server
```

Åpne deretter http://localhost:8000/. 404-siden bruker publiserte
`/website/`-paths for å fungere også på feiladresser i dype mapper.

## Kontroll og publisering

```sh
python scripts/validate-site.py
```

Kontrollen bruker bare Python-standardbiblioteket og sjekker lokale lenker,
CSS/JS, søkeindeks, ankere og dupliserte HTML-ID-er.
`main` publiseres gjennom `.github/workflows/deploy-pages.yml`; kontrollen
kjøres før eksisterende Pages-deploy.

## Vedlikehold

- Aktive fag i sidebaren defineres i `assets/site.js`.
- Globalt søk bruker `assets/search-index.json`; oppdater URL-er og ankere når innhold endres.
- Global stil ligger i `assets/site.css`.
- Fagstil ligger i `fag/styles.css` eller fagets egne stilfiler.
- Nye sider bør ha unik beskrivelse, canonical URL og riktig relativ favicon-lenke.
