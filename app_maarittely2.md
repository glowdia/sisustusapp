# Sisustusapp - vaatimusmäärittely ja toteutuskuvaus (versio 2)

Tämä dokumentti kuvaa sisustussuunnittelijoille tarkoitetun moodboard-sovelluksen tavoitteen, ominaisuudet, tekniset ratkaisut ja toteutusohjeet. Dokumentti on kirjoitettu niin, että sen perusteella ihminen tai tekoäly voi jatkaa sovelluksen rakentamista ilman, että projektia täytyy määritellä alusta.

**Versio 2 -muutokset:** Tähän versioon on lisätty AI-avusteisen toteutuksen vaatimat täydennykset: AI-kehityksen pelisäännöt ja projektin ohjetiedosto (luku 4.1), automaattinen testaus ja CI (luku 4.2), canvas-datan versiointi (luku 11), tuotekuvien CORS-riskin hallinta PDF-exportissa (luku 15), API-rajapintojen validointi ja rajoitukset (luku 13.1), tietokantamigraatioiden hallinta koodina (luku 20), tallennuksen samanaikaisuus ja autosave (luku 10.1), virhemonitorointi MVP:ssä sekä tyylitestilinkin token-turvallisuus (luku 16.1).

## 1. Tuotteen tavoite

Sisustusapp on web-sovellus, jonka avulla sisustussuunnittelija voi luoda asiakkaalle selkeän, visuaalisen ja ladattavan sisustussuunnitelman.

Sovelluksen ydin on helppokäyttöinen moodboard-editori. Suunnittelija valitsee tuotteita tuotepankista, lisää omia kuvia ja tekstejä, valitsee pintojen värejä sekä kokoaa lopputuloksesta PDF-tiedoston asiakkaalle.

Ensimmäinen versio rakennetaan yrityksen sisäiseen käyttöön. Arkkitehtuuri tehdään kuitenkin niin, että palvelua voidaan myöhemmin laajentaa kaupalliseksi tuotteeksi ilman täydellistä uudelleenrakennusta.

## 2. Käyttötapaus

1. Suunnittelija kirjautuu sisään.
2. Suunnittelija luo uuden asiakasprojektin.
3. Suunnittelija rakentaa asiakkaalle monisivuisen moodboardin.
4. Suunnittelija lisää sivuille tuotteita tuotepankista, omia kuvia, tekstiä, värejä ja pohjakuvan.
5. Moodboard tallentuu käyttäjäkohtaisesti.
6. Valmis suunnitelma ladataan PDF-tiedostona.
7. Myöhemmässä vaiheessa asiakkaan tekemä tyylitesti auttaa suunnittelijaa suunnitelman lähtötietojen kokoamisessa.

## 3. Käyttäjät ja roolit

### MVP-vaihe

- **Suunnittelija**
  - kirjautuu sovellukseen
  - luo ja muokkaa omia asiakasprojektejaan
  - käyttää yhteistä tuotepankkia
  - lisää manuaalisia tuotteita yhteiseen tuotepankkiin
  - lataa moodboardin PDF:nä

### Myöhemmässä vaiheessa

- **Admin**
  - hallitsee käyttäjiä
  - hallitsee tuotepankkia
  - hallitsee mahdollisia feed/API-integraatioita
  - näkee järjestelmän käyttöä ja virheitä

## 4. Toteutusmalli

Sovellus rakennetaan AI-avusteisesti. Tämä tarkoittaa, että AI-operaattori määrittelee, ohjaa, testaa ja yhdistää palvelut, mutta koodia ei lähtökohtaisesti kirjoiteta käsin rivi riviltä.

Sisäisen MVP:n voi toteuttaa AI-operaattorin johdolla, kunhan seuraavat asiat tehdään huolellisesti:

- vaatimukset määritellään selkeästi
- käyttäjäpolut testataan oikeasti selaimessa
- tietoturvan perusrakenteet tehdään heti oikein
- Supabase, Vercel ja OpenAI yhdistetään hallitusti
- toteutuksesta jää dokumentaatio seuraavaa tekijää varten

Jos sovellus päätetään myöhemmin julkaista myytäväksi palveluksi, ennen julkaisua tarvitaan senior full-stack -kehittäjän katselmointi. Tällöin tarkastetaan erityisesti tietoturva, tietomalli, käyttöoikeudet, ylläpidettävyys, virhetilanteet, varmuuskopiot ja kaupallisen palvelun vaatimukset.

### 4.1 AI-kehityksen pelisäännöt (uusi)

AI-avusteinen toteutus vaatii omat työtapansa, jotta projekti pysyy hallinnassa ja eri AI-istunnot tuottavat yhdenmukaista laatua.

**Projektin ohjetiedosto**

Repositorion juureen luodaan `CLAUDE.md` (tai vastaava `AGENTS.md`), joka sisältää AI-työkaluille pysyvät ohjeet:

- projektin tarkoitus ja arkkitehtuurin yleiskuva lyhyesti
- hakemistorakenne ja keskeisten tiedostojen vastuut
- nimeämiskäytännöt ja koodityyli
- komennot: dev-palvelimen käynnistys, testit, lint, typecheck, build
- mitä EI saa tehdä ilman ihmisen hyväksyntää (lista alla)
- linkki tähän vaatimusmäärittelyyn

Ohjetiedosto pidetään ajan tasalla. Se on AI:n "perehdytysmateriaali", joka estää saman asian selittämisen joka istunnossa ja vähentää epäyhtenäisiä ratkaisuja.

**Muutokset, jotka vaativat aina ihmisen hyväksynnän ennen toteutusta:**

- tietokantaskeeman muutokset
- RLS-politiikoiden muutokset
- riippuvuuksien lisäys tai isot versiopäivitykset
- ympäristömuuttujien lisäys tai muutos
- autentikointiin tai käyttöoikeuksiin liittyvä koodi
- `canvas_json`-rakenteen muutokset (ks. luku 11)

**Versionhallinnan työtapa**

- AI ei koskaan committaa suoraan `main`-haaraan
- jokainen muutoskokonaisuus tehdään omassa feature-haarassa ja viedään pull requestina
- ihminen katselmoi jokaisen PR:n ennen mergeä — vähintään: mitä tiedostoja muuttui, miksi, ja toimivatko testit
- commit-viestit kuvaavat mitä ja miksi, ei vain mitä
- Vercelin preview-deploy tarkistetaan selaimessa ennen mergeä

**Istuntojen välinen jatkuvuus**

