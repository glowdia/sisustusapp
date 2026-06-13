# Sisustussuunnittelijoiden Moodboard-sovellus

## Tavoite

Rakennetaan suomenkielinen web-sovellus sisustussuunnittelijoille. Sovelluksella suunnittelija voi luoda asiakkaalle A4-vaakaformaattiin perustuvan monisivuisen moodboardin, lisätä siihen tuotteita yhteisesta tuotepankista, valita Tikkurila-varikartan mukaisia pintavareja, liittaa pohjakuvan ja ladata lopputuloksen klikattavat verkkokauppalinkit sisaltavana PDF-tiedostona.

Visuaalinen tavoite on jaljitella projektin liitteen `Premium_esimerkki_290618.pdf` layoutia ja tunnelmaa.

## Kayttajat ja rajaukset

### Kayttajat

- Ensimmainen kayttajarooli on `suunnittelija`.
- Sovellus tukee monia suunnittelijoita omilla tunnuksillaan.
- Jokainen suunnittelija nakee omat projektinsa ja moodboardinsa.
- Yhteinen tuotepankki on kaikkien suunnittelijoiden kaytossa.

### Myohempaan vaiheeseen

- Admin-rooli.
- Maksullisuus, tilaukset ja tiimit.
- Tuotefeed/API-integraatio.
- Pohjakuvan oma editori.
- Tuotekuvien automaattinen taustanpoisto.
- Asiakkaalle jaettava selainlinkki.

## MVP:n toiminnallisuudet

### Autentikointi

- Suunnittelija kirjautuu sahkopostilla ja salasanalla.
- Kayttajakohtainen data suojataan tietokantatasolla.

### Projektit

Projektilla on vahintaan:

- projektin nimi
- asiakkaan nimi
- kohteen osoite
- suunnittelijan nimi
- paivamaara
- vapaamuotoinen kuvaus tai sisainen muistiinpano

### Moodboard

- Moodboard kuuluu projektiin.
- Moodboard on aina A4 landscape.
- Moodboard voidaan tallentaa ja avata uudelleen.
- Moodboard voidaan ladata PDF-tiedostona.
- PDF:n verkkokauppalinkkien tulee olla klikattavia.

### Sivurakenne

Pakolliset sivut:

1. Otsikkosivu
2. Suunnittelijan terveiset
3. Varit ja pinnat
4. Pohjakuva

Lisattavat tuotesivut:

- Huonekalut ja valaisimet
- Tekstiilit ja somisteet

Tuotesivuja voi luoda useita tarpeen mukaan.

### Editorin periaate

Sovellus ei ole taydellinen vapaa piirto-ohjelma vaan template-pohjainen moodboard-editori.

- Otsikkosivulla, suunnittelijan terveisissa, varit ja pinnat -sivulla seka pohjakuvalla on valmiita kohtia.
- Tuotesivuilla tuotteiden, tekstien ja kuvien paikat ovat vapaasti muokattavia.
- Elementteja voi siirtaa, skaalata, jarjestaa kerroksiin ja poistaa.
- Sivun nakyma skaalautuu selaimessa, mutta sisainen koordinaatisto pysyy A4-vaakaformaatissa.

### Tuotepankki

Tuotepankki on yhteinen kaikille suunnittelijoille.

- CSV:sta tuodut tuotteet tulevat yhteiseen pankkiin.
- Manuaalisesti lisatty tuote tulee heti kaikkien kayttoon.
- Tuotteen voi lisata moodboardin tuotesivulle.

Tuotteen tavoiteskeema:

- nimi
- kategoria
- vari
- hinta
- mitat
- verkkokauppalinkki
- tuotekuva
- lahde: `csv`, `manual`, myohemmin `feed`
- lisaaja
- luontiaika

Tuoteimportin ensisijainen tiedosto on `tuotelista-muokattu.csv`.

Nykyinen `tuotelista-muokattu.csv` sisaltaa sarakkeet:

- tuotteen nimi
- kategoria
- vari
- hinta
- mitat
- tuotekuvan url
- tuotesivun url

CSV:n `tuotekuvan url` mapataan `products.image_url`-kenttaan ja `tuotesivun url` mapataan `products.product_url`-kenttaan.

