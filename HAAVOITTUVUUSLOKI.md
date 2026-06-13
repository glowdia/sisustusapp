# Sisustusapp - haavoittuvuusloki

Tähän tiedostoon kirjataan riippuvuus- ja tietoturvalöydökset. Uusin havainto lisätään ylimmäksi.

## 2026-06-12 - npm audit: Next/PostCSS

Status: **Avoin, seurataan**

Lähde:

- Komento: `npm audit --audit-level=moderate`
- Ajettu vaiheessa 0 riippuvuuksien asennuksen jälkeen.

Löydös:

- `postcss < 8.5.10`
- Severity: `moderate`
- Advisory: `GHSA-qx2v-qp2m-jg93`
- Kuvaus: PostCSS CSS stringify -tulosteessa mahdollinen XSS, jos CSS sisältää escapeamatonta `</style>`-sisältöä.

Riippuvuusketju:

- `next`
- `next/node_modules/postcss`

Auditin ehdottama korjaus:

- `npm audit fix --force`

Miksi korjausta ei tehty heti:

- `npm audit fix --force` ehdotti rikkovaa muutosta, joka olisi asentanut epäyhteensopivan Next-version.
- Projektin nykyinen `npm run ci` menee läpi, eikä tähän vaiheeseen haluta ottaa hallitsematonta framework-päivitystä.

Riskinarvio sisäisessä MVP-vaiheessa:

- Riski on kirjattu, mutta ei tällä hetkellä estä kehityksen jatkamista.
- Sovellus ei vielä tarjoa julkista käyttäjien syöttämää CSS-sisältöä.
- Riski tarkistetaan uudelleen ennen Vercel-tuotantojulkaisua ja aina Next-päivityksen yhteydessä.

Suositeltu jatkotoimi:

- Seuraa Next.js-päivityksiä ja päivitä Next hallitusti, kun korjaava versio on saatavilla ilman rikkovaa downgrade-/force-polun tarvetta.
- Aja `npm audit --audit-level=moderate` jokaisen merkittävän riippuvuuspäivityksen jälkeen.
- Ennen kaupallista julkaisua avoimia audit-löydöksiä ei saa jättää käsittelemättä ilman erillistä senior-katselmointia.