- jokaisen merkittävän työrupeaman lopuksi AI päivittää lyhyen `TYOLOKI.md`-tiedoston: mitä tehtiin, mitä jäi kesken, mitä tunnettuja ongelmia on
- näin uusi AI-istunto (tai ihminen) pääsee kiinni tilanteeseen ilman arvailua

### 4.2 Automaattinen testaus ja CI (uusi)

AI-avusteisessa kehityksessä automaattiset testit ovat kriittisin yksittäinen suojamekanismi: AI voi rikkoa olemassa olevia toimintoja huomaamatta, ja ilman testejä regressio paljastuu vasta käytössä. Pelkkä manuaalinen selaintestaus ei riitä.

**Vaatimukset MVP:lle:**

- **Tyyppitarkistus ja lint:** `tsc --noEmit` ja ESLint ajetaan jokaisessa PR:ssä, virheet estävät mergen
- **Yksikkötestit (Vitest):** vähintään kriittiselle logiikalle:
  - CSV-parsinta (`lib/csv.ts`)
  - moodboard-datan serialisointi ja deserialisointi
  - `canvas_json`-migraatiofunktiot (ks. luku 11)
- **E2E-testit (Playwright):** luvun 21 käyttöpoluista vähintään polut 1–10 ja 16–18 automatisoidaan. Nämä ajetaan ennen jokaista tuotanto-deployta.
- **RLS-testit:** tietokannan käyttöoikeudet testataan automaattisesti: testi varmistaa, että käyttäjä A ei näe käyttäjän B projekteja. Tämä on tärkein yksittäinen tietoturvatesti, ja se ajetaan aina kun RLS-politiikkoja tai skeemaa muutetaan.
- **CI-putki (GitHub Actions):** PR:ssä ajetaan automaattisesti: install → lint → typecheck → yksikkötestit → build. E2E-testit ajetaan vähintään ennen tuotantojulkaisua.

**Periaate:** kun AI toteuttaa uuden ominaisuuden, samaan PR:ään kuuluvat myös sen testit. "Toimii minun selaimessani" ei ole hyväksymiskriteeri.

### 4.3 Definition of Done -vaihekohtaisesti (uusi)

Jokaisella luvun 20 toteutusvaiheella on selkeä valmistumiskriteeri, jonka ihminen tarkistaa ennen seuraavaan vaiheeseen siirtymistä. Vaihe ei ole valmis, kun "AI sanoo sen olevan valmis", vaan kun:

1. vaiheen toiminnot on testattu oikeassa selaimessa ihmisen toimesta
2. automaattiset testit menevät läpi
3. uudet testit on kirjoitettu vaiheen toiminnoille
4. `TYOLOKI.md` on päivitetty
5. muutokset on mergetty `main`-haaraan PR:n kautta

## 5. Suositeltu tech stack

### Frontend ja sovellusrunko

- **Next.js**
  - App Router
  - React-pohjainen web-sovellus
  - toimii hyvin Vercelissä
- **TypeScript**
  - vähentää virheitä
  - helpottaa AI-avusteista jatkokehitystä
- **Tailwind CSS**
  - nopea käyttöliittymän rakentaminen
  - yhtenäinen visuaalinen tyyli
- **React Konva / Konva**
  - moodboard-editorin canvas, raahaus, skaalaus ja objektien valinta

### Backend ja data

- **Supabase**
  - kirjautuminen
  - PostgreSQL-tietokanta
  - tiedostojen tallennus
  - Row Level Security eli käyttäjäkohtaiset käyttöoikeudet
- **Supabase Storage**
  - käyttäjän lataamat kuvat
  - pohjakuvat
  - mahdolliset manuaaliset tuotekuvat

### PDF ja tiedostot

- **jsPDF**
  - moodboardin PDF-export
- **PapaParse**
  - CSV-tuotefeedien ja väridatan lukeminen

### AI

- **OpenAI API**
  - tyylitestin tulkinta
  - suunnittelijalle tiivistetty asiakasprofiili
  - myöhemmässä vaiheessa visualisointi tai kuvasuositukset

OpenAI-kutsut tehdään aina server-puolella Next.js API routejen kautta. API-avaimia ei saa koskaan näkyä selaimessa.

### Julkaisu

- **GitHub**
  - versionhallinta
  - pull requestit
  - muutosten historia
- **GitHub Actions** (uusi)
  - CI-putki: lint, typecheck, testit, build
- **Vercel**
  - deploy
  - preview-ympäristöt
  - tuotantoversio

### Testaus ja laadunvarmistus (uusi)

- **Vitest**
  - yksikkötestit logiikalle (CSV-parsinta, serialisointi, migraatiot)
- **Playwright**
  - selainpohjaiset E2E-testit kriittisille käyttöpoluille
- **Zod**
  - API-reittien syötteiden validointi ja `canvas_json`-rakenteen skeemavalidointi
- **Sentry** (tai vastaava)
  - virhemonitorointi jo sisäisessä MVP:ssä — AI-rakennetussa sovelluksessa virheet on nähtävä heti, ei vasta käyttäjän ilmoituksesta

## 6. Nykyisen prototyypin tila

Projektissa on jo toimiva frontend-prototyyppi, jonka päälle voidaan jatkaa.

Nykyinen prototyyppi sisältää:

- Next.js-sovelluksen
- moodboard-editorin
- sivunavigaation
- tuotepankin CSV-datasta
- Tikkurila-väridatan CSV-datasta
- tuotteen lisäämisen moodboardille
- tekstielementtien lisäämisen
- kuvien uploadin
- elementtien raahauksen ja skaalauksen
- elementtien poistamisen
- PDF-latauksen
- paikallisen tallennuksen selaimen localStorageen

Nykyisen prototyypin tärkeimmät tiedostot:

- `app/page.tsx`
  - lataa tuotetiedot ja väridatan
  - renderöi editorin
- `components/editor-shell.tsx`
  - sovelluksen pääeditori
  - sivunavigaatio
  - tuotepankki
  - työkalupalkki
  - tallennus ja PDF-vienti
- `components/moodboard-canvas.tsx`
  - varsinainen moodboard-canvas
  - elementtien raahaus, skaalaus ja valinta
- `lib/types.ts`
  - sovelluksen tietotyypit
- `lib/mock-data.ts`
  - oletussivut
- `lib/csv.ts`
  - CSV-tiedostojen lukeminen
- `tuotelista-muokattu.csv`
  - nykyinen tuotepankin lähdedata
- `tikkurila_tunne_vari_2020.csv`
  - Tikkurila-väridata