### Manuaalinen tuote-upload

Suunnittelija voi lisata tuotteen lomakkeella:

- nimi
- kategoria
- vari
- hinta
- mitat
- verkkokauppalinkki
- kuva-upload

Taustanpoisto ei kuulu ensimmaiseen versioon.

### Tikkurila-varit

Projektissa on varidata tiedostossa `tikkurila_tunne_vari_2020.csv`.

CSV:n nykyiset sarakkeet:

- Koodi
- Nimi
- HEX

Vareja on 217 kappaletta datariveina. Osa HEX-arvoista on `N/A`, joten kayttoliittymassa pitaa kasitella puuttuva variarvo hallitusti.

Varit ja pinnat -sivulla suunnittelija voi valita Tikkurila-varin esimerkiksi:

- seinat
- katto
- lattia
- tehosteseina
- listat
- muut pinnat

Varivalitsimessa naytetaan:

- varikoodi
- varin nimi
- HEX-swatch, jos saatavilla

### Pohjakuva

- Kayttaja voi uploadata PDF:n tai kuvan.
- Ensimmainen versio tukee uploadatun pohjakuvan sijoittelua ja skaalausta moodboard-sivulle.
- PDF:n ensimmainen sivu voidaan nayttaa kuvana tai tallentaa liitteena riippuen toteutustavasta.

## Tekninen ratkaisu

### Frontend

- Next.js
- TypeScript
- App Router
- Tailwind CSS
- shadcn/ui
- React Konva canvas-editoriin

Perustelu: Next.js sopii GitHub/Vercel-tyonkulkuun, React Konva sopii vapaasti siirreltaviin moodboard-elementteihin, ja Tailwind + shadcn nopeuttaa laadukkaan suomenkielisen kayttoliittyman rakentamista.

### Backend ja data

- Supabase Auth
- Supabase Postgres
- Supabase Storage
- Supabase Row Level Security

Perustelu: Supabase tarjoaa kirjautumisen, tietokannan ja tiedostot samassa kokonaisuudessa. Kayttajakohtaiset projektit voidaan suojata RLS-saannoilla, mutta tuotepankki voidaan pitaa yhteisena.

### Deploy

- GitHub repository
- Vercel preview deploy PR:ille
- Vercel production deploy `main`-branchista

### PDF-export

PDF-export toteutetaan niin, etta visuaalinen lopputulos pysyy mahdollisimman lahella editorin nakymaa.

Ehdotettu toteutus:

1. Moodboard-sivut renderoidaan korkearesoluutioisiksi sivukuviksi.
2. Sivukuvat kootaan A4 landscape -PDF:ksi.
3. Tuote-elementtien sijainneista luodaan PDF:aan klikattavat linkkialueet.
4. PDF palautetaan latauksena ja voidaan tallentaa Supabase Storageen.

## Tietokantaluonnos

### profiles

- id
- email
- full_name
- role: `designer`
- created_at

### projects

- id
- owner_id
- name
- client_name
- site_address
- designer_name
- project_date
- description
- created_at
- updated_at

### moodboards

- id
- project_id
- title
- format: `a4_landscape`
- created_at
- updated_at

### moodboard_pages

- id
- moodboard_id
- page_type
- title
- sort_order
- canvas_json
- created_at
- updated_at

### moodboard_elements

Vaihtoehto: elementit voidaan tallentaa erillisina riveina tai osana `canvas_json`-kenttaa. MVP:ssa suositus on tallentaa sivun elementit `canvas_json`-kenttaan, koska editorin tilan palautus on suoraviivaisempaa.

Elementin JSON-rakenne:

- id
- type: `product`, `text`, `image`, `color_swatch`, `floorplan`
- x
- y
- width
- height
- rotation
- zIndex
- locked
- productId
- uploadId
- text
- style
- linkUrl

### products

- id
- name
- category
- color
- price_text
- dimensions_text
- product_url
- image_url
- source
- created_by
- created_at
- updated_at

### paint_colors

- id
- brand
- code
- name
- hex
- collection
- created_at

### uploads

- id
- owner_id
- storage_path
- file_name
- mime_type
- file_size
- purpose
- created_at

