# Sisustusapp - Codex-ohjeistus

Tämä projekti rakennetaan kokonaisuudessaan Codex-avusteisesti. Tämä tiedosto on pysyvä perehdytys jokaiselle uudelle Codex-työrupeamalle.

## Projektin tarkoitus

Sisustusapp on sisustussuunnittelijoiden web-sovellus, jolla luodaan asiakkaalle monisivuinen moodboard ja ladataan se PDF-tiedostona. Nykyinen sovellus on frontend-demo, jota laajennetaan Vercelissä julkaistavaksi sisäiseksi MVP:ksi Supabase-backendillä.

Virallinen määrittely: `app_maarittely3.md`.

Haavoittuvuus- ja audit-löydökset kirjataan tiedostoon `HAAVOITTUVUUSLOKI.md`.

## Nykyinen tila

- Next.js / React / TypeScript -frontend-demo on olemassa.
- Editorin canvas käyttää React Konvaa.
- Tuotepankki luetaan vielä tiedostosta `tuotelista-muokattu.csv`.
- Tikkurila-värit luetaan vielä tiedostosta `tikkurila_tunne_vari_2020.csv`.
- Pysyvä tallennus on vielä prototyyppitasolla eikä Supabase ole kytketty editoriin.

## Tavoite seuraavissa vaiheissa

1. Pidä nykyinen frontend-demo toimivana.
2. Lisää backend-perusta hallitusti: Supabase Auth, Postgres, Storage ja RLS.
3. Siirrä tallennus localStoragesta Supabaseen adapterin kautta.
4. Siirrä tuotteet ja värit tietokantaan importtien kautta.
5. Lisää tyylitesti ja AI-tulkinta vasta, kun perusta on kunnossa.

## Komennot

- Kehitys: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Typecheck: `npm run typecheck`
- Unit-testit: `npm run test:unit`
- E2E-testit: `npm run test:e2e`
- CI-tarkistus paikallisesti: `npm run ci`

## Arkkitehtuuriperiaatteet

- Älä kirjoita sovelluksen ydindataa enää uusiin localStorage-rakenteisiin.
- Älä kytke Supabasea suoraan joka komponenttiin; tee ensin selkeä data/service-kerros.
- Pidä editorin canvas-data yhteensopivana `lib/canvas-schema.ts`-skeeman kanssa.
- Muutokset `canvas_json`-rakenteeseen vaativat skeeman, migraation ja testit.
- Tuotteesta moodboardille lisätty elementti tallentaa snapshotin tuotetiedoista.
- OpenAI-, image proxy-, import- ja admin-toiminnot tehdään server/API-reitteinä.
- Supabasen service role -avainta tai OpenAI-avainta ei koskaan käytetä client-koodissa.
- Tietokantamuutokset tehdään migraatioina hakemistoon `supabase/migrations/`.
- Supabase-käyttöönoton käytännön ohje on `SUPABASE_SETUP.md`.
- CSV-tuotteiden ja Tikkurila-värien import tehdään komennolla `npm run db:import-catalog`, kun `.env.local` ja `SEED_ORGANIZATION_ID` ovat paikallaan.

## Muutokset, jotka vaativat erillisen hyväksynnän

- Tietokantaskeeman muutokset.
- RLS-politiikkojen muutokset.
- Autentikointiin tai käyttöoikeuksiin liittyvät muutokset.
- `canvas_json`-rakenteen muutokset.
- Uudet ulkoiset palvelut tai merkittävät riippuvuuspäivitykset.
- Tiedostojen poistot tai historiatietojen hävittäminen.

## Testausvaatimus

Jokainen uusi ominaisuus tarvitsee sille sopivan testin:

- puhdas logiikka: Vitest
- kriittinen käyttöpolku: Playwright
- käyttöoikeudet ja RLS: erilliset Supabase-testit, kun Supabase on mukana

Ennen työn valmistumista aja vähintään:

```bash
npm run typecheck
npm run test:unit
npm run build
```

## Työloki

Merkittävän työrupeaman jälkeen päivitä `TYOLOKI.md`:

- mitä tehtiin
- mitä jäi kesken
- mitä seuraavaksi kannattaa tehdä
- tunnetut riskit tai päätökset