Nykyinen prototyyppi ei vielä ole valmis sisäisen tuotantokäytön MVP, koska käyttäjähallinta, varsinainen tietokanta, Supabase Storage ja käyttöoikeudet puuttuvat.

## 7. Moodboardin sivurakenne

Moodboard on monisivuinen. Sivujen visuaalisen tyylin tulee jäljitellä projektissa mukana ollutta PDF-esimerkkiä.

Pakolliset oletussivut:

1. **Otsikkosivu**
   - projektin nimi
   - asiakkaan nimi
   - suunnittelijan tai yrityksen tiedot
   - ei tuotepankkia näkyvissä

2. **Suunnittelijan terveiset**
   - valmiiksi määritelty tekstialue
   - suunnittelijan vapaamuotoinen viesti asiakkaalle
   - ei tuotepankkia näkyvissä

3. **Värit ja pinnat**
   - pintojen värit
   - Tikkurila-värikoodit
   - värikortit ja tekstit
   - mahdolliset materiaalikuvat

4. **Huonekalut ja valaisimet**
   - aluksi tyhjä sivu
   - suunnittelija lisää tuotteet itse tuotepankista
   - tuotteiden paikat vapaasti muokattavissa

5. **Tekstiilit ja somisteet**
   - aluksi tyhjä tai kevyesti ohjaava sivu
   - suunnittelija lisää tuotteet itse tuotepankista
   - tuotteiden paikat vapaasti muokattavissa

6. **Pohjakuva**
   - pohjakuvan upload
   - PDF- tai kuvatiedosto
   - skaalaus ja sijoittelu
   - ei tuotepankkia näkyvissä

Tuotesivuja täytyy voida luoda lisää tarpeen mukaan. Esimerkiksi jos huonekaluja on paljon, suunnittelija voi lisätä toisen "Huonekalut ja valaisimet" -sivun.

## 8. Editorin toiminnalliset vaatimukset

### 8.1 Sivujen hallinta

- Käyttäjä voi vaihtaa moodboardin sivua.
- Käyttäjä voi lisätä uusia tuotesivuja.
- Käyttäjä voi nimetä sivuja.
- Käyttäjä voi järjestää sivuja myöhemmässä vaiheessa.
- Tietyt sivutyypit ovat rakenteeltaan ohjatumpia:
  - otsikkosivu
  - suunnittelijan terveiset
  - värit ja pinnat
  - pohjakuva
- Tuotesivuilla elementtien sijoittelu on vapaata.

### 8.2 Tuotteen lisääminen moodboardille

- Käyttäjä voi valita tuotteen tuotepankista.
- Tuote lisätään aktiiviselle sivulle.
- Tuotekuva näkyy moodboardissa.
- Tuotteen tiedot lisätään kuvan alle siististi ja jäsennellysti.
- Tuotetiedoissa näytetään:
  - tuotteen nimi
  - väri
  - hinta
  - mitat
  - linkki verkkokauppaan PDF:ssä
- Kategoriaa ei näytetä tuotteen kortissa moodboardilla.
- Tuotekortin tekstien ei tule mennä päällekkäin.
- Pitkät nimet katkaistaan hallitusti tai rivitetään.

### 8.3 Tuotekuvan käsittely

- Tuotekuvan kuvasuhde säilytetään aina.
- Kuva skaalautuu kortin sisällä ilman venymistä.
- Kuvan ympärillä oleva valinta-alue vastaa tuotteen näkyvää korttia.
- Vaakakuvien ylä- ja alapuolelle jäävä tila on valkoinen.
- Tuotekortin taustan tulee olla valkoinen, ei läpinäkyvä tai beige.
- Tuotekortissa saa olla kevyt varjo ruudulla, mutta PDF:ssä lopputuloksen tulee olla siisti.

### 8.4 Elementtien muokkaus

- Käyttäjä voi siirtää elementtejä vapaasti.
- Käyttäjä voi skaalata elementtejä.
- Käyttäjä voi valita elementin klikkaamalla.
- Valitussa elementissä näkyy muokkauskehys.
- Käyttäjä voi poistaa elementin mustasta ympyrästä, jossa on valkoinen rasti.
- Poistorasti näkyy kuvan tai kortin päällä oikeassa yläkulmassa.
- Poistorasti ei saa tulostua PDF-tiedostoon.

### 8.5 Tekstin lisääminen

- Käyttäjä voi lisätä tekstielementin sivulle.
- Käyttäjä voi muokata tekstin sisältöä.
- Käyttäjä voi muuttaa tekstin kokoa.
- Käyttäjä voi muuttaa tekstin väriä.
- Tekstin tulee pysyä oman laatikkonsa sisällä.

### 8.6 Kuvien upload

- Käyttäjä voi lisätä oman kuvan moodboardille.
- Kuva tallennetaan MVP-vaiheessa Supabase Storageen.
- Kuva voidaan skaalata ja sijoittaa moodboardille.
- Kuvan kuvasuhde säilytetään.

### 8.7 Pohjakuva

- Käyttäjä voi lisätä pohjakuvan erillisenä uploadina.
- Tuetut muodot:
  - PDF
  - PNG
  - JPG / JPEG
  - WebP
- MVP-vaiheessa riittää upload, skaalaus ja sijoittelu.
- Oma pohjakuvaeditori ei kuulu MVP:hen.

### 8.8 Värit ja pinnat

- Käyttäjä voi valita värejä Tikkurila-väridatasta.
- Värin yhteydessä näytetään:
  - värikoodi
  - värin nimi
  - värinäyte
- Värit perustuvat tiedostoon `tikkurila_tunne_vari_2020.csv`.
- Värisivulla voidaan myöhemmin näyttää myös:
  - seinävärit
  - lattiamateriaalit
  - tekstiilimateriaalit
  - muut pintamateriaalit

## 9. Tuotepankki

### 9.1 Tuotedata

Tuotepankin alkuperäinen lähde on CSV-tiedosto:

`tuotelista-muokattu.csv`

CSV sisältää vähintään seuraavat kentät:

- tuotteen nimi
- kategoria
- väri
- hinta
- mitat
- tuotekuvan url
- tuotesivun url

Sovelluksen sisäinen tuotemalli:

- `id`
- `name`
- `category`
- `color`
- `priceText`
- `dimensionsText`
- `imageUrl`
- `productUrl`
- `source`
- `createdBy`
- `createdAt`
- `updatedAt`
- `isActive`

### 9.2 Tuotepankin käyttö

