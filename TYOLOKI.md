# Sisustusapp - työloki

Tämä tiedosto pitää Codex-työrupeamien välisen jatkuvuuden. Uusin merkintä lisätään aina ylimmäksi.

## 2026-06-13 - Moodboardin tallennus ja projektien hallinta

Tehty:

- Lisättiin projektikohtaiseen moodboard-editoriin Supabase-tallennus.
- Tallennus kirjoittaa sivujen canvas-elementit `moodboard_pages.canvas_json`-kenttään.
- Tallennus säilyttää myös `Värit ja pinnat` -työkalun pintavärivalinnat samassa JSON-rakenteessa.
- Tallennus päivittää olemassa olevat moodboard-sivut ja luo editorissa lisätyille uusille tuotesivuille tietokantarivin ensimmäisen tallennuksen yhteydessä.
- Projektikohtainen moodboard lataa tallennetut canvas-elementit Supabasesta avautuessaan.
- Lisättiin moodboard-näkymän yläreunaan linkki takaisin projektinäkymään.
- Lisättiin projektinäkymään projektin poistaminen varmistusdialogilla.
- Poisto käyttää Supabasen RLS-politiikkoja ja tietokannan cascade-rakennetta moodboardin sekä sivujen poistamiseen.

Tarkistettu:

- `npm run typecheck` menee läpi.
- `npm run test:unit` menee läpi: 4 testitiedostoa, 9 testiä.
- Sisäisessä selaimessa varmistettu, että moodboardissa näkyvät `Projektit`-linkki ja `Tallenna`-painike.
- Sisäisessä selaimessa varmistettu, että projektinäkymässä näkyvät `Avaa moodboard` ja `Poista`.

Huomiot:

- Selainvarmistuksessa ei painettu `Poista`-painiketta eikä tehty testipoistoja tietokantaan.
- Tallennus on nyt manuaalinen painikkeesta. Autosave on edelleen seuraava mahdollinen jatkovaihe.

## 2026-06-12 - Vaihe 0 aloitettu

Tehty:

- Korjattiin `Cannot find module './vendor-chunks/@opentelemetry.js'` poistamalla korruptoitunut `.next`-välimuisti ja käynnistämällä dev-palvelin uudelleen. Jatkossa `npm run ci` / `next build` kannattaa ajaa vasta kun dev-palvelin on pysäytetty.
- Korjattiin moodboard-reitin 500-virhe kirjautumattomalle/RLS:n estämälle pyynnölle. Reitti tarkistaa nyt käyttäjän ja ohjaa kirjautumattoman `/login`-sivulle; puuttuva projekti näytetään hallittuna tilana.
- Korjattiin moodboard-reitin hydratoitumisvaroitusta tekemällä editoristä client-only wrapper (`components/editor-shell-client.tsx`) ja lisäämällä root-layoutiin `suppressHydrationWarning`.
- Korjattiin login-sivun CSS-latausongelma poistamalla korruptoitunut `.next`-dev-välimuisti ja käynnistämällä Next uudelleen. CSS-polku `/_next/static/css/app/layout.css` vastaa nyt 200 OK.
- Korjattiin projektin luonnin runtime-virhe `Cannot read properties of null (reading 'reset')` tallentamalla form-elementti ennen async Supabase-kutsuja.
- Korjattiin paikallinen Next runtime -virhe `ENOENT ... .next/server/vendor-chunks/@supabase.js` sulkemalla kaksi päällekkäistä `next dev` -prosessia ja käynnistämällä yksi puhdas dev-palvelin porttiin 3000.
- Lisättiin erillinen `HAAVOITTUVUUSLOKI.md` audit-löydösten kirjaamiseen.
- Päätettiin käyttää Codexin pysyvänä ohjeistuksena `AGENTS.md`-tiedostoa.
- `CLAUDE.md` rajattiin pois tarpeettomana.
- Aloitettiin vaihe 0: kehityksen suojarakenteet ennen varsinaista Supabase-laajennusta.
- Lisättiin riippuvuudet Supabasea, validointia, monitorointia ja testejä varten.
- Lisättiin `.env.example`.
- Lisättiin Vitest-konfiguraatio ja ensimmäiset unit-testit CSV-parsinnalle sekä `canvas_json v1` -skeemalle.
- Lisättiin Playwright-konfiguraatio ja ensimmäinen smoke E2E -testi.
- Lisättiin GitHub Actions CI: lint, typecheck, unit-testit ja build.
- Lisättiin `lib/canvas-schema.ts` dokumentoidun canvas-rakenteen pohjaksi.
- Päivitettiin `app_maarittely3.md` käyttämään `AGENTS.md`-ohjeistusta.
- Lisättiin Supabase client/server -apurit:
  - `lib/supabase/config.ts`
  - `lib/supabase/browser.ts`
  - `lib/supabase/server.ts`
  - `lib/supabase/database.types.ts`