### pdf_exports

- id
- moodboard_id
- storage_path
- created_by
- created_at

## Kayttooikeusperiaatteet

- Suunnittelija saa lukea ja muokata vain omia projektejaan.
- Suunnittelija saa lukea kaikkia tuotteita.
- Suunnittelija saa lisata tuotteita yhteiseen tuotepankkiin.
- Tuotteiden poisto tai piilotus voidaan rajata myohemmin adminille.
- Tikkurila-varit ovat kaikille luettavia.

## CSV-import

### Tuotteet

Tiedosto: `tuotelista-muokattu.csv`

- Erotin: puolipiste
- Mahdollinen UTF-8 BOM huomioitava
- Mitat-kentassa on puolipisteita lainausmerkkien sisalla
- Sarakkeet: `tuotteen nimi`, `kategoria`, `vari`, `hinta`, `mitat`, `tuotekuvan url`, `tuotesivun url`

Importissa tarvitaan kunnollinen CSV-parseri, ei kasin splitattua merkkijonoa.

### Varit

Tiedosto: `tikkurila_tunne_vari_2020.csv`

- Erotin: pilkku
- Sarakkeet: `Koodi`, `Nimi`, `HEX`
- `N/A` kasitellaan tyhjana HEX-arvona

## UI-rakenne

### Paanakyma

- Projektit-lista
- Uusi projekti
- Avaa projekti

### Projektinakyma

- Projektin tiedot
- Moodboardit
- Luo moodboard
- Avaa editori

### Editorinakyma

- Vasen paneeli: sivut ja tuotepankki
- Keskiosa: A4-vaaka canvas
- Oikea paneeli: valitun elementin asetukset
- Ylapalkki: tallenna, esikatsele PDF, lataa PDF

### Tuotepankki

- Haku
- Kategoriafiltteri
- Varifiltteri
- Tuotteen lisays moodboardille
- Uusi manuaalinen tuote
- CSV-import kehitysvaiheessa tai rajattuna sisaiseksi toiminnoksi

### Varit ja pinnat

- Tikkurila-varihaku koodilla tai nimella
- Swatch-lista
- Pintakohtaiset valinnat
- Puuttuvan HEX-arvon tilalla neutraali placeholder

## Toteutusjarjestys

1. Next.js-projektin alustus ja perus-UI.
2. Supabase-konfiguraatio, Auth ja RLS-pohja.
3. Tietokantamigraatiot.
4. Tuote- ja varidataimportit CSV-tiedostoista.
5. Projektien CRUD.
6. Moodboardien CRUD.
7. A4 landscape canvas-editorin perusrunko.
8. Sivutyypit ja sivujen lisays.
9. Tuotteiden lisays canvasille.
10. Tekstielementtien lisays ja muokkaus.
11. Varit ja pinnat -sivu Tikkurila-datalla.
12. Pohjakuva-upload ja skaalaus.
13. Manuaalinen tuote-upload yhteiseen tuotepankkiin.
14. PDF-export klikattavilla linkeilla.
15. Visuaalinen viimeistely liitteen layoutin mukaan.
16. Vercel-deploy ja ymparistomuuttujat.

## Riskit ja tekniset huomiot

- PDF-export on teknisesti kriittisin osa, koska sen pitaa olla seka visuaalisesti tarkka etta sisaltaa klikattavat linkit.
- Tikkurila-datassa on puuttuvia HEX-arvoja.
- Yhteinen tuotepankki ilman admin-hyvaksyntaa voi likaantua nopeasti, mutta tama on tietoinen MVP-paatos.
- Taustanpoiston poisjatto helpottaa ensimmaista versiota merkittavasti.

## Avoimet asiat ennen koodausta

1. Kaytetaanko PDF-exportissa heti tallennusta Supabase Storageen vai riittaako lataus selaimeen?
2. Luodaanko ensimmaisessa versiossa vain yksi moodboard per projekti vai sallitaanko useita?
3. Tarvitaanko projektin kopiointi tai moodboardin duplikointi MVP:ssa?
4. Tehdaanko CSV-import vain kehittajan ajamana seed-scriptina vai suunnittelijan kayttoliittymasta?