- Tuotepankki on yhteinen kaikille suunnittelijoille.
- Tuotepankki ei ole näkyvissä seuraavilla sivuilla:
  - Otsikkosivu
  - Suunnittelijan terveiset
  - Pohjakuva
- Tuotepankki näkyy tuotesivuilla.
- Tuotteita voi hakea ja suodattaa vähintään kategorian ja hakusanan perusteella.
- Varastosaldoa ei tarvita MVP-vaiheessa.

### 9.3 Manuaalisesti lisätyt tuotteet

- Suunnittelija voi lisätä tuotteen käsin.
- Manuaalisesti lisätty tuote lisätään heti yhteiseen tuotepankkiin.
- Manuaalisessa tuotteessa tulee voida antaa:
  - nimi
  - kategoria
  - väri
  - mitat
  - hinta
  - verkkokaupan linkki
  - tuotekuva uploadina tai URL-osoitteena
- Taustan poisto jätetään toistaiseksi pois MVP:stä.

### 9.4 Tulevat tuotefeed-integraatiot

Myöhemmässä vaiheessa tuotepankki voidaan päivittää yhteistyökumppanin feedistä tai API:sta.

Mahdollisia lähteitä:

- verkkokaupan oma tuotefeed
- Google Merchant Centerin tuotedata, jos kumppani pystyy jakamaan feedin tai sen lähteen
- räätälöity API-integraatio
- ajastettu CSV-import

Tärkeää: Google Merchant Center ei yleensä ole sellaisenaan avoin ulkopuolinen tuotetietokanta. Käytännössä tarvitaan kumppanin lupa ja tekninen tapa jakaa sama tuotefeed, jota Merchant Center käyttää.

## 10. Tallennus ja käyttäjäkohtaisuus

MVP-vaiheessa localStorage tulee korvata Supabasella.

Moodboardin tulee tallentua niin, että:

- kirjautunut suunnittelija näkee omat projektinsa
- suunnittelija voi jatkaa projektia myöhemmin
- projekti avautuu toisella selaimella tai laitteella
- käyttäjä ei pääse toisen suunnittelijan projekteihin ilman erillistä oikeutta
- moodboardin sivut, elementit, tekstit, värit ja kuvat säilyvät

Sisäisessä MVP:ssä riittää käyttäjäkohtainen omistajuus. Myöhemmässä kaupallisessa vaiheessa voidaan lisätä organisaatiot ja tiimit.

### 10.1 Tallennusstrategia, autosave ja samanaikaisuus (uusi)

Alkuperäinen määrittely ei ottanut kantaa siihen, miten ja milloin moodboard tallentuu. Tämä on editorisovelluksessa keskeinen suunnittelupäätös, joka pitää määritellä ennen toteutusta — muuten AI tekee oman tulkintansa, joka voi johtaa datan katoamiseen.

**Vaatimukset:**

- Moodboard tallentuu automaattisesti (autosave) muutosten jälkeen, esimerkiksi 2–5 sekunnin viiveellä viimeisestä muutoksesta (debounce).
- Käyttöliittymässä näkyy tallennuksen tila: "Tallennettu" / "Tallennetaan..." / "Tallennus epäonnistui".
- Jos tallennus epäonnistuu (esim. verkkokatko), käyttäjälle näytetään selkeä virheilmoitus ja tallennusta yritetään uudelleen. Muutokset eivät saa kadota hiljaisesti.
- **Samanaikainen muokkaus:** sama käyttäjä voi vahingossa avata saman projektin kahteen selainvälilehteen. MVP:ssä riittää yksinkertainen suojaus: `moodboard_pages`-tauluun lisätään `version`-kenttä (integer), joka kasvaa jokaisella tallennuksella. Jos tallennettaessa kannan versio on uudempi kuin selaimen tuntema versio, tallennus hylätään ja käyttäjälle ilmoitetaan, että sivu on muuttunut muualla. Reaaliaikaista yhteismuokkausta ei tarvita MVP:ssä.

## 11. Ehdotettu tietomalli Supabaseen

### `profiles`

Käyttäjäprofiilit Supabase Authin käyttäjille.

- `id` UUID, sama kuin auth user id
- `email` text
- `full_name` text
- `role` text, esim. `designer` tai `admin`
- `created_at` timestamp
- `updated_at` timestamp

### `projects`

Asiakasprojektit.

- `id` UUID
- `owner_id` UUID, viite `profiles.id`
- `name` text
- `client_name` text
- `room_name` text
- `designer_name` text
- `status` text
- `created_at` timestamp
- `updated_at` timestamp

### `moodboards`

Projektin moodboard.

- `id` UUID
- `project_id` UUID
- `title` text
- `format` text, esim. `a4_landscape`
- `created_at` timestamp
- `updated_at` timestamp

### `moodboard_pages`

Moodboardin sivut.

- `id` UUID
- `moodboard_id` UUID
- `page_type` text
- `title` text
- `sort_order` integer
- `fixed` boolean
- `canvas_json` jsonb
- `schema_version` integer (uusi)
- `version` integer (uusi, samanaikaisuussuojaus, ks. luku 10.1)
- `created_at` timestamp
- `updated_at` timestamp

MVP-vaiheessa sivun elementit voidaan tallentaa `canvas_json`-kenttään. Tämä on nopea ja joustava ratkaisu editorille.

**`canvas_json`-rakenteen versiointi (uusi, kriittinen AI-kehityksessä):**

`canvas_json` on sovelluksen tärkein tietorakenne ja samalla sen suurin riski AI-avusteisessa kehityksessä: AI muuttaa helposti elementtien tietorakennetta uutta ominaisuutta toteuttaessaan, jolloin aiemmin tallennetut moodboardit eivät enää aukea tai renderöityvät rikki. Tämän estämiseksi:

- `canvas_json`-rakenne dokumentoidaan eksplisiittisesti Zod-skeemana (`lib/canvas-schema.ts`). Skeema on rakenteen ainoa totuuden lähde.
- Jokainen tallennettu sivu sisältää `schema_version`-numeron.
- Kun rakennetta muutetaan, kirjoitetaan migraatiofunktio (`migrateV1toV2` jne.), joka päivittää vanhan datan luettaessa. Migraatiofunktioille kirjoitetaan yksikkötestit.
- Sovellus ei koskaan kaadu tuntemattomaan elementtityyppiin: tuntematon elementti ohitetaan ja virhe logitetaan.
- `canvas_json`-rakenteen muutos vaatii aina ihmisen hyväksynnän (ks. luku 4.1).