- Lisättiin ensimmäinen Supabase-migraatio:
  - `supabase/migrations/202606120001_initial_foundation.sql`
- Migraatio sisältää organisaatio-, profiili-, projekti-, moodboard-, tuotepankki-, väridata-, tyylitesti-, AI-profiili- ja tiedostometataulut sekä RLS-peruspolitiikat.
- Lisättiin Supabase-käyttöönotto-ohje:
  - `SUPABASE_SETUP.md`
- Lisättiin CSV-tuotteiden ja Tikkurila-värien import-skripti:
  - `scripts/import-catalog-data.mjs`
  - komento `npm run db:import-catalog`
- Lisättiin katalogin palvelukerros:
  - `lib/catalog-repository.ts`
  - unit-testit Supabase-rivien muunnoksille
- Lisättiin ensimmäinen kirjautumis- ja projektinäkymä:
  - `/login`
  - `/projects`
  - `/demo` säilyttää nykyisen moodboard-demon
- Lisättiin projektikohtainen moodboard-reitti:
  - `/projects/[projectId]/moodboard`
  - projektikortit sisältävät "Avaa moodboard" -linkin
  - uuden projektin luonnin jälkeen käyttäjä ohjataan suoraan projektin moodboardiin
- Ensimmäinen auth/projektinäkymä käyttää selaimen Supabase-clientia ja RLS-politiikkoja. Middleware poistettiin tästä vaiheesta, koska se toi Edge Runtime -varoituksen ja teki paikallisesta kehityksestä herkemmän Supabase-verkkokutsuille.
- `npm run ci` menee läpi.

Kesken:

- Supabase-projektia ei ole vielä kytketty sovellukseen.
- Tietokantamigraatiota ei ole vielä ajettu oikeaan Supabase-projektiin.
- RLS-politiikkoja ei ole vielä testattu oikeaa Supabase-projektia vasten.
- Nykyinen editori käyttää vielä frontend-prototyypin tilanhallintaa.
- Luodut projektit tallentuvat Supabaseen ja projektin moodboard avautuu omasta reitistään, mutta canvas-elementtien tallennus käyttää vielä projektikohtaista localStoragea eikä Supabase-autosavea.
- E2E-testi ei mennyt tässä ympäristössä loppuun asti: sandbox ei saa avata localhost-porttia, ja eskaloitu ajo jäi roikkumaan ilman virhetulostetta. Konfiguraatio on lisätty, mutta Playwright-ympäristö pitää viimeistellä erikseen.

Seuraavaksi:

- Luo Supabase-projekti ja täytä `.env.local`.
- Aja ensimmäinen migraatio Supabaseen.
- Luo ensimmäinen organisaatio ja aseta `SEED_ORGANIZATION_ID`.
- Aja `npm run db:import-catalog`.
- Testaa selaimessa kirjautuminen ja projektin luonti.
- Kytke moodboard-editorin canvas-elementtien tallennus Supabaseen ja lisää autosave.
- Viimeistele Playwrightin paikallinen ajo tai lisää CI:hin erillinen E2E-jobi, jossa selaimet asennetaan eksplisiittisesti.

Huomiot:

- `npm audit` raportoi kaksi moderate-tason haavoittuvuutta Nextin PostCSS-riippuvuuden kautta. `npm audit fix --force` ei ole suositeltava tässä vaiheessa, koska se ehdottaa rikkovaa muutosta. Asia tarkistetaan uudelleen Next-päivityksen yhteydessä.
- Haavoittuvuus kirjattiin erilliseen tiedostoon `HAAVOITTUVUUSLOKI.md`.