Myöhemmässä vaiheessa elementit voidaan tarvittaessa normalisoida omaan `moodboard_elements`-tauluun, jos tarvitaan tarkempaa raportointia, hakua tai automaatioita.

### `products`

Yhteinen tuotepankki.

- `id` UUID
- `name` text
- `category` text
- `color` text
- `price_text` text
- `dimensions_text` text
- `image_url` text
- `image_storage_path` text
- `product_url` text
- `source` text, esim. `csv`, `manual`, `feed`
- `created_by` UUID
- `created_at` timestamp
- `updated_at` timestamp
- `is_active` boolean

### `paint_colors`

Tikkurila-värit.

- `id` UUID
- `code` text
- `name` text
- `hex` text
- `created_at` timestamp

### `style_tests`

Asiakkaan tyylitestin vastaukset.

- `id` UUID
- `project_id` UUID
- `customer_name` text
- `customer_email` text
- `answers_json` jsonb
- `status` text
- `created_at` timestamp

### `style_profiles`

AI:n tuottama tulkinta tyylitestistä.

- `id` UUID
- `style_test_id` UUID
- `style_name` text
- `summary` text
- `keywords` jsonb
- `color_direction_json` jsonb
- `tikkurila_suggestions_json` jsonb
- `product_filters_json` jsonb
- `designer_brief` text
- `created_at` timestamp

### `files`

Ladattujen tiedostojen metatiedot.

- `id` UUID
- `owner_id` UUID
- `project_id` UUID
- `bucket` text
- `path` text
- `file_type` text
- `created_at` timestamp

## 12. Supabase Storage

Suositellut bucketit:

- `product-images`
  - manuaalisesti lisätyt tuotekuvat
- `project-uploads`
  - käyttäjän moodboardille lataamat kuvat
  - pohjakuvat
- `exports`
  - mahdolliset tallennetut PDF-exportit myöhemmässä vaiheessa

Storage-politiikat:

- käyttäjä saa lukea omiin projekteihinsa liittyviä tiedostoja
- käyttäjä saa lisätä tiedostoja omiin projekteihinsa
- yhteisen tuotepankin kuvat voidaan tehdä sisäisesti kaikkien kirjautuneiden käyttäjien luettaviksi
- julkisia bucket-osoitteita vältetään, ellei niille ole selkeää tarvetta

## 13. Tietoturvavaatimukset

Sisäisessäkin MVP:ssä tietoturvan perusrakenteet tehdään heti oikein.

Pakolliset vaatimukset:

- käyttäjä kirjautuu Supabase Authin kautta
- tietokannassa käytetään Row Level Securityä
- käyttäjä näkee oletuksena vain omat projektinsa
- yhteinen tuotepankki on kaikkien kirjautuneiden suunnittelijoiden luettavissa
- OpenAI API -avain säilytetään vain palvelinpuolella
- ympäristömuuttujia ei kovakoodata lähdekoodiin
- tiedostouploadit validoidaan
- sallittuja tiedostotyyppejä rajoitetaan
- suurille tiedostoille asetetaan kokoraja
- PDF-export ei saa paljastaa editorin sisäisiä hallintaelementtejä
- localStoragea ei käytetä pysyvään tuotantodataan

### 13.1 API-rajapintojen validointi ja rajoitukset (uusi)

AI-generoidussa koodissa yleisin tietoturvapuute on syötteiden validoinnin puuttuminen tai epäyhtenäisyys. Siksi määritellään pakolliseksi:

- **Kaikkien API-reittien syötteet validoidaan Zod-skeemalla** ennen käsittelyä. Validointivirhe palauttaa 400-vastauksen selkeällä virheviestillä, eikä virheellistä dataa koskaan tallenneta kantaan.
- **Auktorisointi tarkistetaan jokaisessa API-reitissä erikseen**, ei vain RLS:n varassa: reitti varmistaa, että kirjautunut käyttäjä omistaa resurssin, johon pyyntö kohdistuu. RLS on toinen puolustuskerros, ei ainoa.
- **OpenAI-reitille (`/api/ai/style-profile`) asetetaan rate limit** (esim. 10 kutsua / käyttäjä / tunti). Tämä estää sekä vahingossa tapahtuvan silmukkakutsumisen että kustannusten karkaamisen.
- **OpenAI-kustannuksia valvotaan:** OpenAI-tilille asetetaan kuukausittainen kulutusraja (hard limit), ja AI-kutsujen määrä logitetaan, jotta poikkeamat huomataan.
- **AI-vastausten validointi:** OpenAI:n palauttama JSON validoidaan samalla Zod-skeemalla kuin muukin data ennen tallennusta `style_profiles`-tauluun. AI-mallin vastaus voi olla virheellistä JSONia tai sisältää odottamattomia kenttiä — sitä käsitellään kuten mitä tahansa ulkoista, epäluotettavaa syötettä.

### 13.2 Virhemonitorointi MVP:ssä (uusi)

Alkuperäisessä määrittelyssä virhemonitorointi oli siirretty kaupalliseen vaiheeseen. AI-avusteisesti rakennetussa sovelluksessa se tarvitaan jo sisäisessä MVP:ssä, koska kukaan ei tunne koodia rivi riviltä eikä virheitä voi päätellä "muistista":

- Sentry (tai vastaava ilmainen taso) otetaan käyttöön vaiheessa 2 samalla kun Supabase-perusta rakennetaan.
- Sekä selainpuolen että palvelinpuolen virheet raportoidaan.
- PDF-exportin epäonnistumiset logitetaan erikseen, koska export on MVP:n ydintoiminto ja sen virheet ovat muuten vaikeasti toistettavissa.

Kaupalliseen käyttöön ennen julkaisua tarkastetaan lisäksi:

- tenant-eristys
- admin-roolit
- audit-loki
- varmuuskopiot
- palautusprosessi
- virhemonitorointi
- käyttöehtojen ja tietosuojan vaatimukset
- maksut ja laskutus, jos palvelu myydään SaaS-mallilla

## 14. Käyttöliittymävaatimukset

Sovelluksen tulee olla suunnittelijan työväline, ei markkinointisivu. Käyttöliittymän tulee olla rauhallinen, selkeä ja tehokas.

Yleiset vaatimukset:

- suomenkielinen käyttöliittymä
- selkeä sivunavigaatio
- suuri moodboard-työskentelyalue
- tuotepankki näkyvissä vain silloin, kun sitä tarvitaan
- työkalut eivät saa peittää moodboardia
- elementtien valinta ja skaalaus tuntuvat ennustettavilta
- PDF:n tulee näyttää asiakkaalle viimeistellyltä
- editorin hallintaelementit eivät näy PDF:ssä

Moodboardin oletustekstit nykyisessä prototyypissä:

- projektin otsikko: `Testiolohuone`
- asiakas: `Teppo Testiasiakas`

## 15. PDF-exportin vaatimukset

PDF-export on MVP:n ydintoiminto.

Vaatimukset:

- käyttäjä voi ladata valmiin moodboardin PDF-tiedostona
- PDF sisältää kaikki moodboardin sivut oikeassa järjestyksessä
- PDF:n sivukoko vastaa suunniteltua A4-vaakaformaattia
- tuotteiden kuvat, tekstit ja värit näkyvät oikein
- poistoraksit, valintakehykset ja editorin apuelementit eivät näy PDF:ssä
- tuotteen verkkokauppalinkki on mukana PDF:ssä joko klikattavana linkkinä tai selkeästi näkyvänä URL-osoitteena
- PDF:n visuaalisen tyylin tulee noudattaa liitteenä ollutta esimerkkimoodboardia

### 15.1 Tunnistettu tekninen riski: ulkoisten tuotekuvien CORS (uusi)

Tuotepankin kuvat ladataan ulkoisista URL-osoitteista (verkkokauppojen palvelimilta). Kun ulkoinen kuva piirretään canvas-elementille ilman CORS-lupaa, selain merkitsee canvasin "tainted"-tilaan, jolloin `toDataURL()`-kutsu — jota jsPDF-export tarvitsee — epäonnistuu kokonaan. Tämä on todennäköisin yksittäinen syy sille, että PDF-export hajoaa tuotantodatalla vaikka se toimii testidatalla.

**Vaadittu ratkaisu:**

- Ulkoisia tuotekuvia ei ladata canvasille suoraan alkuperäisestä URL-osoitteesta.
- Vaihtoehto A (suositeltu): kuvat välitetään oman API-reitin kautta (`/api/image-proxy`), joka hakee kuvan palvelinpuolella ja palauttaa sen samasta originista. Proxy hyväksyy vain tuotepankissa olevia kuva-URL-osoitteita (allowlist), jotta sitä ei voi käyttää avoimena välityspalvelimena.
- Vaihtoehto B: tuotekuvat kopioidaan CSV-importin yhteydessä Supabase Storageen, jolloin ne palvellaan hallitusta lähteestä. Tämä on kestävämpi ratkaisu myös siksi, että verkkokauppojen kuva-URL:t voivat lakata toimimasta.
- Valittu ratkaisu testataan E2E-testillä, jossa PDF-export ajetaan oikealla ulkoisella tuotekuvalla.

### 15.2 PDF-exportin muut vaatimukset (uusi)

- **Fontit:** PDF:ssä käytettävien fonttien tulee tukea suomen kieltä (ä, ö, å) myös upotettuina. jsPDF:n oletusfontit eivät kata kaikkia merkkejä — tarvittava fontti upotetaan eksplisiittisesti ja merkistö testataan.
- **Suorituskyky:** monisivuinen, kuvapainotteinen moodboard voi tuottaa hyvin suuren PDF:n. Kuville asetetaan järkevä maksimiresoluutio exportissa (esim. 150–200 dpi A4:lle), ja exportin aikana näytetään latausilmaisin.
- **Fallback:** jos selainpohjainen export osoittautuu epäluotettavaksi, varasuunnitelmana on palvelinpuolinen export (esim. Playwright/Puppeteer renderöi sivut ja tuottaa PDF:n). Tämä on jo huomioitu API-reittinä `/api/pdf/export`, mutta päätöskriteeri kirjataan: jos export epäonnistuu yli 2 %:ssa testiajoista tai tuotantokäytössä toistuvasti, siirrytään palvelinpuoliseen exportiin.

## 16. Tyylitesti

Tyylitesti toteutetaan erillisenä kokonaisuutena, mutta sen datan tulee liittyä asiakasprojektiin.

Tyylitestin tavoite:

- kerätä asiakkaan mieltymykset ennen suunnittelua
- nopeuttaa suunnittelijan työtä
- vähentää tulkinnanvaraa
- tuottaa asiakkaalle tunne osallistumisesta
- antaa suunnittelijalle selkeä brief

Mahdollisia kysymystyyppejä:

- kuvavalinnat eri sisustustyyleistä
- värimieltymykset
- materiaalimieltymykset
- inhokit ja vältettävät asiat
- budjettitaso
- lemmikit, lapset ja käytännön rajoitteet
- tilan käyttötarkoitus
- nykyiset ongelmat tilassa
- toivottu tunnelma

AI:n rooli tyylitestissä:

- tiivistää vastaukset suunnittelijalle
- tunnistaa tyylisuunnan
- ehdottaa avainsanoja
- ehdottaa värisuuntaa
- ehdottaa Tikkurila-värejä
- ehdottaa tuotepankin suodatuskriteerejä
- tuottaa suunnittelijalle lyhyen briefin

AI:n tuottama vastaus tulee tallentaa rakenteisena JSON-muodossa, ei pelkkänä tekstinä.

### 16.1 Tyylitestilinkin turvallisuus (uusi)

Reitti `/style-test/[token]` on sovelluksen ainoa kirjautumaton sisäänkäynti, joten sen tokenille määritellään vaatimukset jo nyt, vaikka asiakaslinkki toteutetaan myöhemmin:

- token generoidaan kryptografisesti satunnaisena (esim. 32 merkkiä, `crypto.randomUUID()` tai vastaava), ei arvattavana juoksevana numerona
- token vanhenee määräajassa (esim. 30 päivää) ja sen voi mitätöidä
- token oikeuttaa vain kyseisen tyylitestin täyttämiseen — ei mihinkään muuhun projektin dataan
- lomakkeen lähetyksiä rajoitetaan (rate limit), jotta julkista reittiä ei voi käyttää roskasyötteen massalähetykseen
- asiakkaiden henkilötiedot (`customer_name`, `customer_email`) ovat henkilötietoa: tietosuojan perusvaatimukset (tietojen poistomahdollisuus, minimointi) huomioidaan jo taulurakenteessa

Esimerkkirakenne:

```json
{
  "styleName": "Moderni lämmin skandinaavinen",
  "summary": "Asiakas pitää rauhallisesta, lämpimästä ja ajattomasta kokonaisuudesta.",
  "keywords": ["lämmin", "ajaton", "vaalea puu", "pehmeät tekstiilit"],
  "colorDirection": {
    "base": "lämmin vaalea",
    "accent": "murrettu vihreä",
    "avoid": ["kylmä harmaa", "voimakas punainen"]
  },
  "designerBrief": "Suosi vaaleaa puuta, pehmeitä luonnonmateriaaleja ja rauhallista kontrastia."
}
```

## 17. AI-visualisointi

AI-visualisointi ei kuulu tämänhetkiseen MVP:hen.

Se voidaan lisätä myöhemmin wow-ominaisuutena asiakkaalle. Mahdollinen toteutustapa:

- asiakas lataa kuvan nykyisestä huoneesta
- suunnittelija valitsee moodboardin tuotteet ja värimaailman
- AI tuottaa havainnekuvan suunnitelman tunnelmasta
- havainnekuva merkitään selvästi inspiraatiokuvaksi, ei tekniseksi lupaukseksi lopputuloksesta

AI-visualisoinnin toteutus vaatii erillisen tietoturva- ja laatukatselmoinnin, koska siinä käsitellään asiakkaan kuvia.

## 18. Ei kuulu MVP:hen

Seuraavat rajataan pois ensimmäisestä sisäisestä MVP:stä:

- maksut ja laskutus
- julkinen rekisteröityminen
- kaupallinen SaaS-onboarding
- asiakkaan oma portaali
- varastosaldot
- täysi admin-paneeli
- tuotefeedien automaattinen ajastus
- Google Merchant Center -integraatio
- taustanpoisto
- AI-kuvagenerointi
- oma pohjakuvaeditori
- monimutkainen organisaatio- ja tiimimalli

Nämä voidaan toteuttaa myöhemmin, jos sisäinen MVP osoittautuu hyödylliseksi.

## 19. Ehdotettu sovellusrakenne

### Reitit

- `/login`
  - kirjautuminen
- `/projects`
  - suunnittelijan projektit
- `/projects/new`
  - uusi projekti
- `/projects/[projectId]/moodboard`
  - moodboard-editori
- `/projects/[projectId]/style-test`
  - tyylitestin vastaukset ja AI-brief
- `/style-test/[token]`
  - myöhempi asiakaslinkki tyylitestiin

### API-reitit

- `/api/products/import-csv`
  - CSV-tuotteiden tuonti tuotepankkiin
- `/api/paint-colors/import-csv`
  - Tikkurila-värien tuonti
- `/api/ai/style-profile`
  - tyylitestin AI-tulkinta
- `/api/pdf/export`
  - myöhemmässä vaiheessa palvelinpuolinen PDF-export, jos selainpohjainen export ei riitä

### Pääkomponentit

- `EditorShell`
  - editorin kokonaisrakenne
- `MoodboardCanvas`
  - canvas ja elementit
- `PageNavigator`
  - sivujen vaihto ja lisäys
- `ProductBank`
  - tuotteiden haku ja lisääminen
- `ProductCard`
  - tuotteen esitys tuotepankissa
- `ElementInspector`
  - valitun elementin asetukset
- `ColorSurfaceTool`
  - värit ja pinnat
- `FloorplanUpload`
  - pohjakuvan lisäys
- `StyleTestForm`
  - asiakkaan tyylitesti
- `StyleProfilePanel`
  - AI:n tuottama suunnittelijabrief

## 20. Toteutusjärjestys

### Vaihe 0: AI-kehityksen perusta (uusi)

Ennen varsinaista kehitystyötä pystytetään rakenteet, jotka tekevät AI-avusteisesta kehityksestä hallittua:

- luodaan `CLAUDE.md`-ohjetiedosto (ks. luku 4.1)
- luodaan `TYOLOKI.md`-pohja
- pystytetään GitHub Actions CI-putki: lint, typecheck, build
- lisätään Vitest ja Playwright projektiin sekä yksi esimerkkitesti kumpaakin, jotta putki on todistetusti toimiva
- sovitaan haarakäytäntö: feature-haarat ja PR-katselmointi
- lukitaan riippuvuuksien versiot lock-tiedostolla ja sovitaan, että AI ei päivitä riippuvuuksia ilman erillistä päätöstä

### Vaihe 1: Prototyypin stabilointi

- varmistetaan, että nykyinen editori toimii selaimessa
- korjataan tuotekuvien näkyminen ja skaalaus
- varmistetaan tekstien asettelu
- varmistetaan PDF-export
- poistetaan keskeneräiset ominaisuudet, joita ei käytetä

### Vaihe 2: Supabase-perusta

- luodaan Supabase-projekti
- **tietokantamuutokset tehdään alusta asti migraatiotiedostoina** (Supabase CLI, `supabase/migrations/`), ei käsin dashboardista — näin skeema on versionhallinnassa, muutoshistoria säilyy ja AI voi lukea skeeman nykytilan repositoriosta (uusi)
- lisätään Auth
- lisätään tietokantataulut
- lisätään RLS-politiikat
- **kirjoitetaan RLS-testit** (käyttäjä A ei näe käyttäjän B dataa) (uusi)
- lisätään Storage-bucketit
- **otetaan Sentry-virhemonitorointi käyttöön** (uusi)
- **luodaan `.env.example`-tiedosto, jossa kaikki tarvittavat ympäristömuuttujat dokumentoituina ilman arvoja** (uusi)
- **luodaan seed-skripti, joka täyttää kehitysympäristön testidatalla (testikäyttäjä, esimerkkiprojekti, tuotteet)** — ilman tätä jokainen kehitys- ja testi-istunto alkaa tyhjästä kannasta (uusi)
- siirretään projektien tallennus localStoragesta Supabaseen

### Vaihe 3: Projektit ja käyttäjäkohtaisuus

- lisätään projektin luonti
- lisätään projektien listaus
- yhdistetään moodboard projektiin
- varmistetaan, että käyttäjä näkee omat projektinsa

### Vaihe 4: Tuotepankki tietokantaan

- tuodaan `tuotelista-muokattu.csv` Supabaseen
- näytetään tuotteet tietokannasta
- lisätään manuaalinen tuotteen lisäys
- tallennetaan manuaaliset tuotteet yhteiseen tuotepankkiin

### Vaihe 5: Tikkurila-värit tietokantaan

- tuodaan `tikkurila_tunne_vari_2020.csv` Supabaseen
- rakennetaan värien haku
- viimeistellään värit ja pinnat -sivu

### Vaihe 6: Tyylitesti

- rakennetaan tyylitestin lomake
- tallennetaan vastaukset projektille
- lisätään AI-tulkinta
- näytetään suunnittelijalle AI:n luoma brief

### Vaihe 7: Sisäisen MVP:n viimeistely

- testataan käyttöpolut
- viimeistellään PDF
- lisätään virheviestit
- lisätään lataustilat
- kirjoitetaan ylläpitodokumentaatio
- julkaistaan Verceliin

## 21. Testattavat käyttöpolut

Sisäisen MVP:n hyväksyntää varten testataan vähintään nämä polut:

1. Suunnittelija kirjautuu sisään.
2. Suunnittelija luo uuden projektin.
3. Suunnittelija avaa moodboard-editorin.
4. Suunnittelija lisää tuotteen tuotepankista.
5. Tuotekuva näkyy moodboardissa.
6. Tuotetiedot näkyvät siististi kuvan alla.
7. Suunnittelija siirtää ja skaalaa tuotetta.
8. Tuotteen kuvasuhde säilyy.
9. Suunnittelija poistaa tuotteen poistoraksista.
10. Poistorasti ei näy PDF:ssä.
11. Suunnittelija lisää tekstin.
12. Suunnittelija lisää oman kuvan.
13. Suunnittelija lisää pohjakuvan.
14. Suunnittelija valitsee Tikkurila-värin.
15. Suunnittelija lisää uuden tuotesivun.
16. Moodboard tallentuu.
17. Moodboard avautuu uudelleen kirjautumisen jälkeen.
18. Suunnittelija lataa PDF:n.
19. Toinen käyttäjä ei pääse projektiin ilman oikeutta.
20. Tyylitesti tallentuu projektille.
21. AI-brief muodostuu tyylitestin vastauksista.

## 22. Hyväksymiskriteerit MVP:lle

MVP voidaan katsoa valmiiksi sisäiseen käyttöön, kun:

- kirjautuminen toimii
- projektit tallentuvat Supabaseen
- moodboard tallentuu Supabaseen
- autosave toimii ja tallennuksen tila näkyy käyttäjälle (uusi)
- käyttäjäkohtaiset oikeudet toimivat
- RLS-testit menevät läpi automaattisesti (uusi)
- tuotepankki toimii Supabasesta
- CSV-tuotteet on tuotu tuotepankkiin
- manuaalinen tuotelisäys toimii
- Tikkurila-väridata toimii
- pohjakuvan upload toimii
- PDF-export toimii luotettavasti, myös ulkoisilla tuotekuvilla ja ä/ö-merkeillä (täydennetty)
- editorin perustoiminnot toimivat ilman kriittisiä bugeja
- tyylitestin ensimmäinen versio toimii
- AI-tulkinta toimii server-puolen API:n kautta ja sen vastaus validoidaan (täydennetty)
- CI-putki ajaa lintin, tyyppitarkistuksen ja testit jokaisessa PR:ssä (uusi)
- kriittiset käyttöpolut on automatisoitu E2E-testeiksi (uusi)
- virhemonitorointi on käytössä (uusi)
- tietokantaskeema on migraatiotiedostoina versionhallinnassa (uusi)
- sovellus on julkaistu Verceliin
- ympäristömuuttujat on dokumentoitu (`.env.example`)
- projektissa on selkeä jatkokehitysdokumentaatio (`CLAUDE.md`, `TYOLOKI.md`)

## 23. Ylläpito ja jatkokehitys

Sisäisessä käytössä AI-operaattori voi ylläpitää sovellusta, jos muutokset ovat rajattuja ja testattavissa.

AI-operaattorille sopivia ylläpitotehtäviä:

- käyttöliittymän pienet muutokset
- tekstimuutokset
- pienten bugien korjaus
- CSV-importin päivitykset
- yksinkertaiset uudet kentät
- PDF-layoutin hienosäätö
- tyylitestin kysymysten muokkaus

Senior-kehittäjän katselmointia vaativia tehtäviä:

- käyttöoikeuksien muutokset
- tietokannan rakenteelliset muutokset
- julkiset asiakaslinkit
- maksut ja laskutus
- integraatiot ulkoisiin järjestelmiin
- tuotefeedien automaatio
- kaupallinen julkaisu
- tietoturvaan liittyvät muutokset
- suorituskykyongelmat
- varmuuskopiointi ja palautus

## 24. Tärkeimmät tekniset periaatteet

- Älä sido sovelluksen ydindataa selaimen localStorageen.
- Älä altista API-avaimia selaimeen.
- Älä rakenna kaupallista SaaS-palvelua ilman senior-katselmointia.
- Pidä editorin data rakenteisena JSONina.
- Pidä tuotedata erillään moodboardin elementtidatasta.
- Pidä ladatut tiedostot Supabase Storagessa.
- Käytä RLS-politiikkoja heti alusta.
- Tee sisäinen MVP riittävän hyvin, mutta älä rakenna liian raskasta SaaS-koneistoa liian aikaisin.
- AI ei muuta tietokantaskeemaa, RLS-politiikkoja tai `canvas_json`-rakennetta ilman ihmisen hyväksyntää. (uusi)
- Jokainen uusi ominaisuus tuo mukanaan omat testinsä samassa PR:ssä. (uusi)
- Validoi kaikki syötteet — myös AI-mallin tuottamat vastaukset — ennen tallennusta. (uusi)
- Tietokantamuutokset tehdään vain migraatiotiedostoina, ei käsin dashboardista. (uusi)
- Versioi `canvas_json`-rakenne ja kirjoita migraatiot vanhalle datalle. (uusi)

## 25. Tiivistelmä

Sisustusappin ensimmäinen tavoite on sisäinen MVP, jolla suunnittelijat voivat tehdä asiakkaille viimeisteltyjä moodboard-PDF:iä nopeasti ja yhdenmukaisesti.

Toteutus kannattaa rakentaa nykyisen Next.js-prototyypin päälle, mutta tallennus, käyttäjähallinta ja tiedostot tulee siirtää Supabaseen. Näin sisäinen MVP on turvallisempi ja ylläpidettävämpi, ja siitä voidaan myöhemmin kehittää kaupallinen palvelu ilman, että koko sovellusta tarvitsee rakentaa uudelleen.

AI-avusteinen toteutustapa sopii tähän hyvin, kunhan vaatimukset, testaus ja palveluiden yhdistäminen tehdään järjestelmällisesti. Kaupallinen versio vaatii ennen julkaisua senior-kehittäjän katselmoinnin.
